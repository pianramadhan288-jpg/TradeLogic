
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import process from 'node:process';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Explicitly using process.cwd() from the imported node process to resolve type definition issues.
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    plugins: [react()],
    define: {
      // Explicitly define process.env.API_KEY to ensure it's replaced by the string value during build
      'process.env.API_KEY': JSON.stringify(env.API_KEY || process.env.API_KEY),
    }
  };
});
