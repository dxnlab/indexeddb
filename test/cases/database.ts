
import { Factory } from '../../src/factory.ts';
import { TestCase } from "../unittest.ts";
import SampleDriver from './sample.ts';
import { migration } from './sample.ts';

export default [
  { /* factory: open 테스트 */
    title: 'cleared at first',
    async test() {
      const connector = Factory.factory;
      this.assert(connector!=null, 'indexedDB provided');
      const databases = await connector.databases();
      this.assert(databases instanceof Array, 'databases set');
      this.log(databases);
    }
  },
  { /* database: open 테스트 */
    title: 'open connection',
    async test() {
      const driver = new SampleDriver();
      await this.assert(driver!=null, 'driver created');
      const db = await driver.idb;
      await this.assert(db instanceof IDBDatabase, 'driver connected');
    }
  },
  { /* transaction: transaction 생성 테스트 */
    title: 'create transaction',
    async test() {
      // const driver = new SampleDriver();
      const factory = SampleDriver.__idb_factory as Factory;
      const withTx = factory.transaction(['items']);
      const wraps = withTx(async (tx) => {
        await Promise.all([
          '__tx',
          '__transaction',
          'db',
          'error',
          'mode',
          'objectStoreNames',
          'abort',
          'commit',
          'objectStore',
          'items',
        ].map(async (prop)=>{
          await this.assert!(tx[prop] !== undefined, `transaction has ${prop}`);
          console.log('withinTx', prop, tx[prop]);
        }));
        // console.log('within tx', await tx.items);
        await this.assert(tx.mode === 'readonly', 'transaction mode readonly');
        await this.assert(tx.items !== undefined, 'object store proxy wrap');
        await this.assert(tx.items.__store instanceof IDBObjectStore, 'object store unwrap');
      });
      console.log(await wraps());
    },
  },
  { /* database: 기본 migration 테스트 */ 
    title: 'build migration',
    async test() {
      const connector = Factory.factory;
      this.assert(connector!=null, 'indexedDB provided');
      const driver = new SampleDriver();
      const db = await driver.idb;
      this.assert(db.version === migration.version, 'version migration');
      const storeNames = Array.from(db.objectStoreNames);
      Object.entries(migration.stores).forEach(([storeName, storeDef])=>{
        this.assert(storeNames.includes(storeName), `store ${storeName} created`);
        // transaction to access object store
        const tx = db.transaction([storeName], 'readonly');
        const store = tx.objectStore(storeName);
        // check indexes
        Object.entries(storeDef.indexes || {}).forEach(([indexName, indexDef])=>{
          this.assert(store.indexNames.contains(indexName), `index ${indexName} created`);
          const index = store.index(indexName);
          const expectedUnique = (typeof indexDef === 'object' && 'unique' in indexDef)
            ? indexDef.unique
            : false;
          this.assert(index.unique === expectedUnique, `index ${indexName} unique=${expectedUnique}`);
        });
      });
    }
  },
  { /* database: 지정 upgrade 테스트 */ 
    title: 'upgrade hook',
  },
  { /* database: 지정 blocked 테스트 */ 
    title: 'blocking hook',
  },
  { /* transaction: reads/writes 데코레이터 테스트 */
    title: 'reads/writes decorator',
    async test() {
      const driver = new SampleDriver();
      const items = await driver.listItems();
      this.assert(items instanceof Array, 'items listed');
      console.log('items', items);
      // put items
      const it = { 
        id: 'item1', 
        label: 'item1',
        sku: 'sku1',
        color: 'red', 
        price: 1000,
        created: new Date(),
      };
      await driver.addItem(it);
      const newList = await driver.listItems();
      this.assert(newList instanceof Array, 'items listed after add');
      this.assert(newList.length === items.length + 1, 'item added');
      console.log('new items', newList);
    }

  },
  { /* transaction: get query 테스트 */
  },
  { /* transaction: async generator 테스트 */

  },
  { /* transaction: index query 테스트 */ 

  },
  { /* transaction: delete entity 테스트 */

  },
  { /* transaction: clear store 테스트 */

  },
  { /* database: close (disconnect) 테스트 */
    title: 'disconnect',
    
  },
  { /* database: drop 테스트 */ 
    title: 'drop the database',
  },
]