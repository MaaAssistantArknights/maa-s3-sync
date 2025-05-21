<template>
  <UBadge
    :color="statusBadgeColor[status]"
    variant="subtle"
    class="cursor-pointer">
    {{ $t(`Common.Status.${status}`) }}
  </UBadge>
</template>

<script lang="ts" setup>
import type { JobStatus } from '~/shared/types/schema'
import { statusBadgeColor } from '~/shared/constants/colors'

defineProps<{
  status: JobStatus
}>()
</script>
