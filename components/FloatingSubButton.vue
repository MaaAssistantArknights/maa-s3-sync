<template>
  <div class="sub-button" :style="{ transform: isVisible ? 'translateY(0)' : 'translateY(-20px)', opacity: isVisible ? 1 : 0 }">
    <button @click="$emit('click')">{{ label }}</button>
  </div>
</template>

<script setup>
import { defineProps, ref, watch } from 'vue'

const props = defineProps({
  label: {
    type: String,
    required: true
  },
  isVisible: {
    type: Boolean,
    default: false
  }
})
</script>

<style scoped>
.sub-button {
  transition: transform 0.3s ease, opacity 0.3s ease;
  position: absolute;
}
</style>
