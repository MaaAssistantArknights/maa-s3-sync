<template>
  <UTooltip :content="{side: 'top'}" :text="pkg.sync.jobs[0].status" arrow color="neutral" variant="subtle">
    <UBadge :color="statusBadgeColor[pkg.sync.jobs[0].status]" variant="subtle" class="mb-1 mr-2 cursor-pointer" @click="showPackageDetail">
      {{ `${statusEmoji[pkg.sync.jobs[0].status]} ${pkg.triplet}` }}
    </UBadge>
  </UTooltip>
</template>

<script lang="ts" setup>
import { PackageDetailSlideover } from '#components'
import { statusBadgeColor } from '~/shared/constants/colors'
import { statusEmoji } from '~/shared/constants/emojis'
import type { Package, PackageSync, Job, Version } from '~/shared/types/schema'

const overlay = useOverlay()

const props = defineProps<{
  pkg: Package & {
    version: Version
    sync: PackageSync & {
      jobs: Job[]
    }
  }
}>()

function showPackageDetail() {
  const slideover = overlay.create(PackageDetailSlideover, {
    props: {
      package: props.pkg
    }
  })
  slideover.open()
}
</script>
