import React, { createContext, useContext, useState, ReactNode } from "react";
import { useHeader } from "./header-context";

// DEPRECATED: This entire module is deprecated
// Please use the new HeaderProvider and useHeader() from header-context.tsx instead

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
			"DEPRECATED: LayoutContext.updatePageHeader is deprecated. Please use the useHeader() hook from header-context.tsx instead."
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
	// Try to use the new header context first if available
	try {
		const headerContext = useHeader();
		console.warn(
			"DEPRECATED: useLayout is deprecated. The call has been redirected to useHeader(), but you should update your code to use useHeader() directly."
		);

		// Create a compatibility layer that maps new to old
		return {
			pageHeader: {
				title: headerContext.headerContent.title,
				description: headerContext.headerContent.description,
				actions: headerContext.headerContent.actions,
			},
			updatePageHeader: (headerInfo: PageHeaderInfo) => {
				headerContext.updateHeader({
					title: headerInfo.title,
					description: headerInfo.description,
					actions: headerInfo.actions,
				});
			},
		};
	} catch (e) {
		// Fall back to legacy context if new context is not available
		const context = useContext(LayoutContext);
		if (context === undefined) {
			throw new Error("useLayout must be used within a LayoutProvider");
		}

		// Add a console warning about deprecation
		console.warn(
			"DEPRECATED: useLayout is deprecated. Please use the useHeader() hook from header-context.tsx instead."
		);

		return context;
	}
}
