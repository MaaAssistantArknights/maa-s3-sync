<template>
  <div class="flex w-full items-center justify-between px-4 ">
    <UBadge color="neutral" variant="soft" class="w-24 justify-center">
      {{ `${channelEmoji[channel]} ${channel}` }}
    </UBadge>
    <div class="ml-4 w-full bg-elevated rounded-lg p-4">
      <div class="flex items-center justify-between">
        <div>
          <div class="mb-2">
            <span class="text-lg font-semibold mr-2">
              {{ info?.display }}
            </span>
            <span class="text-sm text-neutral-500">
              Released <NuxtTime :datetime="info.releaseDate" relative />
              (<NuxtTime :datetime="info.releaseDate" style="long" />)
            </span>
          </div>
          <div class="flex">
            <TripletBadge v-for="pkg in info.packages" :key="pkg.id" :pkg="pkg" />
          </div>
        </div>
        <div v-if="loggedIn">

        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import TripletBadge from '~/components/TripletBadge.vue'

const { loggedIn } = useUserSession()

const channelEmoji: Record<string, string> = {
  alpha: '🚀',
  beta: '🧪',
  stable: '✅',
}

const { channel, version } = defineProps({
  channel: {
    type: String,
    required: true,
  },
  version: {
    type: String,
    required: false,
  },
})

const response = await useFetch('/api/version', {
  method: 'GET',
  params: {
    channel,
    version,
  },
})

const info = response.data.value

</script>
