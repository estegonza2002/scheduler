import React, { createContext, useContext, useState, ReactNode } from "react";

// Note: This context is now deprecated as we've moved to page-specific headers
// It's kept for backward compatibility with existing pages

interface PageHeaderInfo {
	title: string;
	description?: string;
	actions?: React.ReactNode;
}

interface LayoutContextType {
	pageHeader: PageHeaderInfo;
	updatePageHeader: (headerInfo: PageHeaderInfo) => void;
}

const LayoutContext = createContext<LayoutContextType | undefined>(undefined);

export function LayoutProvider({ children }: { children: ReactNode }) {
	const [pageHeader, setPageHeader] = useState<PageHeaderInfo>({
		title: "Scheduler",
	});

	const updatePageHeader = (headerInfo: PageHeaderInfo) => {
		// Add a console warning to indicate deprecation
		console.warn(
			"LayoutContext.updatePageHeader is deprecated. Please use the PageHeader component directly in your page component instead."
		);

		// Only update if the values are actually different
		if (
			pageHeader.title !== headerInfo.title ||
			pageHeader.description !== headerInfo.description ||
			pageHeader.actions !== headerInfo.actions
		) {
			setPageHeader(headerInfo);
		}
	};

	return (
		<LayoutContext.Provider value={{ pageHeader, updatePageHeader }}>
			{children}
		</LayoutContext.Provider>
	);
}

export function useLayout() {
	const context = useContext(LayoutContext);
	if (context === undefined) {
		throw new Error("useLayout must be used within a LayoutProvider");
	}

	// Add a console warning about deprecation
	console.warn(
		"useLayout is deprecated. Please use the PageHeader component directly in your page component instead."
	);

	return context;
}
