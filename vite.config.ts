import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { crx } from '@crxjs/vite-plugin'

export default defineConfig({
  plugins: [
    react(),
    crx({
      manifest: {
        manifest_version: 3,
        name: "Safe Scan",
        version: "1.0.0",
        web_accessible_resources: [
          {
            resources: ["MILE-oh.jpg"],
            matches: ["<all_urls>"],
          },
        ],

        action: {
          default_popup: "index.html",
        },

        content_scripts: [
          {
            matches: ["<all_urls>"],
            js: ["src/content.ts"],
          },
        ],

        permissions: ["activeTab"],
      }
    }),
  ],
})