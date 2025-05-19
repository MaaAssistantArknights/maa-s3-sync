<template>
  <USlideover :title="`Package ${package.fileName}`">
    <template #body>
      <div class="space-y-2">
        <div class="flex justify-between">
          <strong>Version:</strong>
          <span>{{ package.version.display }}</span>
        </div>
        <div class="flex justify-between">
          <strong>Channel:</strong>
          <span>{{ package.version.channel }}</span>
        </div>
        <div class="flex justify-between">
          <strong>Triplet:</strong>
          <span>{{ package.triplet }}</span>
        </div>
        <div class="flex justify-between">
          <strong>File:</strong>
          <span>{{ package.fileName }}</span>
        </div>
        <div class="flex justify-between">
          <strong>Status:</strong>
          <UBadge variant="subtle" :color="statusBadgeColor[package.sync.jobs[0].status]">{{ package.sync.jobs[0].status
          }}</UBadge>
        </div>
        <div class="flex justify-between">
          <strong>Last Sync Started At:</strong>
          <span v-if="!package.sync.jobs[0].startedAt">N/A</span>
          <NuxtTime v-else :datetime="package.sync.jobs[0].startedAt" dateStyle="long" timeStyle="medium" />
        </div>
        <div class="flex justify-between">
          <strong>Last Sync Finished At:</strong>
          <span v-if="!package.sync.jobs[0].finishedAt">N/A</span>
          <NuxtTime v-else :datetime="package.sync.jobs[0].finishedAt" dateStyle="long" timeStyle="medium" />
        </div>
      </div>
      <USeparator class="my-4" color="secondary" />
      <div class="flex justify-end space-x-2">
        <UButton v-if="package.s3Url" color="primary" variant="solid" icon="lucide:clipboard-copy" @click="copyLink">
          Copy Link
        </UButton>
        <UButton v-if="package.s3Url" color="primary" variant="solid" icon="lucide:cloud-download"
          @click="downloadFile">
          Download
        </UButton>
      </div>
    </template>
  </USlideover>
</template>

<script lang="ts" setup>
import { statusBadgeColor } from '~/shared/constants/colors';

import type { Version, Package, PackageSync, Job } from '@prisma/client';

const props = defineProps<{
  package: Package & {
    version: Version;
    sync: PackageSync & {
      jobs: Job[];
    }
  }
}>();

const toast = useToast();

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
      title: 'Link copied to clipboard',
      color: 'success',
      icon: 'lucide:check',
    });
  }).catch(err => {
    console.error('Failed to copy link:', err);
    toast.add({
      title: 'Failed to copy link',
      color: 'error',
      icon: 'lucide:x',
    });
  });
}

</script>
