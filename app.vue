<template>
  <UApp :locale="uLocale">
    <NuxtRouteAnnouncer />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </UApp>
</template>

<script setup lang="ts">
import * as locales from '@nuxt/ui/locale'
const { locale } = useI18n()

// @ts-ignore
const uLocale = locales[locale.value]
</script>
