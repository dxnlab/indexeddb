export default {
  /** version here */
  version: 2,
  /** store definitions */
  stores: {
    /** the most simplest store definition
     * store name "users" with keyPath "id"
     * @i.e.:
     * userStore = db.createObjectStore('users', { keyPath: 'id' });
     * 
     * - keyname goes as store name
     * - value accepts string | string[] (keyPath) or, object as:
     *   { key: string|string[],
     *     autoIncrement?: boolean,
     *     indexes?: object(Index definition) }
     */
    users: 'id',

    /** store name goes as key name */
    members: {
      // (required) store.keyName
      key: 'id',
      // store.autoIncrement (default false)
      autoIncrement: false,
      // store index definitions
      indexes: {
        // index name = "name", keyPath = "user_name"
        // @i.e.:
        // userStore.createIndex('name', 'user_name');
        name: 'user_name',
        // index name = "email", keyPath = "email", unique = true, multiEntry = false
        // @i.e.:
        // userStore.createIndex('email', 'email', { unique: true, multiEntry: false });
        email: {
          // keyname (accepts string | string[])
          key: 'email',
          // index.options unique
          unique: true,
          // index.options multiEntry
          multi: false,
        },
      }
    },
  }

  /** (optional) if "upgrade" exists, 
   * it will be called prior 
   * and "stores" be ignored.
   **/
  // upgrade(db: IDBDatabase) { ... },

  /** (optional) called on "onblock". defaults none. */
  // blocked(db: IDBDatabase) { ... },

  /** (optional) called on "abort". defaults none. */
  // abort(err: DOMException) { ... },

  /** (optional) called on "error". defaults none. */
  // error(err: Event) { ... },

  /** (optional) called on "close". defaults none. */
  // close() { ... },
}