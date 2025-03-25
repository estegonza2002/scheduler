import React from "react";
import { cn } from "../../lib/utils";
import { Card, CardContent, CardFooter, CardHeader } from "./card";
import { Avatar, AvatarFallback, AvatarImage } from "./avatar";

interface ItemCardProps {
	/**
	 * The title of the item
	 */
	title: string;
	/**
	 * Optional description text to display under the title
	 */
	description?: string;
	/**
	 * Optional image source URL for the item
	 */
	image?: string;
	/**
	 * Optional icon to display if no image is provided
	 */
	icon?: React.ReactNode;
	/**
	 * Optional initial letters to display if no image is provided
	 */
	initials?: string;
	/**
	 * Optional metadata to display below the description
	 */
	metadata?: React.ReactNode;
	/**
	 * Optional action buttons to display in the footer
	 */
	actions?: React.ReactNode;
	/**
	 * Optional additional className for the card
	 */
	className?: string;
	/**
	 * Optional onClick handler for the card
	 */
	onClick?: () => void;
	/**
	 * Whether the card is selectable
	 * @default false
	 */
	selectable?: boolean;
	/**
	 * Whether the card is currently selected
	 * @default false
	 */
	selected?: boolean;
	/**
	 * Optional badge to display in the top-right corner
	 */
	badge?: React.ReactNode;
	/**
	 * Optional additional content to display in the card
	 */
	children?: React.ReactNode;
}

/**
 * ItemCard component for displaying items in a card-based grid layout
 */
export function ItemCard({
	title,
	description,
	image,
	icon,
	initials,
	metadata,
	actions,
	className,
	onClick,
	selectable = false,
	selected = false,
	badge,
	children,
}: ItemCardProps) {
	return (
		<Card
			className={cn(
				"overflow-hidden transition-all",
				selectable && "cursor-pointer hover:border-primary/50",
				selected && "border-primary ring-2 ring-primary/30",
				onClick && "cursor-pointer hover:shadow-md",
				className
			)}
			onClick={onClick}>
			{badge && <div className="absolute top-2 right-2 z-10">{badge}</div>}

			<CardHeader className="relative p-0">
				{image && (
					<div className="h-40 w-full overflow-hidden">
						<img
							src={image}
							alt={title}
							className="h-full w-full object-cover"
						/>
					</div>
				)}
			</CardHeader>

			<CardContent className={cn("pt-4", !image && "pt-6")}>
				<div className="flex items-center gap-3">
					{(icon || initials) && !image && (
						<Avatar>
							{icon ? (
								<div className="flex h-full w-full items-center justify-center">
									{icon}
								</div>
							) : (
								<AvatarFallback>{initials}</AvatarFallback>
							)}
						</Avatar>
					)}
					<div>
						<h3 className="font-semibold">{title}</h3>
						{description && (
							<p className="text-sm text-muted-foreground">{description}</p>
						)}
					</div>
				</div>

				{metadata && (
					<div className="mt-4 text-sm text-muted-foreground">{metadata}</div>
				)}

				{children && <div className="mt-4">{children}</div>}
			</CardContent>

			{actions && (
				<CardFooter className="flex justify-end gap-2 border-t p-4">
					{actions}
				</CardFooter>
			)}
		</Card>
	);
}
