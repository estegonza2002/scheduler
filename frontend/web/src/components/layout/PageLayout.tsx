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
	return <CardHeader className={cn("mb-6", className)}>{children}</CardHeader>;
}

interface PageTitleProps {
	children: React.ReactNode;
	className?: string;
}

export function PageTitle({ children, className }: PageTitleProps) {
	return (
		<CardTitle className={cn("text-2xl font-bold tracking-tight", className)}>
			{children}
		</CardTitle>
	);
}

interface PageDescriptionProps {
	children: React.ReactNode;
	className?: string;
}

export function PageDescription({ children, className }: PageDescriptionProps) {
	return (
		<CardDescription className={cn("mt-2", className)}>
			{children}
		</CardDescription>
	);
}

interface PageContentProps {
	children: React.ReactNode;
	className?: string;
}

export function PageContent({ children, className }: PageContentProps) {
	return (
		<CardContent className={cn("w-full", className)}>{children}</CardContent>
	);
}

interface PageFooterProps {
	children: React.ReactNode;
	className?: string;
}

export function PageFooter({ children, className }: PageFooterProps) {
	return (
		<CardFooter className={cn("mt-8 pt-4 border-t", className)}>
			{children}
		</CardFooter>
	);
}
