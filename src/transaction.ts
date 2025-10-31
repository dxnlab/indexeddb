import { IDBTransaction } from "./types.ts";
import { wrapStore } from "./store.ts";

export function wrapTx(transaction:IDBTransaction) {
  return new Proxy(transaction, {
    get(tx:IDBTransaction, prop:string, receiver:any) {
      if(tx?.[prop] !== undefined) {
        return tx[prop as keyof IDBTransaction];
      } else if(prop in tx.objectStoreNames) {
        const key = `__${prop}`;
        if(!receiver?.[key]) {
          receiver[key] = wrapStore(tx.objectStore(prop));
        }
        return receiver[key];
      } else {
        return Reflect.get(tx, prop, receiver);
      }
    }
  });

}