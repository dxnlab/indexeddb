<template>
  <v-app fluid>
    <v-app-bar app>
      <v-toolbar-title>IDB Test Environment</v-toolbar-title>
      <v-spacer />
      <v-btn icon>
        <v-icon>
          mdi-refresh
        </v-icon>
      </v-btn>
    </v-app-bar>
    <v-progress-linear :value="progress" height="4"></v-progress-linear>
    <v-main>
      <v-container fluid>
        <v-row>
          <!-- unit tests area -->
          <v-col cols="12" md="6" lg="4" xl="3">
            <v-list two-line>
              <TestCase v-for="(unit, idx) in $props.cases" :key="idx" :index="idx" 
                v-bind="unit"
                v-model="runners[idx]"
              />
            </v-list>
          </v-col>
          <!-- test report area -->
          <v-col cols="12" md="6" lg="8" xl="9">
          </v-col>
        </v-row>
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { run } from './utils'
import envTests from './envs.ts'
import TestCase from './TestCase.vue'

const $props = defineProps({
  cases: { type: Array as ()=>any[], default:()=>envTests },
});

const runners = ref($props.cases.map(()=>false));
const progress = ref(0);

</script>