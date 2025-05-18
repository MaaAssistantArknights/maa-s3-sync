<template>
  <div class="flex flex-col h-full justify-between flex-1">
    <component :is="tabs[active]" />
    <div v-if="!loggedIn" class="text-center underline my-4">
      <ULink to="/login">I'm Maa Team Member</ULink>
    </div>
  </div>
</template>

<script setup lang="ts">
import versions from '~/components/Versions.vue'
import syncjobs from '~/components/SyncJobs.vue'

const { loggedIn } = useUserSession()

const tabs = {
  versions,
  syncjobs
}

const route = useRoute()
const router = useRouter()

const active = computed(() => (route.query.tab as keyof typeof tabs) || 'versions')

if (!route.query.tab) {
  router.push({
    path: '/',
    query: { tab: 'versions' },
    hash: '#tab-active'
  })
}
</script>
