import { promising } from '../../src/utils.ts'

export default [
  {
    title: 'Test unit test passes',
    desc: 'Testing unit test passes the assertion',
    test: function() {
      this.assert!(true, 'This test should pass');

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
    test: function (num:number){
      this.assert!(num > 0, `Number ${num} should be greater than 0`);
    }
  },
  { /* has indexedDB */
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
  { /* utility promising */
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

  }
];