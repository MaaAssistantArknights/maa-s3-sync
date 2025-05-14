<template>
  <component :is="tabs[active]" />
</template>

<script setup lang="ts">
import versions from '~/components/Versions.vue'
import syncjobs from '~/components/SyncJobs.vue'

const tabs = {
  versions,
  syncjobs
}

const route = useRoute()
const router = useRouter()

const active = computed(() => (route.query.tab as string) || 'versions')

if (!route.query.tab) {
  router.push({
    path: '/',
    query: { tab: 'versions' },
    hash: '#tab-active'
  })
}
</script>
