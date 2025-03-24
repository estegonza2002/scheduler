import React from "react";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface BaseCardProps {
	title?: string;
	description?: string;
	children: React.ReactNode;
	footer?: React.ReactNode;
	className?: string;
	contentClassName?: string;
	headerClassName?: string;
	footerClassName?: string;
}

export function BaseCard({
	title,
	description,
	children,
	footer,
	className,
	contentClassName,
	headerClassName,
	footerClassName,
}: BaseCardProps) {
	return (
		<Card className={className}>
			{(title || description) && (
				<CardHeader className={headerClassName}>
					{title && <CardTitle>{title}</CardTitle>}
					{description && <CardDescription>{description}</CardDescription>}
				</CardHeader>
			)}
			<CardContent className={contentClassName}>{children}</CardContent>
			{footer && <CardFooter className={footerClassName}>{footer}</CardFooter>}
		</Card>
	);
}
