import { IDBTransaction } from "./types.ts";
import { wrapStore } from "./store.ts";

export function wrapTx(transaction:IDBTransaction) {
  const storeNames = Array.from(transaction.objectStoreNames);
  return new Proxy(transaction, {
    get(tx:IDBTransaction, prop:string, receiver:any) {
      if(prop === '__tx' || prop === '__transaction') {
        return tx;
      } else if(tx?.[prop] !== undefined) {
        return tx[prop as keyof IDBTransaction];
      } else if(storeNames.includes(prop as string)) {
        const key = `__${prop}`;
        if(!receiver?.[key]) {
          receiver[key] = wrapStore(tx.objectStore(prop));
        }
        return receiver[key];
      } else {
        return Reflect.get(tx, prop, receiver);
      }
    },
    ownKeys(tx:IDBTransaction) {
      return Reflect.ownKeys(tx).concat(storeNames);
    }
  });

}