import { Location } from "@/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Building2, MapPin, Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export interface LocationCardProps {
	/**
	 * The location data to display
	 */
	location: Location;

	/**
	 * Whether the location is selected (adds a selected style)
	 */
	selected?: boolean;

	/**
	 * Whether to show the location badge (e.g., "Primary")
	 */
	showBadge?: boolean;

	/**
	 * Text to display in the badge
	 */
	badgeText?: string;

	/**
	 * Callback for when the card is clicked
	 */
	onClick?: () => void;

	/**
	 * Whether the card is interactive (adds hover effects)
	 */
	interactive?: boolean;

	/**
	 * Optional CSS class name
	 */
	className?: string;

	/**
	 * Optional size variant
	 */
	size?: "sm" | "md" | "lg";

	/**
	 * Optional alternative layout style
	 */
	variant?: "standard" | "compact" | "detailed";

	/**
	 * Optional children to render at the bottom of the card
	 */
	children?: React.ReactNode;
}

/**
 * A reusable card component for displaying location information
 */
export function LocationCard({
	location,
	selected = false,
	showBadge = false,
	badgeText = "Primary",
	onClick,
	interactive = false,
	className,
	size = "md",
	variant = "standard",
	children,
}: LocationCardProps) {
	// Helper to format address parts into a single string
	const getFullAddress = () => {
		const parts = [];
		if (location.address) parts.push(location.address);
		if (location.city) parts.push(location.city);
		if (location.state) {
			if (location.zipCode) {
				parts.push(`${location.state} ${location.zipCode}`);
			} else {
				parts.push(location.state);
			}
		} else if (location.zipCode) {
			parts.push(location.zipCode);
		}
		return parts.join(", ");
	};

	const fullAddress = getFullAddress();

	// Determine styles based on size
	const getIconSize = () => {
		switch (size) {
			case "sm":
				return "h-3.5 w-3.5";
			case "lg":
				return "h-5 w-5";
			default:
				return "h-4 w-4";
		}
	};

	const getTitleSize = () => {
		switch (size) {
			case "sm":
				return "text-sm font-medium";
			case "lg":
				return "text-lg font-semibold";
			default:
				return "text-base font-medium";
		}
	};

	const getAddressSize = () => {
		switch (size) {
			case "sm":
				return "text-xs";
			case "lg":
				return "text-sm";
			default:
				return "text-xs";
		}
	};

	// Render the card based on variant
	const renderContent = () => {
		switch (variant) {
			case "compact":
				return (
					<CardContent className="p-3">
						<div className="flex items-center justify-between">
							<div className="min-w-0">
								<div className="flex items-center">
									<span className={cn(getTitleSize(), "truncate")}>
										{location.name}
									</span>
									{showBadge && (
										<Badge
											variant="outline"
											className="ml-2 text-xs">
											{badgeText}
										</Badge>
									)}
									{selected && (
										<Check className={cn("ml-2 text-primary", getIconSize())} />
									)}
								</div>
								{fullAddress && (
									<p
										className={cn(
											"text-muted-foreground truncate",
											getAddressSize()
										)}>
										{fullAddress}
									</p>
								)}
							</div>
						</div>
					</CardContent>
				);

			case "detailed":
				return (
					<>
						<CardHeader className="p-4 pb-2">
							<div className="flex items-center">
								<Building2
									className={cn("mr-2 text-muted-foreground", getIconSize())}
								/>
								<CardTitle className={getTitleSize()}>
									{location.name}
									{showBadge && (
										<Badge
											variant="outline"
											className="ml-2 text-xs">
											{badgeText}
										</Badge>
									)}
								</CardTitle>
								{selected && (
									<Check className={cn("ml-2 text-primary", getIconSize())} />
								)}
							</div>
						</CardHeader>
						<CardContent className="p-4 pt-2">
							{fullAddress && (
								<div
									className={cn(
										"flex items-start text-muted-foreground",
										getAddressSize()
									)}>
									<MapPin
										className={cn("mr-1 mt-0.5 flex-shrink-0", getIconSize())}
									/>
									<span>{fullAddress}</span>
								</div>
							)}
							{children && <div className="mt-3">{children}</div>}
						</CardContent>
					</>
				);

			default: // standard
				return (
					<CardContent className="p-4">
						<div className="flex justify-between items-start">
							<div className="min-w-0">
								<div className="flex items-center">
									<span className={getTitleSize()}>{location.name}</span>
									{showBadge && (
										<Badge
											variant="outline"
											className="ml-2 text-xs">
											{badgeText}
										</Badge>
									)}
									{selected && (
										<Check className={cn("ml-2 text-primary", getIconSize())} />
									)}
								</div>
								{fullAddress && (
									<p className={cn("text-muted-foreground", getAddressSize())}>
										{fullAddress}
									</p>
								)}
							</div>
						</div>
						{children && <div className="mt-3">{children}</div>}
					</CardContent>
				);
		}
	};

	return (
		<Card
			className={cn(
				interactive && "transition-all hover:bg-accent/50 cursor-pointer",
				selected && "bg-accent/50 border-primary",
				className
			)}
			onClick={interactive ? onClick : undefined}>
			{renderContent()}
		</Card>
	);
}
