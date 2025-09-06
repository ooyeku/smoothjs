import { defineConfig } from 'vite';
import path from 'path';

// We support two scenarios:
// - Dev: serve the examples (root: examples) with alias to the library entry
// - Build: bundle the library from project root to dist (ESM)
export default defineConfig(({ command, mode }) => {
  const isBuild = command === 'build';

  if (!isBuild) {
    const isTodo = mode === 'todo' || process.env.EXAMPLE_ROOT === 'todo';
    const isCounter = mode === 'counter' || process.env.EXAMPLE_ROOT === 'counter';
    const isForms = mode === 'forms' || process.env.EXAMPLE_ROOT === 'forms';
    const rootDir = isTodo ? 'examples/todo' : (isCounter ? 'examples/counter' : (isForms ? 'examples/forms' : 'examples'));
    return {
      root: path.resolve(__dirname, rootDir),
      server: {
        port: 5173,
        open: true,
        fs: {
          // allow importing from project root (../index.js) if needed
          allow: [path.resolve(__dirname)]
        }
      },
      resolve: {
        alias: {
          // allow: import { ... } from 'smoothjs'
          smoothjs: path.resolve(__dirname, 'index.js')
        }
      }
    };
  }

  // Library build
  return {
    build: {
      lib: {
        entry: path.resolve(__dirname, 'index.js'),
        name: 'SmoothJS',
        formats: ['es'],
        fileName: () => 'smoothjs.esm.js'
      },
      outDir: 'dist',
      emptyOutDir: false,
      sourcemap: true,
      rollupOptions: {
        // Keep dependencies external if needed; this lib is zero-dep
        external: [],
      }
    }
  };
});
