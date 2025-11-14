

import { type IDBMigration, Factory } from "./factory.ts";
import { IDBTransactionMode, IDBTransactionOptions } from "./types.ts";

/** decorator */
export function idb(name:string, migration?:IDBMigration) {
  return function (constructor) {
    const idb = new Factory(constructor, name, migration);
    constructor.prototype._idb = idb.db;
    
    console.log('idb decorator', {
      name, 
      migration, 
      arguments, 
      constructor,
    });
    // return constructor;
  }
}

export function withTx(
  storeNames:string|string[], 
  mode:IDBTransactionMode='readonly', 
  options?:IDBTransactionOptions) {
  return function(origin) {
    return async function(this, ...args) {
      const idb = await this._idb;
      const wrapTx = idb.transaction(storeNames, mode, options);
      return await wrapTx(origin).apply(this, args);
    }
  }
}

export function reads(...storeNames:string[]):Function {
  return withTx(storeNames, 'readonly');
}

export function writes(...storeNames:string[]):Function {
  return withTx(storeNames, 'readwrite');
}

export function flush(...storeNames:string[]):Function {
  return withTx(storeNames, 'readwrite', { durability: 'strict' });
}

export { type IDBMigration } from "./factory.ts";