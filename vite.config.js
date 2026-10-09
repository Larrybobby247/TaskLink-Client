import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'sw.js',
      injectManifest: {
        maximumFileSizeToCacheInBytes: 3_000_000,
      },
      manifest: {
        name: 'TaskLink',
        short_name: 'TaskLink',
        description: 'Need something done? Find someone nearby.',
        theme_color: '#1E3A5F',
        background_color: '#ffffff',
        display: 'standalone',
        icons: [
          { src: './src/assets/126895-removebg-preview.png', sizes: '192x192', type: 'image/png' },
          { src: './src/assets/126895-removebg-preview.png', sizes: '512x512', type: 'image/png' },
        ],
      },
    }),
  ],
  server: {
    port: 5173,
    proxy: {
      '/api': { target: 'https://api.tasklink.com.ng', changeOrigin: true },
    },
  },
});
