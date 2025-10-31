/** type definition @refers MDN 
 * https://developer.mozilla.org/en-US/docs/Web/API/IDBFactory 
 **/
type strings = string | string[];
type numeric = number | string;
type keytypes = string | Date | number | Blob;
type keyables = keytypes | Array<keytypes>;
type valuetypes = keytypes | RegExp | undefined | null;
type valueobj = { [key:symbol]: valuetypes | valueobj };
type valueables = valuetypes | Array<valuetypes> | valueobj;

export type IDBFactory = {
  open(name:string, version?:numeric): IDBOpenDBRequest;
  deleteDatabase(name:string): IDBOpenDBRequest;
  cmp(left:valueables, right:valueables): -1 | 0 | 1;
  databases(): Promise<IDBDatabaseInfo[]>;
}

export type IDBDatabaseInfo = {
  name: string;
  version: number;
}

export type IDBDatabase = IDBDatabaseInfo & {
  objectStoreNames: DOMStringList;
  close(name:string): void;
  createObjectStore(name:string, options?:IDBObjectStoreInfo): IDBObjectStore;
  deleteObjectStore(name:string): void;
  transaction(storeNames:strings, mode?:IDBTransactionMode, options?:IDBTransactionOptions): IDBTransaction;
}
export type IDBTransactionMode = 'readonly' | 'readwrite' | 'versionchange';
export type IDBTransactionOptionDurability = 'default' | 'relaxed' | 'strict';
export type IDBTransactionOptions = {
  durability?: IDBTransactionOptionDurability;
}
export type IDBObjectStoreInfo = {
  keyPath?: strings;
  autoIncrement?: boolean;
}
export type IDBTransaction = {
  db:IDBDatabase;
  error?: DOMException;
  mode: IDBTransactionMode;
  objectStoreNames: DOMStringList;
  abort(): void;
  commit(): void;
  objectStore(name:string): IDBObjectStore;
}

export type IDBObjectStore = IDBObjectStoreInfo & {
  name: string;
  indexNames: DOMStringList;
  transaction: IDBTransaction;

  add(value:valueables, key?:keyables): IDBRequest<valueables>;
  clear(): IDBRequest<void>;
  count(query?:IDBKeyRange): IDBRequest<number>;

  createIndex(name:string, keyPath:strings, options?:IDBIndexOptions): IDBIndex;
  deleteIndex(name:string): void;

  get(key:keyables): IDBRequest<valueables | undefined>;
  getKey(key:keyables): IDBRequest<keyables | undefined>;
  getAll(query?:IDBKeyRange, count?:number): IDBRequest<valueables[]>;
  getAll(query?:IDBQueryOptions): IDBRequest<valueables[]>;
  getAllKeys(query?:IDBKeyRange, count?:number): IDBRequest<keyables[]>;
  getAllKeys(query?:IDBQueryOptions): IDBRequest<keyables[]>;
  index(name:string): IDBIndex;
  openCursor(query?:IDBKeyRange, direction?:IDBCursorDirection): IDBRequest<IDBCursorWithValue | null>;
  openCursor(query?:IDBQueryOptions): IDBRequest<IDBCursorWithValue>;
  openKeyCursor(query?:IDBKeyRange, direction?:IDBCursorDirection): IDBRequest<IDBCursor | null>;
  openKeyCursor(query?:IDBQueryOptions): IDBRequest<IDBCursor | null>;
  put(value:valueables, key?:keyables): IDBRequest<valueables>;
  delete(key:keyables): IDBRequest<void>;
}

export type IDBIndexOptions = {
  unique?: boolean;
  multiEntry?: boolean;
}

export type IDBIndex = IDBIndexOptions & {
  name: string;
  keyPath: strings | null;
  objectStore: IDBObjectStore;

  isAutoLocale: boolean;

  count(key?:keyables): IDBRequest<number>;
  get(key?:keyables): IDBRequest<valueables | undefined>;
  getKey(key?:keyables): IDBRequest<keyables | undefined>;
  getAll(query?:IDBKeyRange, count?:number): IDBRequest<valueables[]>;
  getAll(query?:IDBQueryOptions): IDBRequest<valueables[]>;
  getAllKeys(query?:IDBKeyRange, count?:number): IDBRequest<keyables[]>;
  getAllKeys(query?:IDBQueryOptions): IDBRequest<keyables[]>;
  getAllRecords(query?:IDBQueryOptions): IDBRequest<{key:keyables, primaryKey:keyables, value:valueables}[]>;
  openCursor(range?:IDBKeyRange, direction?:IDBCursorDirection): IDBRequest<IDBCursorWithValue | null>;
  openKeyCursor(range?:IDBKeyRange, direction?:IDBCursorDirection): IDBRequest<IDBCursorWithValue | null>;  
}

export type IDBQueryOptions = {
  query?: IDBKeyRange | null;
  direction?: IDBCursorDirection;
  unique?: boolean;
};
export type IDBKeyRange = {
  lower?: keyables;
  lowerOpen?: boolean;
  upper?: keyables;
  upperOpen?: boolean;

  includes(key:keyables): boolean;
}

export type IDBRequest<T> = {
  result: T;
  error?: DOMException;
  source?: EventTarget;
  transaction?: IDBTransaction;
}

export type IDBOpenDBRequest = IDBRequest<IDBDatabase> & {
  onupgradeneeded: ((this: IDBOpenDBRequest, ev: IDBVersionChangeEvent) => void) | null;
  onblocked: ((this: IDBOpenDBRequest, ev: Event) => void) | null;
  onabort: ((this: IDBOpenDBRequest, ev: Event) => void) | null;
  onerror: ((this: IDBOpenDBRequest, ev: Event) => void) | null;
}

export type IDBVersionChangeEvent = Event & {
  oldVersion: number;
  newVersion: number | null;
  target: IDBOpenDBRequest;
}

export type IDBCursorDirection = "next" | "nextunique" | "prev" | "prevunique";
export type IDBCursor = {
  source: IDBObjectStore | IDBIndex;
  direction: IDBCursorDirection;
  key: keyables;
  primaryKey: keyables;
  request: IDBRequest<any>;
  advance(count:number): void;
  continue(key?:keyables): void;
  continuePrimaryKey(key:keyables, primaryKey:keyables): void;
  delete(): IDBRequest<void>;
  update(value:valueables): IDBRequest<valueables>;
}
export type IDBCursorWithValue = IDBCursor & {
  value: valueables;
}
