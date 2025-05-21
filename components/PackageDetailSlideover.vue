<template>
  <USlideover :title="$t('Components.PackageDetailSlideover.title', [package.fileName])">
    <template #body>
      <div class="space-y-2">
        <div class="flex justify-between">
          <strong>{{ $t('Common.version') }}:</strong>
          <span>{{ package.version.display }}</span>
        </div>
        <div class="flex justify-between">
          <strong>{{ $t('Common.channel') }}:</strong>
          <span>{{ package.version.channel }}</span>
        </div>
        <div class="flex justify-between">
          <strong>{{ $t('Common.triplet') }}:</strong>
          <span>{{ package.triplet }}</span>
        </div>
        <div class="flex justify-between">
          <strong>{{ $t('Common.file') }}:</strong>
          <span>{{ package.fileName }}</span>
        </div>
        <div class="flex justify-between">
          <strong>{{ $t('Common.status') }}:</strong>
          <StatusBadge :status="package.sync.jobs[0].status" />
        </div>
        <div class="flex justify-between">
          <strong>{{ $t('Components.PackageDetailSlideover.last_sync_started_at') }}:</strong>
          <span v-if="!package.sync.jobs[0].startedAt">N/A</span>
          <NuxtTime v-else :datetime="package.sync.jobs[0].startedAt" :locale="locale.iso as string" dateStyle="long" timeStyle="medium" />
        </div>
        <div class="flex justify-between">
          <strong>{{ $t('Components.PackageDetailSlideover.last_sync_finished_at') }}:</strong>
          <span v-if="!package.sync.jobs[0].finishedAt">N/A</span>
          <NuxtTime v-else :datetime="package.sync.jobs[0].finishedAt" :locale="locale.iso as string" dateStyle="long" timeStyle="medium" />
        </div>
      </div>
      <USeparator class="my-4" color="secondary" />
      <div class="flex justify-end space-x-2">
        <UButton v-if="package.s3Url" color="primary" variant="solid" icon="lucide:clipboard-copy" @click="copyLink">
          {{ $t('Components.PackageDetailSlideover.copy_link') }}
        </UButton>
        <UButton v-if="package.s3Url" color="primary" variant="solid" icon="lucide:cloud-download"
          @click="downloadFile">
          {{ $t('Common.download') }}
        </UButton>
      </div>
    </template>
  </USlideover>
</template>

<script lang="ts" setup>
import type { Version, Package, PackageSync, Job } from '@prisma/client';

import { statusBadgeColor } from '~/shared/constants/colors';
import useCurrentLocale from '~/utils/useCurrentLocale';

const props = defineProps<{
  package: Package & {
    version: Version;
    sync: PackageSync & {
      jobs: Job[];
    }
  }
}>();

const toast = useToast();
const { t: $t } = useI18n();
const locale = useCurrentLocale();

function downloadFile() {
  const s3Url = props.package.s3Url;
  if (!s3Url) {
    return;
  }
  const link = document.createElement('a');
  link.href = s3Url;
  link.download = `${props.package.fileName}`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function copyLink() {
  const s3Url = props.package.s3Url;
  if (!s3Url) {
    return;
  }
  navigator.clipboard.writeText(s3Url).then(() => {
    toast.add({
      title: $t('Components.PackageDetailSlideover.copy_link_success'),
      color: 'success',
      icon: 'lucide:check',
    });
  }).catch(err => {
    console.error('Failed to copy link:', err);
    toast.add({
      title: $t('Components.PackageDetailSlideover.copy_link_fail'),
      color: 'error',
      icon: 'lucide:x',
    });
  });
}

</script>
