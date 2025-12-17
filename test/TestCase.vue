<template>
  <v-list-item :title="$props.title" :subtitle="$props?.desc" :key="`${index}-${refresh}`">
    <template #prepend>
      <StatusIcon :status="status" />
    </template>
    <template #append>
      <v-btn icon flat @click="$emit('update:modelValue', true)" :disabled="$props.modelValue">
        <v-icon>mdi-play-circle-outline</v-icon>
      </v-btn>
    </template>
    <v-tooltip v-if="settled" activator="parent">
      <v-alert color="info">
        <span>
          {{  result?.passed }} passed {{ status }} by {{  result?.elapsed }}ms
        </span>
        <div v-if="result?.logs && result.logs.length > 0">
          {{  (result?.logs || []).map(JSON.stringify).join('\n') }}
        </div>
      </v-alert>
      
      <v-alert v-if="result?.error" color="error" >
        {{  result?.error }}
      </v-alert>

    </v-tooltip>
  </v-list-item>
</template>

<script setup lang="ts">
import { ref, shallowReactive, watch } from 'vue';
import { TestCase, TestSemaphore } from './unittest.ts';
import StatusIcon from './StatusIcon.vue';

const $props = defineProps({
  index: { type: String, required: true },
  test: { type: Function, required: true },
  title: { type: String, required: false },
  desc: { type: String, required: false },
  setup: { type: Function, required: false },
  teardown: { type: Function, required: false },
  timeout: { type: Number, required: false, default: 5000 },
  dataset: { type: Function, required: false },
  modelValue: { type: Boolean, required: false, default: false },
  workers: { type: Object as ()=>TestSemaphore, default: undefined },
});

const testcase = new TestCase($props.test, {
  title: $props.title,
  desc: $props.desc,
  setup: $props.setup,
  teardown: $props.teardown,
  timeout: $props.timeout,
  dataset: $props.dataset,
});
const $emits = defineEmits([
  'update:status',
  'update:assigned',
  'update:modelValue',
]);
const status = ref('ready');
const unittest = shallowReactive(testcase);
const refresh = ref(Date.now());
const settled = ref(false);
let result = shallowReactive({
  error: unittest.error || null,
  passed: unittest.passed || 0,
  logs: unittest?.logs || [],
  elapsed: unittest?.elapsed || 0,
});
testcase.addEventListener(TestCase.updateStatusEvent, (ev)=>{
  console.log(testcase.title, 'status update:', ev.status);
  $emits('update:status', ev.status!);
  status.value = ev.status!;
  
  settled.value = ev.settled;
  if(ev.settled!) {
    result = {
      error: unittest.error,
      passed: unittest.passed,
      logs: unittest.logs,
      elapsed: unittest.elapsed,
    };
    $emits('update:modelValue', false);
  }
});

watch(()=>$props.modelValue, (newValue, oldValue)=>{
  if(newValue && !oldValue) {
    startTest();
  } 
});

async function startTest() {
  if(!unittest.isBusy) {
    await unittest.run($props.workers);
  } else {
    $emits('update:modelValue', false);
  }
}
</script>