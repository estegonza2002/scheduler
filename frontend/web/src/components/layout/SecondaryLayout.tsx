import React, { ReactNode } from "react";
import { cn } from "../../lib/utils";
import { SecondaryNavbar } from "./SecondaryNavbar";
import { PageContentSpacing } from "../ui/header-content-spacing";
import { ContentContainer } from "../ui/content-container";
import { PageHeader } from "../ui/page-header";

interface SecondaryLayoutProps {
	children: ReactNode;
	title: string;
	description?: string;
	sidebar: ReactNode;
	className?: string;
}

/**
 * SecondaryLayout - A standardized layout for pages with secondary navigation
 *
 * @param children - The main content to display in the content area
 * @param title - Page title displayed in the header
 * @param description - Optional description displayed under the title
 * @param sidebar - The secondary navigation sidebar component to display
 * @param className - Optional additional CSS classes
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
					<PageContentSpacing>
						<ContentContainer className={className}>
							{children}
						</ContentContainer>
					</PageContentSpacing>
				</div>
			</div>
		</>
	);
}
