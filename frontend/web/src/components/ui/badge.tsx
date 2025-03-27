import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
	"inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
	{
		variants: {
			variant: {
				default:
					"border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
				secondary:
					"border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
				destructive:
					"border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
				outline: "text-foreground",
			},
			colorScheme: {
				none: "",
				blue: "border-transparent bg-blue-100 text-blue-800 hover:bg-blue-200/80",
				purple:
					"border-transparent bg-purple-100 text-purple-800 hover:bg-purple-200/80",
				green:
					"border-transparent bg-green-100 text-green-800 hover:bg-green-200/80",
				amber:
					"border-transparent bg-amber-100 text-amber-800 hover:bg-amber-200/80",
				red: "border-transparent bg-red-100 text-red-800 hover:bg-red-200/80",
				indigo:
					"border-transparent bg-indigo-100 text-indigo-800 hover:bg-indigo-200/80",
				pink: "border-transparent bg-pink-100 text-pink-800 hover:bg-pink-200/80",
				teal: "border-transparent bg-teal-100 text-teal-800 hover:bg-teal-200/80",
			},
			size: {
				default: "px-2.5 py-0.5 text-xs",
				sm: "px-1.5 py-0.5 text-xs",
				lg: "px-3 py-1 text-sm",
			},
		},
		defaultVariants: {
			variant: "default",
			size: "default",
			colorScheme: "none",
		},
	}
);

export interface BadgeProps
	extends React.HTMLAttributes<HTMLDivElement>,
		VariantProps<typeof badgeVariants> {}

function Badge({
	className,
	variant,
	colorScheme,
	size,
	...props
}: BadgeProps) {
	return (
		<div
			className={cn(badgeVariants({ variant, colorScheme, size }), className)}
			{...props}
		/>
	);
}

export { Badge, badgeVariants };
