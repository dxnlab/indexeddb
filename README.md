# @dxnlab/idb (yet experimental)

> **!!** This library has not yet tested at fields.

- [] factory instance injection
- [] promise wrap on IDBObjectStore methods
- [] migration builder
- [] staging


> ***@refer*** [npm:idb](https://www.npmjs.com/package/idb) wrapper

[IndexedDB](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API) wrapper via [TypeScript ^5 decorator stage 3](https://devblogs.microsoft.com/typescript/announcing-typescript-5-0/#decorators)

## (Intent) Install

```bash
'npm
$ npm install @dxnlab/idb
```


## (Intent) Use

```typescript
import { idb, reads, writes } from '@dxnlab/idb';
import migration from './mydb.migration.ts';

@idb('mydb', migration)
class IDBDriver {
    @reads('items')
    async *items(tx) {
        const cursor = await tx.items.openCursor();
        while(cursor) {
            yield cursor.value;
            cursor.continue();
        }
    }

    @writes('items')
    async addItem(tx, item:object) {
        return await tx.items.add(item);
    }
}
```

---

## Development

- deno v2.5.6 (stable release)
- typescript v5.9.2

```bash
# after git clone, installing 
idb> deno install

# unit testing the library - in browser
idb> deno run dev

# buliding the library distro
idb> deno run build
```




---
This work is licensed under <a href="https://creativecommons.org/licenses/by/4.0/">CC BY 4.0</a><img src="https://mirrors.creativecommons.org/presskit/icons/cc.svg" alt="" style="max-width: 1em;max-height:1em;margin-left: .2em;"><img src="https://mirrors.creativecommons.org/presskit/icons/by.svg" alt="" style="max-width: 1em;max-height:1em;margin-left: .2em;">