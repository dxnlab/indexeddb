import type { IDBObjectStore } from './types.ts';
import { promising } from "./utils.ts";

export function wrapStore(store:IDBObjectStore) {
  return new Proxy(store, {
    get(store:IDBObjectStore, prop:string, receiver:any) {
      switch(prop) {
        case '__store':
          return store;
        case 'name':
        case 'indexNames':
        case 'transaction': 
        case 'index':
          return store?.[prop as keyof IDBObjectStore];
        case 'add': 
        case 'clear': 
        case 'count': 
        case 'get': 
        case 'put': 
        case 'delete': 
        case 'getAll': 
        case 'getAllKeys': 
        case 'openCursor': 
        case 'openKeyCursor': 
          if(!receiver?.[prop]) {
            receiver[prop] = promising(store[prop as keyof IDBObjectStore].bind(store));
          }
          return receiver[prop];
        default: 
          return Reflect.get(store, prop, receiver);
      }
    }
  });
}