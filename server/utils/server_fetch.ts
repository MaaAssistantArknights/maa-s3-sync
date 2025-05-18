import { HttpProxyAgent } from "~/server/utils/request_proxy"
import type { NitroFetchOptions, NitroFetchRequest } from 'nitropack'

function useGitHubToken(url: string): Record<string, string> {
  if (!process.env.GITHUB_TOKEN) {
    return {}
  }

  const uri = new URL(url)
  if (['api.github.com', 'raw.githubusercontent.com', 'github.com', 'objects.githubusercontent.com'].includes(uri.host)) {
    return {
      Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
    }
  }

  return {}
}

async function serverFetch(url: string, options?: NitroFetchOptions<NitroFetchRequest>) {
  const config = useRuntimeConfig()
  const headers = {
    'User-Agent': `MAA Sync Server (Powered by Nuxt) ${config.public.appVersion}`,
    // 糊屎，傻逼TS
    ...useGitHubToken(url),
    ...options?.headers,
  }

  return await $fetch(url, {
    ...options,
    headers,
    dispatcher: HttpProxyAgent,
  })
}

export default serverFetch
