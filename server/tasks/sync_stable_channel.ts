// TODOS:
// 1. Add a file logger
// 2. typo
// 3. upload to s3

import fs from 'fs';
import path from 'path';
import { Writable } from 'stream';
import * as Minio from 'minio';

import prisma from "~/lib/prisma";
import sfetch from '~/server/utils/server_fetch'
import parseTriplet from "~/server/utils/triplet_parser";
import { HttpProxyAgent } from "~/server/utils/request_proxy"
import { ListObjectsV2 } from '~/server/utils/minio';

export default defineTask({
  meta: {
    name: 'sync_stable_channel',
    description: 'Sync Client Installers from MAA Stable Channel',
  },
  async run() {
    try {
      console.log('Step 1. Check required variables')
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

      console.log('Step 2. Create S3 Client')
      const uri = new URL(process.env.S3_ENDPOINT!)
      const mc = new Minio.Client({
        endPoint: uri.hostname,
        port: uri.port ? parseInt(uri.port) : (uri.protocol === 'https:' ? 443 : 80),
        useSSL: uri.protocol === 'https:',
        region: process.env.S3_REGION!,
        accessKey: process.env.S3_ACCESS_KEY!,
        secretKey: process.env.S3_SECRET_KEY!,
      })

      console.log('Step 3. Get the latest version from the API')
      const versionApiResponse = await sfetch('https://api.github.com/repos/MaaAssistantArknights/MaaAssistantArknights/releases') as GitHub.Release[]
      if (!versionApiResponse) {
        throw new Error('Failed to fetch the latest version from the API')
      }

      console.log('Step 4. Filter the latest stable version')
      const latestStableVersion = versionApiResponse
        .filter((release) => release.prerelease === false)
        .sort((a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime())[0]
      if (!latestStableVersion) {
        throw new Error('Failed to find the latest stable version')
      }

      console.log('Step 5. Get download URLs of stable version packages')
      const assets = latestStableVersion.assets
        .filter((asset) => parseTriplet(asset.name)) // Remove non-client packages
  
      console.log(`--- Got ${assets.length} items`)
      console.log(assets)

      console.log('Step 6. Create or update version in the database')
      const version = await prisma.version.upsert({
        create: {
          display: latestStableVersion.tag_name,
          releaseDate: latestStableVersion.published_at,
          channel: 'STABLE',
        },
        update: {
          releaseDate: latestStableVersion.published_at,
          channel: 'STABLE',
        },
        where: {
          display: latestStableVersion.tag_name,
        }
      })

      console.log('Step 7. Check S3 for existing files')
      const listResponse = await ListObjectsV2(mc, 'maaassistantarknights', `MaaAssistantArknights/MaaAssistantArknights/releases/download/${latestStableVersion.tag_name}/`)

      const existingFiles = listResponse.map((item) => {
        return {
          name: item.name?.split('/').pop() || '',
          size: item.size,
        }
      }) || []

      const needDownloadAssets = assets.filter((asset) => {
        return asset.size !== existingFiles.find(f => f.name === asset.name)?.size
      })

      console.log(`--- Need to download ${needDownloadAssets.length} items`)

      console.log('Step 8. Create or update packages in the database')
      const transferProgress = needDownloadAssets.map((asset) => ({
        syncId: -1,
        filename: asset.name,
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
          },
          update: {
            downloadUrl: asset.url,
            triplet: triplet,
            versionId: version.id,
            fileName: asset.name,
          },
          where: {
            nodeId: asset.node_id,
          }
        })
        const sync = await prisma.packageSync.upsert({
          create: {
            packageId: pkg.id,
            status: 'PENDING',
          },
          update: {
            status: 'PENDING',
          },
          where: {
            packageId: pkg.id,
          }
        })

        transferProgress.find((item) => item.filename === asset.name)!.syncId = sync.id
      }

      console.log('Step 9. Transfer packages')
      // make sure the directory exists
      const downloadDir = path.join(process.cwd(), `downloads/${version.display}`)
      if (!fs.existsSync(downloadDir)) {
        fs.mkdirSync(downloadDir, { recursive: true })
      }
      await Promise.all(needDownloadAssets.map((asset) => {
        return new Promise(async (resolve, reject) => {
          const pkg = await prisma.package.findUnique({
            where: {
              nodeId: asset.node_id,
            }
          })
          if (!pkg) {
            reject(new Error(`Package not found: ${asset.node_id}`))
            return
          }
          const sync = await prisma.packageSync.findUnique({
            where: {
              packageId: pkg.id,
            }
          })
          if (!sync) {
            reject(new Error(`Package sync not found: ${pkg.id}`))
            return
          }
          await prisma.packageSync.update({
            where: {
              id: sync.id,
            },
            data: {
              status: 'IN_PROGRESS',
            }
          })
          const fileResponse = await $fetch.raw(
            asset.browser_download_url,
            {
              method: 'GET',
              responseType: 'stream',
              headers: {
                'Authorization': `Bearer ${process.env.GITHUB_TOKEN}`,
              },
              dispatcher: HttpProxyAgent,
            }
          )
          const writeStream = fs.createWriteStream(path.join(downloadDir, asset.name))
          fileResponse.body?.pipeTo(Writable.toWeb(writeStream))
          writeStream.on('finish', async () => {
            transferProgress.find((item) => item.filename === asset.name)!.downloaded = true
            resolve(true)
          })
          writeStream.on('error', async (err) => {
            console.error('Error writing file:', err)
            await prisma.packageSync.update({
              where: {
                id: sync.id,
              },
              data: {
                status: 'ERROR',
              }
            })
            transferProgress.find((item) => item.filename === asset.name)!.error = true
            transferProgress.find((item) => item.filename === asset.name)!.errorMessage = err.message
            // 防止其他下载任务被终止
            resolve(true)
          })
        })
      }))

      console.log('Step 10. Upload to S3')

      await Promise.all(transferProgress.filter((transfer) => transfer.downloaded)
        .map(async (transfer) => {
          const filePath = path.join(downloadDir, transfer.filename)

          return mc.putObject(
            'maaassistantarknights',
            `MaaAssistantArknights/MaaAssistantArknights/releases/download/${latestStableVersion.tag_name}/${transfer.filename}`,
            fs.createReadStream(filePath),
          )
            .then(async () => {
              await prisma.packageSync.update({
                where: {
                  id: transfer.syncId,
                },
                data: {
                  status: 'COMPLETED',
                }
              })
            })
            .catch(async (err) => {
              console.error('Error uploading file:', err)
              await prisma.packageSync.update({
                where: {
                  id: transfer.syncId,
                },
                data: {
                  status: 'ERROR',
                }
              })
            })
        }))

    } catch (e) {
      console.error('--- Task Aborted:\n', e)
      return { result: 'error' }
    }

    return { result: 'success' }
  }
})
