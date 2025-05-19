<template>
  <UTooltip :content="{side: 'top'}" :text="pkg.sync.jobs[0].status" arrow color="neutral" variant="subtle">
    <UBadge :color="statusBadgeColor[pkg.sync.jobs[0].status]" variant="subtle" class="mb-1 mr-2 cursor-pointer">
      {{ `${statusEmoji[pkg.sync.jobs[0].status]} ${pkg.triplet}` }}
    </UBadge>
  </UTooltip>
</template>

<script lang="ts" setup>
import { statusBadgeColor } from '~/shared/constants/colors'
import { statusEmoji } from '~/shared/constants/emojis'
import type { Package, PackageSync, Job } from '~/shared/types/schema'

defineProps<{
  pkg: Package & {
    sync: PackageSync & {
      jobs: Job[]
    }
  }
}>()
</script>
