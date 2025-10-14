import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: "dist",
    sourcemap: true
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./client/src"),
      "@shared": path.resolve(__dirname, "./shared")
    }
  }
});
    build: {
      outDir: "dist",
      sourcemap: true,
      chunkSizeWarningLimit: 1000,
      rollupOptions: {
        external: [
          'fsevents',
          'chokidar',
          'esbuild',
          'rollup'
        ],
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom'],
            ui: ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu'],
            utils: ['lodash', 'date-fns'],
            auth: ['jwt-decode', 'bcrypt'],
            database: ['drizzle-orm']
          },
          chunkFileNames: 'assets/[name]-[hash].js',
          entryFileNames: 'assets/[name]-[hash].js',
          assetFileNames: 'assets/[name]-[hash].[ext]'
        }
      },
      optimizeDeps: {
        exclude: ['fsevents']
      }
    }
        }
      },
      commonjsOptions: {
        include: [/node_modules/],
        transformMixedEsModules: true
      }
    },
    server: {
      host: "0.0.0.0",
      port: 5000,
      strictPort: true,
      hmr: {
        clientPort: 5000,
      },
    },
    optimizeDeps: {
      include: ['react', 'react-dom'],
      exclude: ['fsevents']
    }
  };
});
