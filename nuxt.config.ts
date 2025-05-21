export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: {
    enabled: true,

    timeline: {
      enabled: true,
    },
  },

  runtimeConfig: {
    public: {
      appVersion: 'v1.1.0',
    },
    authorizedRoutes: [
      'POST /api/task/trigger',
    ]
  },

  modules: [
    '@nuxt/content',
    '@nuxt/eslint',
    '@nuxt/icon',
    '@nuxt/ui',
    'nuxt-auth-utils',
    '@prisma/nuxt',
    '@nuxtjs/device',
    '@vueuse/nuxt',
    '@nuxtjs/i18n',
  ],

  nitro: {
    experimental: {
      tasks: true,
    },
  },

  css: ['~/assets/css/main.css'],
  vite: {
    resolve: {
      alias: {
        '.prisma/client/index-browser': './node_modules/.prisma/client/index-browser.js',
      },
    },
  },
  i18n: {
    locales: [
      { code: 'en', name: 'English', iso: 'en-US', file: 'en-US.json' },
      { code: 'zh', name: '简体中文', iso: 'zh-CN', file: 'zh-CN.json' },
    ],
  }
})
