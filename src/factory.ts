import type { 
  IDBFactory, 
  IDBDatabase,
  IDBTransactionOptions,
  IDBTransactionMode,
} from "./types.ts";
import { promising } from './utils.ts';

export type IDBMigration = {
  name?: string;
  version?: string | number;
  stores?: {
    [storeName: string]: string | string[] | {
      key: string | string[];
      autoIncrement?: boolean;
      indexes?: {
        [indexName: string]: string | string[] | {
          key: string | string[];
          unique?: boolean;
          multi?: boolean;
        };
      };
    }
  };
  upgrade?(db: IDBDatabase, oldVersion: number, newVersion: number): void;
  blocked?(db: IDBDatabase): void;
  abort?(err: DOMException): void;
  error?(err: Event): void;
  close?(db: IDBDatabase): void;
}

export class Factory {
  static get factory() {
    const idb = (globalThis as any)?.indexedDB 
    || (globalThis as any)?.mozIndexedDB 
    || (globalThis as any)?.webkitIndexedDB 
    || (globalThis as any)?.msIndexedDB;
    if(!idb) {
      throw new Error('indexeddb not supported');
    }
    return idb;
  }

  static get databases():Promise<IDBDatabase[]> {
    return promising(Factory.factory.databases);
  }

  protected connector:Promise<IDBDatabase> | null = null;

  constructor(
    // target constructor
    protected target:Function,
    // indexedDB database name
    protected dbname:string,
    // (optional) indexedDB migration option
    protected migration?:IDBMigration,
    // (optional) keyname to store on target class
    protected keyname:string='_idb'
  ) {
    Object.defineProperty(target, keyname, {
      get: ()=>this.db,
    });
  }

  get db():Promise<IDBDatabase> {
    if(!this.connector) {
      this.connector = this.open();
    }
    return this.connector;
  }

  open():Promise<IDBDatabase> {
    // request builder
    const builder = ((db:IDBFactory)=>db.open(this.dbname, this.migration?.version));
    const handler = promising(builder, {
      // triggers
      onupgradeneeded: this.migration?.upgrade || this.onUpgrade.bind(this),
      onblocked: this.migration?.blocked,
      onabort: this.migration?.abort,
      onerror: this.migration?.error,
    }, this);
    return handler(Factory.factory) as Promise<IDBDatabase>;
  }

  async close():Promise<void> {
    if(this.connector!=null) {
      const idb = await this.connector;
      const builder = (db:IDBDatabase)=>db.close();
      const handler = promising(builder, {}, this);
      await handler(idb)
        .finally(()=>{
          this.connector = null;
        });
    }
  }

  async clear():Promise<void> {
    const builder = (db:IDBFactory)=>db.deleteDatabase(this.dbname);
    const handler = promising(builder, {}, this);
    await handler(Factory.factory);
  }

  onUpgrade({target}:{target:any}) {
    const db:IDBDatabase = target.result;
    console.log('on upgrade called', this);
    
    Object.entries(this?.migration?.stores || {})
      .forEach(([storeName, storeDef])=>{
        const store = db.createObjectStore(storeName, {
          keyPath: storeDef?.key || storeDef,
          autoIncrement: storeDef?.autoIncrement,
        });
        if(storeDef?.indexes) {
          // create indexes
          Object.entries(storeDef.indexes || {}).forEach(([indexName, indexDef])=>{
            store.createIndex(indexName, 
              indexDef?.key || indexDef, {
                unique: indexDef?.unique,
                multiEntry: indexDef?.multi,
              });
          });
        }
      });
  }

  public transaction(storeNames:string[],
    mode:IDBTransactionMode='readonly',
    options?:IDBTransactionOptions
  ) {
    const asyncDB = this.connector;
    return function(asyncFx) {
      return async function(this, ...args) {
        try {
          const idb = await asyncDB;
          const tx = idb.transaction(storeNames, mode, options);
          const rss = await asyncFx.apply(this, [tx, ...args]);
          if(mode!=='readonly') {
            tx.commit();
          }
          return rss;
        } catch(ex) {
          tx.abort();
          throw ex;
        }
      }
    }
  }
}