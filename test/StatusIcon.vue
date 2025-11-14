<template>
  <v-progress-circular v-if="isBusy" :color="color" indeterminate size="20" width="2">
    {{ passed || 0 }}
  </v-progress-circular>
  <v-icon v-else :color="color">
    {{ icon }}
  </v-icon>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const $props = defineProps({
  status: { type: String, required: true },
  passed: { type: Number, required: false },
});
const colorMap = {
  ready: 'default',
  running: 'primary',
  success: 'success',
  error: 'error',
};
const iconMap = {
  ready: 'mdi-checkbox-blank-circle-outline',
  running: 'mdi-refresh',
  success: 'mdi-check-circle',
  error: 'mdi-alert-circle',
};
const isBusy = computed(()=>{
  return $props.status === 'running';
});
const color = computed(()=>{
  return colorMap[$props.status] || 'default';
});
const icon = computed(()=>{
  return iconMap[$props.status] || 'mdi-refresh';
});
</script>