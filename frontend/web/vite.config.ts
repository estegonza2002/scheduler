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
	server: {
		port: 5176,
		host: "localhost",
		strictPort: true,
		hmr: {
			timeout: 120000, // Increase timeout for WebSocket connection
			protocol: "ws",
			host: "localhost",
			port: 5176,
		},
	},
});
