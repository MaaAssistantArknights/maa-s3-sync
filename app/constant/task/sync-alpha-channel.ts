import { HttpProxyAgent } from "~/app/utils/http_proxy"

const AlphaChannelTask = {
  slug: 'sync-alpha-channel',
  name: 'Sync MAA Alpha Channel',
  steps: [
    {
      name: 'Get Version',
      description: 'Get the latest version of the MAA Alpha Channel',
      fn: async () => {
        const versionApiResponse = await $fetch('https://api.github.com/repos/MaaAssistantArknights/MaaAssistantArknights/releases', {
          headers: {
            'Authorization': `Bearer ${process.env.GITHUB_TOKEN}`,
            'User-Agent': `MAA Sync Server (Powered by Nuxt) ${useRuntimeConfig().public.appVersion}`,
          },
          dispatcher: HttpProxyAgent,
        })
      }
    }
  ]
}

export default AlphaChannelTask
