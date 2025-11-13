<template>
  <v-list-item :title="$props.title" :subtitle="$props?.desc" :key="`${index}-${refresh}`">
    <template #prepend>
      <v-icon v-if="status=='success'" color="green">mdi-check-circle</v-icon>
      <v-icon v-else-if="status=='error'" color="red">mdi-alert-circle</v-icon>
      <v-icon v-else-if="status=='running'" color="blue">mdi-progress-clock</v-icon>
      <v-icon v-else color="grey">mdi-checkbox-blank-circle-outline</v-icon>
    </template>
    <template #append>
      <v-btn icon flat @click="$emit('update:modelValue', true)" :disabled="$props.modelValue">
        <v-icon>mdi-play-circle-outline</v-icon>
      </v-btn>
    </template>
  </v-list-item>
</template>

<script setup lang="ts">
import { reactive, ref, shallowReactive, watch } from 'vue';
import { TestCase } from './unittest.ts';

const $props = defineProps({
  index: { type: Number, required: true },
  test: { type: Function as ()=>Promise<void>|void, required: true },
  title: { type: String, required: false },
  desc: { type: String, required: false },
  setup: { type: Function as ()=>Promise<void>|void, required: false },
  teardown: { type: Function as ()=>Promise<void>|void, required: false },
  timeout: { type: Number, required: false, default: 5000 },
  dataset: { type: Function as ()=>AsyncGenerator<[], void, void> | Promise<Array<[]>> | Array<[]>, required: false },
  modelValue: { type: Boolean, required: false, default: false },
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
  'update:modelValue',
]);
const status = ref('ready');
const unittest = shallowReactive(testcase);
const refresh = ref(Date.now());
const result = reactive({
  error: unittest.error || null,
  passed: unittest.passed || 0,
  logs: unittest.logs || [],
  elapsed: unittest.elapsed || 0,
});
testcase.addEventListener(TestCase.updateStatusEvent, (ev)=>{
  $emits('update:status', ev.status);
  status.value = ev.status;
  console.log($props.index, 'status updated', ev.status, Date.now());
  
  if(unittest.settled) {
    result.error = unittest.error;
    result.passed = unittest.passed;
    result.logs = unittest.logs;
    result.elapsed = unittest.elapsed;
    $emits('update:modelValue', false);
  }
});

watch(()=>$props.modelValue, (newValue, oldValue)=>{
  if(newValue && !oldValue) {
    startTest();
  } 
});

function startTest() {
  console.log($props.index, 'test started', Date.now());
  if(!unittest.isBusy) {
    unittest.run();
  } else {
    $emits('update:modelValue', false);
  }
}
</script>