// @ts-ignore-file
/**
 * Simple scenario example of @dnxlab/idb use.
 */

import { idb, reads, writes } from '@dnxlab/idb';
import migration from './simple.migration.ts';

/**
 * Simple IDB Driver example.
 * @idb decorator inject the IDBDatabase instance getter "_idb"
 * Then in the class, it can have @reads, @writes or @flush,
 * respectively for read, write or versionchange transaction modes,
 * transaction decorators on its methods.
 * the decorator wraps the method to be executed,
 * in the context of the Transaction.
 * 
 * And the user do not need to handle migrations,
 * it will build up the stores and indexes to meets its migration,
 * on UpgradeNeeded event.
 * 
 */
@idb('mydb', migration)
class IDBDriverSimple {
  /*
   * wrap with: 
   *  tx = _idb.transaction('users', 'readonly')
   */
  @reads('users')
  async *allUsers(tx:IDBTransaction) {
    // tx is proxies to have direct access to object stores,
    // as tx.users:IDBObjectStore
    const cursor = await tx.users.openCursor();
    while(cursor) {
      yield cursor.value;
      cursor.continue();
    }
  }

  /*
   * any transaction methods, @reads, @writes and @flush,
   * can have multiple stores at once:
   *   reads(...storeNames:string[])
   *   writes(...storeNames:string[])
   *   flush(...storeNames:string[])
   *  or, withTx(
   *    storeNames:string|string[], 
   *    mode:IDBTransactionMode, 
   *    options?:IDBTransactionOptions)
   */
  @reads('users', 'others')
  async getUser(tx:IDBTransaction, id:string) {
    return await tx.users.get(id);
  }

  /*
   * wrap with: 
   *  tx = _idb.transaction('users', 'readwrite')
   */
  @writes('users')
  async putUsers(tx:IDBTransaction, ...users:User) {
    return await Promise.all(users.map(async (user)=>{
      return await tx.users.put(user);
    }));
  }
}

/** 
 * Now, how to use? simple:
 **/
const driver = new IDBDriverSimple();
export async function getUser(id:string) {
  // tx:IDBTransaction gets hidden because of the decorator
  return await driver.getUser(id);
}

export async function *userGenerator() {
  yield* driver.allUsers();
}

export async function addUsers(...users:User) {
  return await driver.putUsers(...users);
}