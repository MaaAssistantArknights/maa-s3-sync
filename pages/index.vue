<template>
  <div class="flex flex-col w-full h-full justify-between items-center flex-1">
    <component :is="tabs[active]" />
    <div v-if="!loggedIn" class="text-center underline my-4">
      <ULink to="/login">{{ $t('Pages.Index.team_member_link') }}</ULink>
    </div>
  </div>
</template>

<script setup lang="ts">
import versions from '~/components/Versions.vue'
import syncjobs from '~/components/SyncJobs.vue'

useHead({
  title: 'MAA Sync Status',
})

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
