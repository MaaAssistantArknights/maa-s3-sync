// TODOS:
// 1. Add a file logger
// 2. typo
// 3. upload to s3

import fs from 'fs';
import path from 'path';
import { Writable } from 'stream';

import prisma from "~/lib/prisma";
import sfetch from '~/server/utils/server_fetch'
import parseTriplet from "~/server/utils/triplet_parser";
import { HttpProxyAgent } from "~/server/utils/http_proxy"

export default defineTask({
  meta: {
    name: 'sync_stable_channel',
    description: 'Sync Client Installers from MAA Stable Channel',
  },
  async run() {
    try {
      console.log('Step 1. Get the latest version from the API')
      const versionApiResponse: any = await sfetch('https://api.github.com/repos/MaaAssistantArknights/MaaAssistantArknights/releases')
      if (!versionApiResponse) {
        throw new Error('Failed to fetch the latest version from the API')
      }

      console.log('Step 2. Filter the latest stable version')
      const latestStableVersion = versionApiResponse
        .filter((release: any) => release.prerelease === false)
        .sort((a: any, b: any) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime())[0]
      if (!latestStableVersion) {
        throw new Error('Failed to find the latest stable version')
      }

      console.log('Step 3. Get download URLs of stable version packages')
      const downloadInfos = latestStableVersion.assets
        .filter((asset: any) => parseTriplet(asset.name)) // Remove non-client packages
        .map((asset: any) => {
          return {
            name: asset.name,
            url: asset.browser_download_url,
            nodeId: asset.node_id,
          }
        })
      console.log(`--- Got ${downloadInfos.length} items`)
      console.log(downloadInfos)

      console.log('Step 4. Create or update record in the database')
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

      console.log('Step 5. Create or update packages in the database')
      for (const info of downloadInfos) {
        const triplet = parseTriplet(info.name)
        const pkg = await prisma.package.upsert({
          create: {
            downloadUrl: info.url,
            triplet: triplet,
            versionId: version.id,
            nodeId: info.nodeId,
          },
          update: {
            downloadUrl: info.url,
            triplet: triplet,
            versionId: version.id,
          },
          where: {
            nodeId: info.nodeId,
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
        info.syncId = sync.id
      }

      console.log('Step 6. Transfer packages')
      // make sure the directory exists
      const downloadDir = path.join(process.cwd(), 'downloads')
      if (!fs.existsSync(downloadDir)) {
        fs.mkdirSync(downloadDir, { recursive: true })
      }
      await Promise.all(downloadInfos.map((downloadInfo: Record<string, string>) => {
        return new Promise(async (resolve, reject) => {
          const pkg = await prisma.package.findUnique({
            where: {
              nodeId: downloadInfo.nodeId,
            }
          })
          if (!pkg) {
            reject(new Error(`Package not found: ${downloadInfo.nodeId}`))
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
            downloadInfo.url,
            {
              method: 'GET',
              responseType: 'stream',
              headers: {
                'Authorization': `Bearer ${process.env.GITHUB_TOKEN}`,
              },
              dispatcher: HttpProxyAgent,
            }
          )
          const writeStream = fs.createWriteStream(path.join(downloadDir, downloadInfo.name))
          fileResponse.body?.pipeTo(Writable.toWeb(writeStream))
          writeStream.on('finish', async () => {
            await prisma.packageSync.update({
              where: {
                id: sync.id,
              },
              data: {
                status: 'COMPLETED',
              }
            })
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
            reject(err)
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
