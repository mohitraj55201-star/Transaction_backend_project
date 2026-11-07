import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// The browser talks to Vite (port 5173). Anything that starts with /api is
// forwarded to your Express server (port 3000). Because the browser only ever
// sees one origin, the login cookie works and you don't need CORS in dev.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "http://localhost:3000",
        changeOrigin: true,
      },
    },
  },
});
