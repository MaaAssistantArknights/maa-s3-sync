<template>
  <USlideover>
    <template #body>
      <Placeholder class="h-full" />
    </template>
  </USlideover>
</template>

<script lang="ts" setup>
import type { Version, Package, PackageSync, Job } from '@prisma/client';

defineProps<{
  job: Job & {
    sync: PackageSync & {
      package: Package & {
        version: Version;
      };
    };
  }
}>();
</script>
