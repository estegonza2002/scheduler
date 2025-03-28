import React, { ReactNode } from "react";
import { cn } from "../../lib/utils";
import { ContentContainer } from "../ui/content-container";
import { PageHeader } from "../ui/page-header";

type SecondaryLayoutProps = {
	/** The main content to display in the content area */
	children: ReactNode;
	/** Page title displayed in the header */
	title: string;
	/** Optional description displayed under the title */
	description?: string;
	/** The secondary navigation sidebar component to display */
	sidebar: ReactNode;
	/** Optional additional CSS classes */
	className?: string;
};

/**
 * SecondaryLayout - A standardized layout for pages with secondary navigation
 *
 * Provides a consistent structure with a header, sidebar, and content area
 * for pages that require supplementary navigation.
 */
export function SecondaryLayout({
	children,
	title,
	description,
	sidebar,
	className,
}: SecondaryLayoutProps) {
	return (
		<>
			<PageHeader
				title={title}
				description={description}
			/>

			<div className="flex flex-col lg:flex-row">
				{/* Sidebar container */}
				<div className="w-full lg:w-64 flex-shrink-0">{sidebar}</div>

				{/* Main content container */}
				<div className="flex-1">
					<ContentContainer className={className}>{children}</ContentContainer>
				</div>
			</div>
		</>
	);
}
