import React from "react";
import { cn } from "@/lib/utils";

interface LocationMapProps {
	latitude: number;
	longitude: number;
	height?: string;
	className?: string;
	showOpenLink?: boolean;
}

export function LocationMap({
	latitude,
	longitude,
	height = "180px",
	className,
	showOpenLink = true,
}: LocationMapProps) {
	const apiKey = import.meta.env.VITE_GOOGLE_PLACES_API_KEY as string;

	if (!latitude || !longitude) {
		return null;
	}

	return (
		<div
			className={cn(
				"relative w-full rounded-md overflow-hidden border",
				className
			)}
			style={{ height }}>
			{showOpenLink && (
				<a
					href={`https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`}
					target="_blank"
					rel="noopener noreferrer"
					className="absolute inset-0 z-20 flex items-center justify-center bg-black/40 opacity-0 hover:opacity-100 transition-opacity">
					<div className="bg-white text-black text-xs font-medium px-2 py-1 rounded-md">
						Open in Google Maps
					</div>
				</a>
			)}
			<img
				src={`https://maps.googleapis.com/maps/api/staticmap?center=${latitude},${longitude}&zoom=16&size=600x350&maptype=roadmap&markers=color:red%7C${latitude},${longitude}&key=${apiKey}`}
				alt="Location Map"
				className="w-full h-full object-cover"
				onError={(e) => {
					console.error("Failed to load map image");
					(e.target as HTMLImageElement).style.display = "none";
				}}
			/>
		</div>
	);
}
