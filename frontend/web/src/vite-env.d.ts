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

// Provide empty implementations for removed message components
declare module "@/components/messages/NewConversationModal" {
	const NewConversationModal: React.FC<any> = () => null;
	export { NewConversationModal };
	export default NewConversationModal;
}

declare module "@/components/messages/MessagePane" {
	const MessagePane: React.FC<any> = () => null;
	export { MessagePane };
	export default MessagePane;
}

declare module "@/components/messages/ChatView" {
	const ChatView: React.FC<any> = () => null;
	export { ChatView };
	export default ChatView;
}

// Define the missing LocationInRightPane component
declare const LocationInRightPane: React.FC<any> = () => null;
