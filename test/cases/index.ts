import basisCases from './basis.ts';
import databaseCases from './database.ts';
import storesCases from './stores.ts';
import transactionsCases from './transactions.ts';

export default [
  { id:'basis', title: 'BasisTest', cases: basisCases.filter(({test})=>Boolean(test)) },
  { id:'database', title: 'DatabaseTest', cases: databaseCases.filter(({test})=>Boolean(test)) },
  { id:'stores', title: 'StoresTest', cases: storesCases.filter(({test})=>Boolean(test)) },
  { id:'transactions', title: 'TransactionsTest', cases: transactionsCases.filter(({test})=>Boolean(test)) },
]