import { assert } from 'vitest';

export default [
  {
    title: 'Should pass',
    desc: 'A test case that should pass successfully',
    test: function(){
      this.assert(true, 'This test should pass');
    }
  },
  { /* dataset provided */
    title: 'dataset should pass',
    desc: 'A test case that uses dataset to run multiple assertions',
    dataset: (async function*() {
      yield [1];
      yield [2];
      yield [3];
    }),
    test: (num:number)=>{
      assert(num > 0, `Number ${num} should be greater than 0`);
    }
  },
  { /* has indexedDB */
    title: 'IndexedDB availability',
    desc: 'Check if IndexedDB is available in the environment',
    test: ()=>{
      assert(typeof globalThis.indexedDB !== 'undefined', 'IndexedDB should be available');
    }
  }
]