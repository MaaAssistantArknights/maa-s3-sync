<template>
  <div class="flex w-full items-center justify-between px-4 ">
    <UBadge color="neutral" variant="soft" class="w-24 justify-center">
      {{ channelEmoji[channel] }}&nbsp;{{ $t(`Common.Version.${channel}`) }}
    </UBadge>
    <div v-if="!info">
      <span class="text-neutral-500">{{ $t('Components.VersionCard.not_synced') }}</span>
    </div>
    <div v-else class="ml-4 w-full bg-elevated rounded-lg p-4">
      <div class="flex items-center justify-between">
        <div>
          <div class="mb-2">
            <span class="text-lg font-semibold mr-2">
              {{ info?.display }}
            </span>
            <span class="text-sm text-neutral-500">
              {{ $t('Components.VersionCard.released_at') }} <NuxtTime :datetime="info.releaseDate" relative :locale="currentLocale?.iso" />
              (<NuxtTime :datetime="info.releaseDate" style="long" />)
            </span>
          </div>
          <div>
            <TripletBadge v-for="pkg in info.packages" :key="pkg.id" :pkg="pkg" />
          </div>
        </div>
        <div class="flex flex-col h-full items-center justify-around space-y-2">
          <UDropdownMenu 
            arrow
            :items="downloadMenu">
            <UButton icon="lucide:cloud-download" size="md" color="primary" variant="solid" />
          </UDropdownMenu>
          <div v-if="loggedIn">
            <UTooltip :text="$t('Components.VersionCard.sync_now')">
              <UButton icon="lucide:refresh-ccw" size="md" color="neutral" variant="soft" @click="manualSync" />
            </UTooltip>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { channelEmoji } from '~/shared/constants/emojis'
import type { Version, Package, PackageSync, Job } from '~/shared/types/schema'
import type { DropdownMenuItem } from '@nuxt/ui'

const { loggedIn } = useUserSession()

const { isWindows, isMacOS } = useDevice()

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

const { t: $t, locale, locales } = useI18n()

const currentLocale = locales.value.find(l => l.code === locale.value)

type VersionResponse = Version & {
  packages: (Package & {
    version: Version
    sync: PackageSync & {
      jobs: Job[]
    }
  })[]
}

const response = await useFetch<VersionResponse>('/api/version', {
  method: 'GET',
  params: {
    channel,
    version,
  },
})

const info = response.data.value

const getRecommendedTriplet = () => {
  const { userAgent } = navigator
  if (isWindows) {
    if (userAgent.includes('x64')) {
      return 'win-x64'
    }
    if (userAgent.includes('ARM64')) {
      return 'win-arm64'
    }
  }
  if (isMacOS) {
    return 'macos-universal-dmg'
  }
  if (userAgent.includes('Linux')) {
    if (userAgent.includes('x86_64')) {
      return 'linux-x86_64'
    }
    if (userAgent.includes('aarch64')) {
      return 'linux-aarch64'
    }
  }
  return null
}

const recommendedTriplet = ref<string | null>(null)

const downloadMenu: Ref<DropdownMenuItem[][]> = ref([
  [
    {
      type: 'label',
      label: $t('Components.VersionCard.all_platforms'),
    },
    ...info!.packages.map(pkg => ({
      label: pkg.triplet,
      icon: 'lucide:file-down',
      onSelect: () => {
        if (pkg.s3Url) {
          downloadFile(pkg.s3Url, pkg.fileName)
        } else {
          console.warn(`No S3 URL found for package: ${pkg.triplet}`)
        }
      }
    }))
  ]
])

function downloadFile(url: string, filename: string) {
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function manualSync() {
  $fetch(`/api/task/trigger?task_name=sync_${channel.toLowerCase()}_channel`, {
    method: 'POST',
  })
}

onMounted(() => {
  recommendedTriplet.value = getRecommendedTriplet()
  if (recommendedTriplet.value) {
    downloadMenu.value.unshift([
      {
        type: 'label',
        label: $t('Components.VersionCard.recommanded'),
      },
      {
        label: recommendedTriplet.value,
        icon: 'lucide:file-down',
        onSelect: () => {
          const pkg = info!.packages.find(p => p.triplet === recommendedTriplet.value)
          if (pkg && pkg.s3Url) {
            downloadFile(pkg.s3Url, pkg.fileName)
          } else {
            console.warn('No package found for recommended triplet.')
          }
        }
      }
    ])
  }
})

</script>
