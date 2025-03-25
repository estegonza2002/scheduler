import React, { createContext, useContext, useState, ReactNode } from "react";

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
	return context;
}
