import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { LocationMap } from "./location-map";

interface GoogleMapProps {
	latitude?: number;
	longitude?: number;
	address?: string;
	height?: string;
	className?: string;
	zoom?: number;
	popupContent?: React.ReactNode;
}

/**
 * A component that displays a map using Google Static Maps API
 * Falls back to static LocationMap if API key is missing or errors occur
 * Can use either lat/lng coordinates or an address string
 */
export function GoogleMap({
	latitude,
	longitude,
	address,
	height = "180px",
	className,
	zoom = 15,
	popupContent,
}: GoogleMapProps) {
	const apiKey = import.meta.env.VITE_GOOGLE_PLACES_API_KEY as string;
	const [hasError, setHasError] = useState(false);

	// Return null if neither coordinates nor address provided
	if ((!latitude || !longitude) && !address) {
		return null;
	}

	// Fall back to LocationMap if no API key or if an error occurred
	if (!apiKey || hasError) {
		return (
			<LocationMap
				latitude={latitude}
				longitude={longitude}
				address={address}
				height={height}
				className={className}
			/>
		);
	}

	// Construct the Google Static Maps URL (using either coordinates or address)
	let mapUrl;
	if (latitude && longitude) {
		mapUrl = `https://maps.googleapis.com/maps/api/staticmap?center=${latitude},${longitude}&zoom=${zoom}&size=600x400&scale=2&markers=color:red%7C${latitude},${longitude}&key=${apiKey}`;
	} else if (address) {
		mapUrl = `https://maps.googleapis.com/maps/api/staticmap?center=${encodeURIComponent(
			address
		)}&zoom=${zoom}&size=600x400&scale=2&markers=color:red%7C${encodeURIComponent(
			address
		)}&key=${apiKey}`;
	}

	return (
		<div
			className={cn("relative rounded-md overflow-hidden", className)}
			style={{ height }}>
			<img
				src={mapUrl}
				alt={`Map showing location at ${address || `${latitude},${longitude}`}`}
				className="w-full h-full object-cover"
				onError={() => setHasError(true)}
			/>

			{/* Optional popup content overlay */}
			{popupContent && (
				<div className="absolute bottom-0 left-0 right-0 bg-background/80 backdrop-blur-sm p-2 text-sm">
					{popupContent}
				</div>
			)}
		</div>
	);
}
