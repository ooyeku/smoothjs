import { defineConfig } from 'vite';
import path from 'path';

// We support two scenarios:
// - Dev: serve the examples (root: examples) with alias to the library entry
// - Build: bundle the library from project root to dist (ESM)
export default defineConfig(({ command, mode }) => {
  const isBuild = command === 'build';

  if (!isBuild) {
    return {
      root: path.resolve(__dirname, 'examples'),
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
