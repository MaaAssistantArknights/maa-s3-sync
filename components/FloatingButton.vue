<template>
  <div class="floating-button-container">
    <button class="floating-button" @click="toggleSubButtons">
      +
    </button>
    <transition-group name="fade" tag="div">
      <SubButton
        v-for="(subButton, index) in subButtons"
        :key="subButton.id"
        :label="subButton.label"
        :style="{ opacity: showSubButtons ? 1 : 0 }"
      />
    </transition-group>
  </div>
</template>

<script lang="ts" setup>
import SubButton from '~/components/FloatingSubButton.vue'

const showSubButtons = ref(false)
const subButtons = ref([
  { id: 1, label: 'Action 1' },
  { id: 2, label: 'Action 2' },
  { id: 3, label: 'Action 3' }
])

const toggleSubButtons = () => {
  showSubButtons.value = !showSubButtons.value
}
</script>

<style scoped>
.floating-button-container {
  position: relative;
}

.floating-button {
  position: fixed;
  bottom: 20px;
  right: 20px;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background-color: #ff4081;
  color: white;
  border: none;
  font-size: 24px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.floating-button:hover {
  background-color: #e91e63;
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.5s;
}
.fade-enter, .fade-leave-to {
  opacity: 0;
}
</style>
