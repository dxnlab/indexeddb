
import { Factory } from '../../src/factory.ts';
import SampleDriver from '../../src/sample.ts';

export default [
  {
    title: 'cleared at first',
    test: async function () {
      const connector = Factory.factory;
      this.assert(connector!=null, 'indexedDB provided');
      const databases = await connector.databases();
      this.assert(databases instanceof Array, 'databases set');
      this.log(databases);
    }
  },
  {
    title: 'open connection',
    test: async function () {
      const driver = new SampleDriver();
      this.assert(driver!=null, 'driver created');
      const db = await driver.idb;
      this.assert(db instanceof IDBDatabase, 'driver connected');
    }
  },
  {
    title: 'build migration',
  },
  {
    title: 'upgrade hook',
  },
  {
    title: 'blocking hook',
  },
  {
    title: 'create new database',
  },
  {
    title: 'disconnect',
  },
  {
    title: 'reconnect - with out migration',
  },
  {
    title: 'drop the database',
  },
]