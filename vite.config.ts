import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { crx } from '@crxjs/vite-plugin'

export default defineConfig({
  plugins: [
    react(),
    crx({
      manifest: {
        manifest_version: 3,
        name: "MILE-oh",
        version: "1.0.0",
        description: "MILE-oh is a friendly media and information literacy companion that helps you spot potential risks, check sources, and practice safer choices online.",
        icons: {
          "16": "mile-oh-icon-16.png",
          "32": "mile-oh-icon-32.png",
          "48": "mile-oh-icon-48.png",
          "128": "mile-oh-icon-128.png",
        },
        web_accessible_resources: [
          {
            resources: ["MILE-oh_lightmode.jpg", "MILE-oh_darkmode.jpg"],
            matches: ["<all_urls>"],
          },
        ],

        action: {
          default_popup: "index.html",
        },
        side_panel: {
          default_path: "index.html",
        },

        content_scripts: [
          {
            matches: ["<all_urls>"],
            js: ["src/content.ts"],
          },
        ],

        permissions: ["activeTab", "storage", "sidePanel"],
        // Local development. Replace this with your HTTPS API origin before publishing.
        host_permissions: ["http://localhost:3000/*"],
      }
    }),
  ],
})
