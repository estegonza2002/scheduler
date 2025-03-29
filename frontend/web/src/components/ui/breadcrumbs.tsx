import * as React from "react";
import { ChevronRight, Home } from "lucide-react";
import { cn } from "@/lib/utils";
import { FragmentFix } from "@/components/ui/fragment-fix";

export interface BreadcrumbItem {
	title: string;
	href: string;
}

export interface BreadcrumbsProps extends React.HTMLAttributes<HTMLElement> {
	items: BreadcrumbItem[];
	separator?: React.ReactNode;
	homeIcon?: boolean;
}

const Breadcrumbs = React.forwardRef<HTMLElement, BreadcrumbsProps>(
	(
		{
			className,
			items,
			separator = <ChevronRight className="h-4 w-4" />,
			homeIcon = true,
			...props
		},
		ref
	) => {
		return (
			<nav
				ref={ref}
				className={cn(
					"flex items-center space-x-1 text-sm text-muted-foreground",
					className
				)}
				{...props}>
				{homeIcon && (
					<>
						<a
							href="/"
							className="flex items-center hover:text-foreground transition-colors">
							<Home className="h-4 w-4" />
							<span className="sr-only">Home</span>
						</a>
						{items.length > 0 && (
							<span
								className="mx-1"
								aria-hidden="true">
								{separator}
							</span>
						)}
					</>
				)}
				{items.map((item, index) => {
					const isLast = index === items.length - 1;

					return (
						<FragmentFix key={item.href}>
							<a
								href={item.href}
								className={cn(
									"hover:text-foreground transition-colors",
									isLast && "text-foreground font-medium"
								)}>
								{item.title}
							</a>
							{!isLast && (
								<span
									className="mx-1"
									aria-hidden="true">
									{separator}
								</span>
							)}
						</FragmentFix>
					);
				})}
			</nav>
		);
	}
);

Breadcrumbs.displayName = "Breadcrumbs";

export { Breadcrumbs };
