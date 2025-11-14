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
    <v-progress-linear :value="progress" height="4" color="primary" />
    <v-main>
      <v-container fluid>
        <v-row>
          <!-- unit tests area -->
          <v-col cols="12" md="6" lg="4" xl="3">
            <v-list two-line>
              <test-group v-for="(suite, idx) in testSuites" 
                :key="`testsuite-${idx}`" 
                :group="suite.id" 
                :workers="TestCase.Workers"
                v-bind="suite"
                v-model="runners[idx]"
              />
            </v-list>
          </v-col>
          <!-- test report area -->
          <v-col cols="12" md="6" lg="8" xl="9">
            <!-- TODO: show logs & errors -->
          </v-col>
        </v-row>
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { run } from './utils'
import suites from './cases/index.ts'
import { TestCase } from './unittest.ts'
import TestGroup from './TestGroup.vue'

const testSuites = ref(suites);
const runners = ref(testSuites.value.map(()=>false));
const progress = ref(0);

</script>