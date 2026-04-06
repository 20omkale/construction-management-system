import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react"; 

export default defineConfig({
  plugins: [
    react(),
    tailwindcss()
  ],
  server: {
    port: 3000,
    strictPort: true, // This ensures it fails if 3000 is taken, rather than silently switching to 3001
  },
});