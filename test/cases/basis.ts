import { promising } from '../../src/utils.ts'

export default [
  { /* 단위 테스트 유효성 검증 */
    title: 'Test unit test passes',
    desc: 'Testing unit test passes the assertion',
    test: function() {
      this.assert!(true, 'This test should pass');

    }
  },
  { /* 단위 테스트 유효성 검증 - 데이터세트 */
    title: 'dataset should pass',
    desc: 'A test case that uses dataset to run multiple assertions',
    dataset: (async function*() {
      yield [1];
      yield [2];
      yield [3];
    }),
    test: function (num:number){
      this.assert!(num > 0, `Number ${num} should be greater than 0`);
    }
  },
  { /* IndexedDB 지원 여부 확인 */
    title: 'IndexedDB availability',
    desc: 'Check if IndexedDB is available in the environment',
    test: function(){
      this.assert!(typeof globalThis.indexedDB !== 'undefined', 'IndexedDB should be available');
      const idb = globalThis.indexedDB;
      this.assert(idb!==undefined, 'idb supported');
      for(const method of ['databases','cmp','deleteDatabase']) {
        this.assert(typeof(idb[method]) ==='function', `function ${method}`);
      }
    }
  },
  { /* promising 유틸리티 테스트 */
    title: 'Promising test',
    test: async function() {
      const idb = globalThis.indexedDB;
      const opener = promising((name)=>idb.open(name));
      const name = 'novice';
      const db = await opener(name);
      this.assert(db != null, 'got database');
      this.assert(db.name === name, 'with the same name');
      console.log(db);
    },
    teardown: async function() {
      console.log(
        'teardown',
        await globalThis.indexedDB.deleteDatabase('novice'));
    }

  },

];