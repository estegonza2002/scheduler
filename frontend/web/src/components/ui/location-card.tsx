import { Location } from "@/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Building2, MapPin, Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import Image from "next/image";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

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
	 * Callback for when the card is clicked
	 * If not provided, will navigate to the location detail page by default
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

	/**
	 * Whether to navigate to location detail page when clicked
	 * Default is true. Set to false to disable navigation.
	 */
	navigable?: boolean;
}

/**
 * A reusable card component for displaying location information
 */
export function LocationCard({
	location,
	selected = false,
	onClick,
	interactive = true,
	className,
	size = "md",
	variant = "standard",
	children,
	navigable = true,
}: LocationCardProps) {
	const [imgError, setImgError] = useState(false);
	const navigate = useNavigate();

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

	// Handle click event - either use provided onClick or navigate to location detail
	const handleClick = () => {
		if (onClick) {
			onClick();
		} else if (navigable) {
			navigate(`/locations/${location.id}`);
		}
	};

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

	// Using a data URI for the placeholder to avoid loading issues
	const placeholderImage =
		"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1000 667'%3E%3Crect width='1000' height='667' fill='%23e6e6e6'/%3E%3Cpath d='M500 250 Q 550 200, 600 250 T 700 250 T 800 250 T 900 250 T 1000 250 V 667 H 0 V 250 Q 100 300, 200 250 T 300 250 T 400 250 T 500 250' fill='%23cccccc'/%3E%3Cpath d='M500,180 L530,220 L570,120 L610,220 L640,180 L500,180 Z' fill='%23ffcc88'/%3E%3C/svg%3E";

	// If we have a location image and no error loading it, show that
	// Otherwise default to our placeholder
	const imageSource =
		location.imageUrl && !imgError ? location.imageUrl : placeholderImage;

	// Background color as fallback if image can't load
	const imageFallbackStyle = {
		backgroundColor: "#e2e8f0",
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
	};

	// Render the card based on variant
	const renderContent = () => {
		switch (variant) {
			case "compact":
				return (
					<>
						<div className="relative w-full">
							<AspectRatio ratio={16 / 9}>
								<div
									style={imageFallbackStyle}
									className="absolute inset-0">
									<Building2 className="h-10 w-10 text-gray-400" />
								</div>
								<Image
									src={imageSource}
									alt={location.name}
									fill
									unoptimized
									onError={() => setImgError(true)}
									className="object-cover rounded-t-md"
								/>
							</AspectRatio>
						</div>
						<CardContent className="p-3">
							<div className="flex items-center justify-between">
								<div className="min-w-0">
									<div className="flex items-center">
										<span className={cn(getTitleSize(), "truncate")}>
											{location.name}
										</span>
										{selected && (
											<Check
												className={cn("ml-2 text-primary", getIconSize())}
											/>
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
					</>
				);

			case "detailed":
				return (
					<>
						<div className="relative w-full">
							<AspectRatio ratio={16 / 9}>
								<div
									style={imageFallbackStyle}
									className="absolute inset-0">
									<Building2 className="h-10 w-10 text-gray-400" />
								</div>
								<Image
									src={imageSource}
									alt={location.name}
									fill
									unoptimized
									onError={() => setImgError(true)}
									className="object-cover rounded-t-md"
								/>
							</AspectRatio>
						</div>
						<CardHeader className="p-4 pb-2">
							<div className="flex items-center">
								<Building2
									className={cn("mr-2 text-muted-foreground", getIconSize())}
								/>
								<CardTitle className={getTitleSize()}>
									{location.name}
									{selected && (
										<Check className={cn("ml-2 text-primary", getIconSize())} />
									)}
								</CardTitle>
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
					<>
						<div className="relative w-full">
							<AspectRatio ratio={16 / 9}>
								<div
									style={imageFallbackStyle}
									className="absolute inset-0">
									<Building2 className="h-10 w-10 text-gray-400" />
								</div>
								<Image
									src={imageSource}
									alt={location.name}
									fill
									unoptimized
									onError={() => setImgError(true)}
									className="object-cover rounded-t-md"
								/>
							</AspectRatio>
						</div>
						<CardContent className="p-4">
							<div className="flex justify-between items-start">
								<div className="min-w-0">
									<div className="flex items-center">
										<span className={getTitleSize()}>{location.name}</span>
										{selected && (
											<Check
												className={cn("ml-2 text-primary", getIconSize())}
											/>
										)}
									</div>
									{fullAddress && (
										<p
											className={cn("text-muted-foreground", getAddressSize())}>
											{fullAddress}
										</p>
									)}
								</div>
							</div>
							{children && <div className="mt-3">{children}</div>}
						</CardContent>
					</>
				);
		}
	};

	return (
		<Card
			className={cn(
				"overflow-hidden",
				interactive && "transition-all hover:bg-accent/50 cursor-pointer",
				selected && "bg-accent/50 border-primary",
				className
			)}
			onClick={interactive ? handleClick : undefined}>
			{renderContent()}
		</Card>
	);
}
