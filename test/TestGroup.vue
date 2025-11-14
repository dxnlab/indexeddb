<!-- TODO: build test groups -->
<template>
  <v-list-group :value="$props.group">
    <template #activator="{ props }">
      <v-list-item v-bind="props"
        :title="$props.title" 
        :subtitle="$props?.desc">
        <template  #prepend>
          <!-- TODO: group progress -->
          <StatusIcon status="ready" />
        </template>
        <template #append>
          <!-- TODO: group trigger -->
          <v-btn icon flat @click.stop="start" :disabled="0<$props.workers.counting">
            <v-icon>mdi-play-circle-outline</v-icon>
          </v-btn>
          <v-btn icon flat>
            <v-icon>mdi-chevron-down</v-icon>
          </v-btn>
        </template>
      </v-list-item>
    </template>
    <test-case v-for="(unit, idx) in $props.cases" 
      :key="`testsuite-${$props.group}.${idx}`" 
      :index="`${$props.group}.${idx}`" 
      v-bind="unit"
      v-model="runners[idx]"
    />
  </v-list-group>
</template>
<script setup lang="ts">
import { ref } from 'vue';
import { TestCase as TestCaseClass } from './unittest.ts';
import TestCase from './TestCase.vue';
import StatusIcon from './StatusIcon.vue';

const $props = defineProps({
  group: { type: [String, Number], required: true },
  workers: { type: Object, required: true },
  cases: { type: Array as ()=> TestCaseClass[], required: true },
  title: { type: String, required: false },
  desc: { type: String, required: false },
  modelValue: { type: Boolean, default: ()=>false },
});
const $emits = defineEmits([
  'update:status',
  'update:modelValue',
]);
const runners = ref($props.cases.map(()=>false));

async function start() {
  // await worker availability
  await $props.workers.ready();

  // start all cases
  runners.value = runners.value.map(()=>true);
}

</script>