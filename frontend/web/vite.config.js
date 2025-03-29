import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src"),
        },
    },
    define: {
        // Make process.env available in browser or provide a fallback
        "process.env": {},
    },
    server: {
        port: 5173,
        host: "localhost",
        strictPort: true,
        hmr: {
            timeout: 120000, // Increase timeout for WebSocket connection
            protocol: "ws",
            host: "localhost",
            port: 5173,
        },
    },
});
