import * as React from "react";
import { cn } from "../../lib/utils";

interface PageLayoutProps {
	children: React.ReactNode;
	className?: string;
}

export function PageLayout({ children, className }: PageLayoutProps) {
	return (
		<div className={cn("mx-auto px-4 py-6 md:px-6 lg:px-8", className)}>
			{children}
		</div>
	);
}

interface PageHeaderProps {
	children: React.ReactNode;
	className?: string;
}

export function PageHeader({ children, className }: PageHeaderProps) {
	return <header className={cn("mb-6", className)}>{children}</header>;
}

interface PageTitleProps {
	children: React.ReactNode;
	className?: string;
}

export function PageTitle({ children, className }: PageTitleProps) {
	return (
		<h1 className={cn("text-2xl font-bold tracking-tight", className)}>
			{children}
		</h1>
	);
}

interface PageDescriptionProps {
	children: React.ReactNode;
	className?: string;
}

export function PageDescription({ children, className }: PageDescriptionProps) {
	return (
		<p className={cn("text-muted-foreground mt-2", className)}>{children}</p>
	);
}

interface PageContentProps {
	children: React.ReactNode;
	className?: string;
}

export function PageContent({ children, className }: PageContentProps) {
	return <main className={cn("w-full", className)}>{children}</main>;
}

interface PageFooterProps {
	children: React.ReactNode;
	className?: string;
}

export function PageFooter({ children, className }: PageFooterProps) {
	return (
		<footer className={cn("mt-8 pt-4 border-t", className)}>{children}</footer>
	);
}
