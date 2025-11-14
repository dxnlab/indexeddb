import { idb, reads, writes } from "./main.ts";

export type Item = {
  id: string;
  label: string;
  sku: string;
  color: string;
  price: number;
  created: Date;
}

export const migration = {
  version: 1,
  stores: {
    items: {
      key: 'id',
      indexes: {
        color: 'color',
        sku: {
          key: 'sku',
          unique: true,
        }
      }
    }
  }
}

@idb('idb-sample', migration)
class IDBSample {
  get idb() {
    // @ts-ignore: decorator adds
    return this._idb;
  }

  @reads('items')
  async listItems(tx, condition?:IDBKeyRange, count?:number):Promise<Item[]> {
    return await tx.items.getAll(condition, count);
  }

  @reads('items')
  async *queryItems(tx, condition?:IDBKeyRange) {
    for await(const cursor of tx.items.openCursor(condition)) {
      yield cursor.value;
    }
  }

  @reads('items')
  async getItem(tx, id:string):Promise<Item|null> {
    return await tx.items.get(id);
  }

  @writes('items')
  async addItem(tx, item:Item):Promise<void> {
    await tx.items.add(item);
  }

  @writes('items')
  async editItem(tx, id:string, item:Partial<Item>):Promise<void> {
    await tx.items.put({...item, id}, id);
  }

  @writes('items')
  async deleteItem(tx, id:string):Promise<void> {
    await tx.items.delete(id);
  }

  @writes('items')
  async clearItems(tx):Promise<void> {
    await tx.items.clear();
  }
}

console.log(
  'proto',
  IDBSample.prototype,
);

export default IDBSample;
