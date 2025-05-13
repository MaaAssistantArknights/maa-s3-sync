// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },

  modules: [
    '@nuxt/eslint',
    '@nuxt/fonts',
    '@nuxt/icon',
    '@nuxt/ui',
    'nuxt-auth-utils',
    '@prisma/nuxt',
  ],

  alias: {
    '.prisma/client/index-browser': '@prisma/client'
  },

  vite: {
    resolve: {
      alias: {
        // reference: https://www.prisma.io/docs/orm/more/help-and-troubleshooting/prisma-nuxt-module#resolving-typeerror-failed-to-resolve-module-specifier-prismaclientindex-browser
        '.prisma/client/index-browser': './node_modules/@prisma/client/index-browser.js',
      },
    },
  }
})
