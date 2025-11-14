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
  /** sample for test  */
  {
    input: 'src/sample.ts',
    output: {
      file: 'dist/sample.js',
      format: 'esm',
      minify: false,
    }
  }
]);