import { defineConfig, loadEnv } from 'vite';
import legacy from '@vitejs/plugin-legacy';

export default defineConfig(({ command, mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    root: '.',
    build: {
      outDir: 'dist',
      sourcemap: env.VITE_BUILD_MODE !== 'production',
      target: env.VITE_BUILD_MODE === 'production' ? 'es2015' : 'esnext',
      base: env.VITE_BUILD_MODE === 'production' ? '/SP_Sim/' : '/',
      minify: env.VITE_BUILD_MODE === 'production' ? 'terser' : false,
      rollupOptions: {
        input: {
          main: './index.html'
        },
        external: ['fsevents'],
        output: {
          manualChunks: {
            vendor: ['vite'],
            core: ['./src/core/GameEngine.js', './src/core/EconomicSimulation.js'],
            ui: ['./src/ui/components/Dashboard.js', './src/ui/components/EconomicsScreen.js']
          }
        }
      }
    },
    define: {
      // Expose environment variables
      __BUILD_MODE__: JSON.stringify(env.VITE_BUILD_MODE || mode),
      __ENABLE_DEBUG__: JSON.stringify(env.VITE_ENABLE_DEBUG === 'true'),
      __ENABLE_TESTING_FEATURES__: JSON.stringify(env.VITE_ENABLE_TESTING_FEATURES === 'true'),
      __PR_NUMBER__: JSON.stringify(env.VITE_PR_NUMBER || null),
    },
    plugins: [
      legacy({
        targets: ['defaults', 'not IE 11']
      })
    ],
    server: {
      port: 3000,
      open: true,
      cors: true
    },
    preview: {
      port: 4173,
      open: true
    }
  };
});