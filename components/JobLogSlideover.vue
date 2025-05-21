<template>
  <USlideover :title="$t('Components.JobLogSliderover.title', [job.id])" class="max-w-3xl"
    :ui="{ body: 'flex flex-col flex-1 overflow-y-auto p-4 sm:p-6' }">
    <template #body>
      <div class="flex justify-end space-x-2">
        <UButton :loading="loading" color="primary" :variant="autoRefresh ? 'solid' : 'subtle'"
          icon="lucide:refresh-ccw" loading-icon="lucide:refresh-ccw" @click="autoRefresh = !autoRefresh">
          {{ $t('Components.JobLogSlideover.auto_refresh') }}
        </UButton>
        <UButton color="primary" :variant="autoScroll ? 'solid' : 'subtle'" icon="rivet-icons:page-bottom"
          @click="autoScroll = !autoScroll">
          {{ $t('Components.JobLogSlideover.auto_scroll') }}
        </UButton>
      </div>
      <div class="flex-1 overflow-y-auto" ref="logEl">
        <pre class="whitespace-pre-wrap">{{ log }}</pre>
      </div>
    </template>
  </USlideover>
</template>

<script lang="ts" setup>
import type { Version, Package, PackageSync, Job } from '@prisma/client';

const props = defineProps<{
  job: Job & {
    sync: PackageSync & {
      package: Package & {
        version: Version;
      };
    };
  }
}>();

const { job } = props;

const log = ref<string | null>(null);
const loading = ref(false);

// auto refresh settings
const autoRefresh = ref(job.status === 'IN_PROGRESS' || job.status === 'PENDING');
const { pause, resume } = useIntervalFn(fetchLog, 3000);
watch(autoRefresh, (newValue) => {
  if (newValue) {
    resume();
  } else {
    pause();
  }
}, { immediate: true });

// scroll settings
const autoScroll = ref(true);
const logEl = useTemplateRef('logEl');
const { x, y } = useScroll(logEl, { behavior: 'smooth' });
watch(log, () => {
  if (autoScroll.value && logEl.value) {
    y.value = logEl.value.scrollHeight
  }
});

async function fetchLog() {
  loading.value = true;
  try {
    const response = await $fetch<string>(`/api/job/log/${job.id}`, {
      method: 'GET',
    });
    log.value = response;
  } catch (error) {
    console.error('Failed to fetch job log:', error);
  } finally {
    loading.value = false;
  }
}

onMounted(fetchLog);
</script>
