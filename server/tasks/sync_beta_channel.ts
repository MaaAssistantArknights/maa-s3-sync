import prisma from "~/lib/prisma";
import sfetch from '~/server/utils/server_fetch'
import parseTriplet from "~/server/utils/triplet_parser";

export default defineTask({
  meta: {
    name: 'sync_beta_channel',
    description: 'Sync Client Installers from MAA Beta Channel',
  },
  async run() {
    try {
      console.log('Step 1. Get the latest version from the API')
      const versionApiResponse: any = await sfetch('https://api.github.com/repos/MaaAssistantArknights/MaaAssistantArknights/releases')
      if (!versionApiResponse) {
        throw new Error('Failed to fetch the latest version from the API')
      }

      console.log('Step 2. Filter the latest beta version')
      const latestBetaVersion = versionApiResponse
        .filter((release: any) => release.tag_name.includes('beta'))
        .sort((a: any, b: any) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime())[0]
      if (!latestBetaVersion) {
        throw new Error('Failed to find the latest beta version')
      }

      console.log('Step 3. Get download URLs of beta version packages')
      const downloadUrls = latestBetaVersion.assets
        .filter((asset: any) => parseTriplet(asset.name)) // Remove non-client packages
        .map((asset: any) => {
          return {
            name: asset.name,
            url: asset.browser_download_url,
            nodeId: asset.node_id,
          }
        })
      console.log(`--- Got ${downloadUrls.length} items`)
      console.log(downloadUrls)

      console.log('Step 4. Create or update record in the database')
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

      console.log('Step 5. Create or update packages in the database')
      for (const downloadUrl of downloadUrls) {
        const triplet = parseTriplet(downloadUrl.name)
        const pkg = await prisma.package.upsert({
          create: {
            downloadUrl: downloadUrl.url,
            triplet: triplet,
            versionId: version.id,
            nodeId: downloadUrl.nodeId,
          },
          update: {
            downloadUrl: downloadUrl.url,
            triplet: triplet,
            versionId: version.id,
          },
          where: {
            nodeId: downloadUrl.nodeId,
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
      }
    } catch (e) {
      console.error('--- Task Aborted:\n', e)
      return { result: 'error' }
    }
    
    return { result: 'success' }
  }
})
