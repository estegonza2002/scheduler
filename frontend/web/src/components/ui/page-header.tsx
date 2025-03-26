import React from "react";
import { cn } from "../../lib/utils";
import { Button } from "./button";
import { ChevronLeft } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { SidebarTrigger } from "./sidebar";

interface PageHeaderProps {
	/**
	 * The title of the page
	 */
	title: string;
	/**
	 * Optional description text to display under the title
	 */
	description?: string;
	/**
	 * Optional action buttons to display in the header
	 */
	actions?: React.ReactNode;
	/**
	 * Optional additional className for the header container
	 */
	className?: string;
	/**
	 * Optional additional className for the title text
	 */
	titleClassName?: string;
	/**
	 * Optional additional className for the description text
	 */
	descriptionClassName?: string;
	/**
	 * Optional additional className for the actions container
	 */
	actionsClassName?: string;
	/**
	 * Whether to show the back button
	 * @default true
	 */
	showBackButton?: boolean;
}

// List of top-level pages that shouldn't show a back button
const TOP_LEVEL_PAGES = [
	"/dashboard",
	"/admin-dashboard",
	"/daily-shifts",
	"/schedule",
	"/employees",
	"/locations",
	"/shifts",
	"/profile",
	"/business-profile",
	"/billing",
	"/branding",
	"/notifications",
	"/messages",
];

/**
 * PageHeader component for consistent page headers across the application
 * Now includes navigation controls previously in the global header
 */
export function PageHeader({
	title,
	description,
	actions,
	className,
	titleClassName,
	descriptionClassName,
	actionsClassName,
	showBackButton = true,
}: PageHeaderProps) {
	const navigate = useNavigate();
	const location = useLocation();

	// Determine if current page should show back button (not on main/top-level pages)
	const isTopLevelPage = TOP_LEVEL_PAGES.includes(location.pathname);

	const handleGoBack = () => {
		navigate(-1);
	};

	return (
		<header
			className={cn(
				"sticky top-0 flex h-16 shrink-0 items-center border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 z-40",
				className
			)}>
			<div className="flex flex-1 items-center">
				<div className="flex items-center gap-2">
					<SidebarTrigger className="-ml-1" />
					{showBackButton && !isTopLevelPage && (
						<Button
							variant="ghost"
							size="icon"
							onClick={handleGoBack}
							className="h-8 w-8"
							title="Go back">
							<ChevronLeft className="h-5 w-5" />
						</Button>
					)}
				</div>
				<div className="mx-4">
					<h1 className={cn("text-lg font-semibold", titleClassName)}>
						{title}
					</h1>
					{description && (
						<p
							className={cn(
								"text-xs text-muted-foreground",
								descriptionClassName
							)}>
							{description}
						</p>
					)}
				</div>
			</div>
			{actions && (
				<div
					className={cn(
						"flex items-center justify-end gap-3",
						actionsClassName
					)}>
					{actions}
				</div>
			)}
		</header>
	);
}
