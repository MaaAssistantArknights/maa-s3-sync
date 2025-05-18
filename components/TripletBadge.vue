<template>
  <UTooltip :content="{side: 'top'}" :text="pkg.sync.jobs[0].status" arrow color="neutral" variant="subtle">
    <UBadge :color="statusBadgeColor[pkg.sync.jobs[0].status]" variant="subtle" class="mr-2 cursor-pointer">
      {{ `${statusEmoji[pkg.sync.jobs[0].status]} ${pkg.triplet}` }}
    </UBadge>
  </UTooltip>
</template>

<script lang="ts" setup>
import type { Package, PackageSync, Job } from '~/shared/types/schema'

defineProps<{
  pkg: Package & {
    sync: PackageSync & {
      jobs: Job[]
    }
  }
}>()

const statusEmoji: Record<string, string> = {
  PENDING: '⏳',
  IN_PROGRESS: '🔄',
  COMPLETED: '✅',
  ERROR: '❌',
}

const statusBadgeColor: Record<string, 'warning' | 'info' | 'success' | 'error'> = {
  PENDING: 'warning',
  IN_PROGRESS: 'info',
  COMPLETED: 'success',
  ERROR: 'error',
}
</script>
