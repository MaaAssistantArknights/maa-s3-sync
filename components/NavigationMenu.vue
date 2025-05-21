<template>
  <UTabs  v-model="active" :content="false" variant="link" :items="items" :ui="{ trigger: 'grow' }" class="w-full" />
</template>
<script lang="ts" setup>
import type { TabsItem } from '@nuxt/ui'

const route = useRoute()
const router = useRouter()
const { t: $t } = useI18n()

const items = ref<TabsItem[]>([
  {  
    label: $t('Components.NavigationMenu.versions'),
    icon: 'fa6-solid:tag',
    value: 'versions',
  },
  {
    label: $t('Components.NavigationMenu.syncjobs'),
    icon: 'fa6-solid:arrows-rotate',
    value: 'syncjobs',
  }
])

const active = computed({
  get() {
    return (route.query.tab as string) || 'account'
  },
  set(tab) {
    // Hash is specified here to prevent the page from scrolling to the top
    router.push({
      path: '/',
      query: { tab },
      hash: '#tab-active'
    })
  }
})
</script>
