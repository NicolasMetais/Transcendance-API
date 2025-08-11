import { defineConfig } from "vite";

export default defineConfig({
  server: {
    port: 5173,
    host: true // écoute sur 0.0.0.0 pour Docker
  }
});
