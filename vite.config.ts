import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: [
        'icon.png',
        'icon-192.png',
        'icon-512.png',
        'favicon-32.png',
        'apple-touch-icon.png',
      ],
      manifest: {
        id: '/',
        name: 'StillRoll',
        short_name: 'StillRoll',
        description:
          'Local infinite photo slideshow — works offline with .stillroll packages.',
        theme_color: '#0f2a38',
        background_color: '#0a1c26',
        display: 'standalone',
        start_url: '/',
        icons: [
          {
            src: '/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: '/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: '/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
          {
            src: '/apple-touch-icon.png',
            sizes: '180x180',
            type: 'image/png',
          },
        ],
        file_handlers: [
          {
            action: '/',
            accept: {
              'application/zip': ['.stillroll'],
            },
          },
        ],
      },
      workbox: {
        globPatterns: [
          '**/*.{js,css,html,ico,png,svg,woff2,woff,webmanifest}',
        ],
        maximumFileSizeToCacheInBytes: 3 * 1024 * 1024,
        // workbox-build terser fails under Node 26 in production mode
        mode: 'development',
      },
      devOptions: {
        enabled: true,
        type: 'module',
      },
    }),
  ],
})
