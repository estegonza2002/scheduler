/// <reference types="vite/client" />

// Google Maps API types for TypeScript
interface Window {
	google?: {
		maps: {
			places: {
				AutocompleteService: new () => any;
				PlacesService: new (attrContainer: HTMLElement) => any;
				PlacesServiceStatus: {
					OK: string;
					ZERO_RESULTS: string;
					OVER_QUERY_LIMIT: string;
					REQUEST_DENIED: string;
					INVALID_REQUEST: string;
					UNKNOWN_ERROR: string;
				};
			};
		};
	};
}
