import fs from 'fs';
import path from 'path';
import { Writable } from 'stream';
import * as Minio from 'minio';
import pino from 'pino'

import prisma from "~/lib/prisma";
import sfetch from '~/server/utils/server_fetch'
import parseTriplet from "~/server/utils/triplet_parser";
import { HttpProxyAgent } from "~/server/utils/request_proxy"
import { ListObjectsV2 } from '~/server/utils/minio';

export default defineTask({
  meta: {
    name: 'sync_beta_channel',
    description: 'Sync Client Installers from MAA Beta Channel',
  },
  async run({ payload }) {
    const uuid = crypto.randomUUID();

    const s3Bucket = 'maaassistantarknights'
    const s3Prefix = 'MaaAssistantArknights/MaaAssistantArknights/releases/download'

    const trigger = payload.trigger as string | undefined

    if (!fs.existsSync(`./logs/task_sync_beta_channel`)) {
      fs.mkdirSync(`./logs/task_sync_beta_channel`, { recursive: true });
    }

    const logger = pino({
      name: `Task - Sync Beta Channel`,
      transport: {
        targets: [
          {
            target: 'pino-pretty',
            level: 'info',
            options: { colorize: true, translateTime: 'SYS:standard' },
          },
          {
            target: 'pino-pretty',
            level: 'info',
            options: { destination: `./logs/task_sync_beta_channel/${uuid}.log`, colorize: false, translateTime: 'SYS:standard' },
          },
        ]
      }
    })

    try {
      logger.info('Step 1. Check required variables')
      const requiredEnvKeys = [
        'GITHUB_TOKEN',
        'S3_ENDPOINT',
        'S3_REGION',
        'S3_ACCESS_KEY',
        'S3_SECRET_KEY',
      ]
      for (const key of requiredEnvKeys) {
        if (!process.env[key]) {
          throw new Error(`${key} is not set`)
        }
      }

      logger.info('Step 2. Create S3 Client')
      const uri = new URL(process.env.S3_ENDPOINT!)
      const mc = new Minio.Client({
        endPoint: uri.hostname,
        port: uri.port ? parseInt(uri.port) : (uri.protocol === 'https:' ? 443 : 80),
        useSSL: uri.protocol === 'https:',
        region: process.env.S3_REGION!,
        accessKey: process.env.S3_ACCESS_KEY!,
        secretKey: process.env.S3_SECRET_KEY!,
      })

      logger.info('Step 3. Get the latest version from the API')
      const versionApiResponse = await sfetch('https://api.github.com/repos/MaaAssistantArknights/MaaAssistantArknights/releases') as GitHub.Release[]
      if (!versionApiResponse) {
        throw new Error('Failed to fetch the latest version from the API')
      }

      logger.info('Step 4. Filter the latest beta version')
      const latestBetaVersion = versionApiResponse
        .filter((release) => release.tag_name.includes('beta'))
        .sort((a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime())[0]
      if (!latestBetaVersion) {
        throw new Error('Failed to find the latest beta version')
      }

      logger.info('Step 5. Get download URLs of beta version packages')
      const assets = latestBetaVersion.assets
        .filter((asset) => parseTriplet(asset.name)) // Remove non-client packages

      logger.info(`--- Got ${assets.length} items`)

      logger.info('Step 6. Create or update version in the database')
      const version = await prisma.version.upsert({
        create: {
          display: latestBetaVersion.tag_name,
          releaseDate: latestBetaVersion.published_at,
          channel: 'BETA',
        },
        update: {
          releaseDate: latestBetaVersion.published_at,
          channel: 'BETA',
        },
        where: {
          display: latestBetaVersion.tag_name,
        }
      })

      logger.info('Step 7. Check S3 for existing files')
      const listResponse = await ListObjectsV2(mc, s3Bucket, `${s3Prefix}/${latestBetaVersion.tag_name}/`)

      const existingFiles = listResponse.map((item) => {
        return {
          name: item.name?.split('/').pop() || '',
          size: item.size,
        }
      }) || []

      // 选出不存在的或者大小不一致的文件
      const needDownloadAssets = assets.filter((asset) => {
        return asset.size !== existingFiles.find(f => f.name === asset.name)?.size
      })

      // 已经存在且大小相同的文件，更新其数据
      const existingAssets = assets.filter((asset) => {
        return asset.size === existingFiles.find(f => f.name === asset.name)?.size
      })

      existingAssets.forEach(async (asset) => {
        const triplet = parseTriplet(asset.name)
        const pkg = await prisma.package.upsert({
          create: {
            downloadUrl: asset.url,
            triplet: triplet,
            versionId: version.id,
            nodeId: asset.node_id,
            fileName: asset.name,
            s3Url: `${process.env.S3_ENDPOINT}/${s3Bucket}/${s3Prefix}/${latestBetaVersion.tag_name}/${asset.name}`,
          },
          update: {
            downloadUrl: asset.url,
            triplet: triplet,
            versionId: version.id,
            fileName: asset.name,
            s3Url: `${process.env.S3_ENDPOINT}/${s3Bucket}/${s3Prefix}/${latestBetaVersion.tag_name}/${asset.name}`,
          },
          where: {
            nodeId: asset.node_id
          },
        })
        const sync = await prisma.packageSync.upsert({
          create: {
            packageId: pkg.id,
          },
          update: {
          },
          where: {
            packageId: pkg.id,
          }
        })
        await prisma.job.create({
          data: {
            status: 'COMPLETED',
            syncId: sync.id,
            taskSlug: 'sync_beta_channel',
            logFile: `./logs/task_sync_beta_channel/${uuid}.log`,
            triggeredBy: trigger,
            startedAt: new Date(),
            finishedAt: new Date(),
          }
        })
      })

      logger.info(`--- Already synced ${existingAssets.length} items`)
      logger.info(`--- Need to download ${needDownloadAssets.length} items`)

      logger.info('Step 8. Create or update packages in the database')
      const transferProgress = needDownloadAssets.map((asset) => ({
        jobId: -1,
        syncId: -1,
        filename: asset.name,
        browser_download_url: asset.browser_download_url,
        downloaded: false,
        uploaded: false,
        error: false,
        errorMessage: '',
      }))

      for (const asset of needDownloadAssets) {
        const triplet = parseTriplet(asset.name)
        const pkg = await prisma.package.upsert({
          create: {
            downloadUrl: asset.url,
            triplet: triplet,
            versionId: version.id,
            nodeId: asset.node_id,
            fileName: asset.name,
            s3Url: `${process.env.S3_ENDPOINT}/${s3Bucket}/${s3Prefix}/${latestBetaVersion.tag_name}/${asset.name}`,
          },
          update: {
            downloadUrl: asset.url,
            triplet: triplet,
            versionId: version.id,
            fileName: asset.name,
            s3Url: `${process.env.S3_ENDPOINT}/${s3Bucket}/${s3Prefix}/${latestBetaVersion.tag_name}/${asset.name}`,
          },
          where: {
            nodeId: asset.node_id,
          }
        })
        const sync = await prisma.packageSync.upsert({
          create: {
            packageId: pkg.id,
          },
          update: {
          },
          where: {
            packageId: pkg.id,
          }
        })

        const job = await prisma.job.create({
          data: {
            status: 'PENDING',
            syncId: sync.id,
            taskSlug: 'sync_beta_channel',
            logFile: `./logs/task_sync_beta_channel/${uuid}.log`,
            triggeredBy: trigger,
          }
        })

        transferProgress.find((item) => item.filename === asset.name)!.jobId = job.id
        transferProgress.find((item) => item.filename === asset.name)!.syncId = sync.id
      }

      logger.info('Step 9. Transfer packages')
      // make sure the directory exists
      const downloadDir = path.join(process.cwd(), `downloads/${version.display}`)
      if (!fs.existsSync(downloadDir)) {
        fs.mkdirSync(downloadDir, { recursive: true })
      }
      await Promise.all(transferProgress.map((transfer) => {
        // eslint-disable-next-line no-async-promise-executor
        return new Promise(async (resolve) => {
          await prisma.job.update({
            where: {
              id: transfer.jobId,
            },
            data: {
              status: 'IN_PROGRESS',
              startedAt: new Date(),
            }
          })
          const fileResponse = await $fetch.raw(
            transfer.browser_download_url,
            {
              method: 'GET',
              responseType: 'stream',
              headers: {
                'Authorization': `Bearer ${process.env.GITHUB_TOKEN}`,
              },
              dispatcher: HttpProxyAgent,
            }
          )
          const writeStream = fs.createWriteStream(path.join(downloadDir, transfer.filename))
          fileResponse.body?.pipeTo(Writable.toWeb(writeStream))
          writeStream.on('finish', async () => {
            transferProgress.find((item) => item.filename === transfer.filename)!.downloaded = true
            resolve(true)
          })
          writeStream.on('error', async (err) => {
            logger.error('Error writing file:', err)
            await prisma.job.update({
              where: {
                id: transfer.jobId,
              },
              data: {
                status: 'ERROR',
                finishedAt: new Date(),
              }
            })
            transferProgress.find((item) => item.filename === transfer.filename)!.error = true
            transferProgress.find((item) => item.filename === transfer.filename)!.errorMessage = err.message
            // 防止其他下载任务被终止
            resolve(true)
          })
        })
      }))

      logger.info('Step 10. Upload to S3')

      await Promise.all(transferProgress.filter((transfer) => transfer.downloaded)
        .map(async (transfer) => {
          const filePath = path.join(downloadDir, transfer.filename)

          return mc.putObject(
            s3Bucket,
            `${s3Prefix}/${latestBetaVersion.tag_name}/${transfer.filename}`,
            fs.createReadStream(filePath),
          )
            .then(async () => {
              logger.info(`--- Uploaded ${transfer.filename} to S3`)
              await prisma.job.update({
                where: {
                  id: transfer.jobId,
                },
                data: {
                  status: 'COMPLETED',
                  finishedAt: new Date(),
                }
              })
            })
            .catch(async (err) => {
              logger.error('Error uploading file:', err)
              await prisma.job.update({
                where: {
                  id: transfer.jobId,
                },
                data: {
                  status: 'ERROR',
                  finishedAt: new Date(),
                }
              })
            })
        }))

    } catch (e) {
      logger.error('--- Task Aborted:')
      logger.error(e)
      return { result: 'error' }
    }

    return { result: 'success' }
  }
})
