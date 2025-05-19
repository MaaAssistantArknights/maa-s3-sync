<template>
  <div class="w-full max-w-4xl">
    <VersionCard class="mt-4" v-for="channel in channels" :key="channel" :channel="channel" />
  </div>
</template>

<script lang="ts" setup>
const channels = ['stable', 'beta']
</script>
