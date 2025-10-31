
import { assert } from "node:console";
import { type IDBMigration, Factory } from "./factory.ts";
import { IDBTransactionMode, IDBTransactionOptions } from "./types.ts";

/** decorator */
export function idb(name:string, migration?:IDBMigration) {
  return function (target:Function) {
    const idb = new Factory(target, name, migration);
    Object.defineProperty(Object.getPrototypeOf(target), '_idb', {
      get: () => idb.db,
    });
    return target;
  }
}

export function withTx(
  storeNames:string|string[], 
  mode:IDBTransactionMode='readonly', 
  options?:IDBTransactionOptions) {
  return function(origin:Function) {
    return async function(this:any, ...args:any[]) {
      assert(this?._idb, 'IDBDriver not set');
      const idb = await this._idb;
      const wrapTx = idb.transaction(storeNames, mode, options);
      return await wrapTx(origin).apply(this, args);
    }
  }
}

export function reads(...storeNames:string[]) {
  return withTx(storeNames, 'readonly');
}

export function writes(...storeNames:string[]) {
  return withTx(storeNames, 'readwrite');
}

export function flush(...storeNames:string[]) {
  return withTx(storeNames, 'readwrite', { durability: 'strict' });
}

export { type IDBMigration } from "./factory.ts";