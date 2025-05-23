<template>
  <USlideover :title="$t('Components.JobDetailSlideover.title', [job.id])">
    <template #body>
      <div class="space-y-2">
        <div class="flex justify-between">
          <strong>{{ $t('Common.version') }}:</strong>
          <span>{{ job.sync.package.version.display }}</span>
        </div>
        <div class="flex justify-between">
          <strong>{{ $t('Common.channel') }}:</strong>
          <span>{{ job.sync.package.version.channel }}</span>
        </div>
        <div class="flex justify-between">
          <strong>{{ $t('Common.triplet') }}:</strong>
          <span>{{ job.sync.package.triplet }}</span>
        </div>
        <div class="flex justify-between">
          <strong>{{ $t('Common.file') }}:</strong>
          <span>{{ job.sync.package.fileName }}</span>
        </div>
        <div class="flex justify-between">
          <strong>{{ $t('Common.status') }}:</strong>
          <StatusBadge :status="job.status" />
        </div>
        <div class="flex justify-between">
          <strong>{{ $t('Components.JobDetailSlideover.triggered_by') }}:</strong>
          <UBadge color="neutral" variant="subtle" :leadingIcon="job.triggeredBy.startsWith('*') ? 'lucide:settings': 'lucide:user-round'">
            {{ job.triggeredBy.replaceAll('*', '') }}
          </UBadge>
        </div>
        <div class="flex justify-between">
          <strong>{{ $t('Components.JobDetailSlideover.started_at') }}:</strong>
          <span v-if="!job.startedAt">N/A</span>
          <NuxtTime v-else :datetime="job.startedAt" :locale="locale.iso as string" dateStyle="long" timeStyle="medium" />
        </div>
        <div class="flex justify-between">
          <strong>{{ $t('Components.JobDetailSlideover.finished_at') }}:</strong>
          <span v-if="!job.finishedAt">N/A</span>
          <NuxtTime v-else :datetime="job.finishedAt" :locale="locale.iso as string" dateStyle="long" timeStyle="medium" />
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
          {{ $t('Components.JobDetailSlideover.show_job_log') }}
        </UButton>
        <UButton
          v-if="job.sync.package.s3Url"
          color="primary"
          variant="solid"
          icon="lucide:cloud-download"
          @click="downloadFile"
        >
          {{ $t('Common.download') }}
        </UButton>
      </div>
    </template>
  </USlideover>
</template>

<script lang="ts" setup>
import { JobLogSlideover } from '#components';

import type { Version, Package, PackageSync, Job } from '@prisma/client';

import useCurrentLocale from '~/utils/useCurrentLocale';

const overlay = useOverlay();
const locale = useCurrentLocale();

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
