import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import type { Plugin } from 'vite'

// Plugin to replace environment variables in HTML
function htmlEnvReplace(): Plugin {
  return {
    name: 'html-env-replace',
    transformIndexHtml(html) {
      const gaId = process.env.VITE_GA_ID || '';
      return html.replace(/%VITE_GA_ID%/g, gaId);
    },
  }
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), htmlEnvReplace()],
  base: '/', // Base path for Vercel deployment
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      }
    }
  }
})
