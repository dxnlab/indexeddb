import basisCases from './basis.ts';
import databaseCases from './database.ts';

export default [
  { id:'basis', title: 'BasisTest', cases: basisCases.filter(({test})=>Boolean(test)) },
  { id:'database', title: 'DatabaseTest', cases: databaseCases.filter(({test})=>Boolean(test)) },
]