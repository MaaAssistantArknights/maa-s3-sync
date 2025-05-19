<template>
  <USlideover :title="`Job #${job.id}`">
    <template #body>
      <div class="space-y-2">
        <div class="flex justify-between">
          <strong>Version:</strong>
          <span>{{ job.sync.package.version.display }}</span>
        </div>
        <div class="flex justify-between">
          <strong>Channel:</strong>
          <span>{{ job.sync.package.version.channel }}</span>
        </div>
        <div class="flex justify-between">
          <strong>Triplet:</strong>
          <span>{{ job.sync.package.triplet }}</span>
        </div>
        <div class="flex justify-between">
          <strong>File:</strong>
          <span>{{ job.sync.package.fileName }}</span>
        </div>
        <div class="flex justify-between">
          <strong>Status:</strong>
          <UBadge variant="subtle" :color="statusBadgeColor[job.status]">{{ job.status }}</UBadge>
        </div>
        <div class="flex justify-between">
          <strong>Triggered By:</strong>
          <UBadge color="neutral" variant="subtle" :leadingIcon="job.triggeredBy.startsWith('*') ? 'lucide:settings': 'lucide:user-round'">
            {{ job.triggeredBy.replaceAll('*', '') }}
          </UBadge>
        </div>
        <div class="flex justify-between">
          <strong>Started At:</strong>
          <span v-if="!job.startedAt">N/A</span>
          <NuxtTime v-else :datetime="job.startedAt" dateStyle="long" timeStyle="medium" />
        </div>
        <div class="flex justify-between">
          <strong>Finished At:</strong>
          <span v-if="!job.finishedAt">N/A</span>
          <NuxtTime v-else :datetime="job.finishedAt" dateStyle="long" timeStyle="medium" />
        </div>
      </div>
      <USeparator class="my-4" color="secondary" />
      <div class="flex justify-end space-x-2">
        <UButton
          color="neutral"
          variant="solid"
          icon="lucide:bug"
          @click="showJobLog"
        >
          Show Job Log
        </UButton>
        <UButton
          v-if="job.sync.package.s3Url"
          color="primary"
          variant="solid"
          icon="lucide:cloud-download"
          @click="downloadFile"
        >
          Download
        </UButton>
      </div>
    </template>
  </USlideover>
</template>

<script lang="ts" setup>
import { JobLogSlideover } from '#components';

import { statusBadgeColor } from '~/shared/constants/colors';

import type { Version, Package, PackageSync, Job } from '@prisma/client';

const overlay = useOverlay();

const props = defineProps<{
  job: Job & {
    sync: PackageSync & {
      package: Package & {
        version: Version;
      };
    };
  }
}>();

function downloadFile() {
  const s3Url = props.job.sync.package.s3Url;
  if (!s3Url) {
    return;
  }
  const link = document.createElement('a');
  link.href = s3Url;
  link.download = `${props.job.sync.package.fileName}`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function showJobLog() {
  const slideover = overlay.create(JobLogSlideover, {
    props: {
      job: props.job
    }
  })
  slideover.open()
}
</script>
