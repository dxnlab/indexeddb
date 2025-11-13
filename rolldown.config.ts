import { defineConfig } from 'rolldown';

export default defineConfig([
  /** main build */
  {
    input: 'src/main.ts',
    output: {
      file: 'dist/idb.js',
      format: 'esm',
      minify: true,
      cleanDir: true,
    }
  },
  /** cjs build */
  {
    input: 'src/main.ts',
    output: {
      file: 'dist/idb.cjs',
      format: 'commonjs',
      esModule: true,
      
    }
  },
]);