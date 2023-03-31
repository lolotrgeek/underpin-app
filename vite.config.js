import { defineConfig } from "vite";
import viteTsconfigPaths from "vite-tsconfig-paths";
import svgrPlugin from "vite-plugin-svgr";
import react from '@vitejs/plugin-react'
import { NodeGlobalsPolyfillPlugin } from '@esbuild-plugins/node-globals-polyfill'
import { NodeModulesPolyfillPlugin } from '@esbuild-plugins/node-modules-polyfill'
import nodePolyfills from 'rollup-plugin-polyfill-node';

// https://vitejs.dev/config/
export default defineConfig({
  // https://github.com/vitejs/vite/issues/1973
  define: {
    "process.env": {},
    // // By default, Vite doesn't include shims for NodeJS/
    // // necessary for segment analytics lib to work
    "global": {}
  },
  resolve: {
    alias: {
        buffer: "buffer",
        crypto: "crypto-browserify",
        stream: "stream-browserify",
        assert: "assert",
        http: "stream-http",
        https: "https-browserify",
        os: "os-browserify",
        url: "url",
        util: "util",
        path: "path-browserify",
    },
},
  plugins: [viteTsconfigPaths(), svgrPlugin(), react()],
  optimizeDeps: { // 👈 optimizedeps
    exclude: ["app/dialer.js"],
    esbuildOptions: {
      target: "esnext",
      // Node.js global to browser globalThis
      define: {
        global: 'globalThis'
      },
      supported: {
        bigint: true
      },
      plugins: [
        NodeGlobalsPolyfillPlugin({
          buffer: true,
          process: true,
        }),
      ]
    }
  },

  build: {
    target: ["esnext"], // 👈 build.target
    rollupOptions: {
      plugins: [
        // Enable rollup polyfills plugin
        // used during production bundling
        nodePolyfills()
      ]
    }
  },
});