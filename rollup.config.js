import typescript from '@rollup/plugin-typescript';

export default {
  input: 'src/main.ts', // Your main entry point
  output: [
    {
      file: 'dist/idb.cjs.js', // CommonJS output
      format: 'cjs',
      sourcemap: true,
    },
    {
      file: 'dist/idb.esm.js', // ES Module output
      format: 'esm',
      sourcemap: true,
    },
  ],
  plugins: [
    typescript(), // Use the TypeScript plugin
  ],
};