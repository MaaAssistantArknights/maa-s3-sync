<template>
  <UTooltip :content="{side: 'top'}" :text="pkg.sync.status" arrow color="neutral" variant="subtle">
    <UBadge :color="statusBadgeColor[pkg.sync.status]" variant="subtle" class="mr-2 cursor-pointer">
      {{ `${statusEmoji[pkg.sync.status]} ${pkg.triplet}` }}
    </UBadge>
  </UTooltip>
</template>

<script lang="ts" setup>
defineProps({
  pkg: {
    type: Object,
    required: true,
  },
})

const statusEmoji: Record<string, string> = {
  PENDING: '⏳',
  IN_PROGRESS: '🔄',
  COMPLETED: '✅',
  ERROR: '❌',
}

const statusBadgeColor = {
  PENDING: 'warning',
  IN_PROGRESS: 'info',
  COMPLETED: 'success',
  ERROR: 'error',
}
</script>
