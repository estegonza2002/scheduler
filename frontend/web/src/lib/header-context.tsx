import React, { createContext, useContext, useState, ReactNode } from "react";

// Define the interface for header content
interface HeaderContent {
	title: string;
	description?: string;
	actions?: React.ReactNode;
	showBackButton?: boolean;
}

// Interface for the context value
interface HeaderContextType {
	headerContent: HeaderContent;
	updateHeader: (content: HeaderContent) => void;
}

// Create the context with undefined default value
const HeaderContext = createContext<HeaderContextType | undefined>(undefined);

/**
 * Provider component for header content management
 */
export function HeaderProvider({ children }: { children: ReactNode }) {
	const [headerContent, setHeaderContent] = useState<HeaderContent>({
		title: "Scheduler",
	});

	const updateHeader = (content: HeaderContent) => {
		setHeaderContent(content);
	};

	return (
		<HeaderContext.Provider value={{ headerContent, updateHeader }}>
			{children}
		</HeaderContext.Provider>
	);
}

/**
 * Hook to use and update header content
 */
export function useHeader() {
	const context = useContext(HeaderContext);

	if (context === undefined) {
		throw new Error("useHeader must be used within a HeaderProvider");
	}

	return context;
}
