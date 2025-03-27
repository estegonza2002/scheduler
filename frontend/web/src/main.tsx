import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { Toaster } from "./components/ui/sonner";
import { setupErrorLogging } from "./utils/debugUtils";
import { ThemeProvider } from "./components/ThemeProvider";

// Set up enhanced error logging
setupErrorLogging();

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
	<>
		<ThemeProvider defaultTheme="system">
			<App />
			<Toaster />
		</ThemeProvider>
	</>
);
