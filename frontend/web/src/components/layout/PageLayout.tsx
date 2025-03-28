import * as React from "react";
import { cn } from "../../lib/utils";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
	CardDescription,
	CardFooter,
} from "../ui/card";

type CommonProps = {
	children: React.ReactNode;
	className?: string;
};

/**
 * PageLayout - Main layout container for page content
 */
export function PageLayout({ children, className }: CommonProps) {
	return (
		<div className={cn("px-4 py-6 md:px-6 lg:px-8 w-full", className)}>
			{children}
		</div>
	);
}

/**
 * PageHeader - Header section of a page with consistent styling
 */
export function PageHeader({ children, className }: CommonProps) {
	return <CardHeader className={cn("mb-6", className)}>{children}</CardHeader>;
}

/**
 * PageTitle - Primary heading for a page
 */
export function PageTitle({ children, className }: CommonProps) {
	return (
		<CardTitle className={cn("text-2xl font-bold tracking-tight", className)}>
			{children}
		</CardTitle>
	);
}

/**
 * PageDescription - Supplementary text that appears below the page title
 */
export function PageDescription({ children, className }: CommonProps) {
	return (
		<CardDescription className={cn("mt-2", className)}>
			{children}
		</CardDescription>
	);
}

/**
 * PageContent - Main content area of a page
 */
export function PageContent({ children, className }: CommonProps) {
	return (
		<CardContent className={cn("w-full", className)}>{children}</CardContent>
	);
}

/**
 * PageFooter - Footer section of a page with consistent styling
 */
export function PageFooter({ children, className }: CommonProps) {
	return (
		<CardFooter className={cn("mt-8 pt-4 border-t", className)}>
			{children}
		</CardFooter>
	);
}
