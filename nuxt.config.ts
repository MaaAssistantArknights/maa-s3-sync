import tailwindcss from "@tailwindcss/vite";

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
      appVersion: 'v1.0.0',
    }
  },

  modules: [
    '@nuxt/content',
    '@nuxt/eslint',
    '@nuxt/fonts',
    '@nuxt/icon',
    '@nuxt/ui',
    'nuxt-auth-utils',
    '@prisma/nuxt',
  ],

  nitro: {
    experimental: {
      tasks: true,
    },
  },

  css: ['~/assets/css/main.css'],
})
