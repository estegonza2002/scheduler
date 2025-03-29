import React, {
	createContext,
	useContext,
	useState,
	ReactNode,
	useCallback,
} from "react";

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
	updateHeader: (
		content: HeaderContent | ((prev: HeaderContent) => HeaderContent)
	) => void;
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

	// Use useCallback to prevent the updateHeader function from being recreated on each render
	const updateHeader = useCallback(
		(content: HeaderContent | ((prev: HeaderContent) => HeaderContent)) => {
			setHeaderContent((prevContent) => {
				// If content is a function, call it with the previous content
				if (typeof content === "function") {
					return content(prevContent);
				}

				// Compare objects to prevent unnecessary updates
				if (JSON.stringify(prevContent) === JSON.stringify(content)) {
					return prevContent; // Return previous content to avoid re-render
				}

				return content;
			});
		},
		[]
	);

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
