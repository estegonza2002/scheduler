import { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Input } from "../ui/input";
import { Search, MessageSquare } from "lucide-react";
import { cn } from "../../lib/utils";
import { ConversationsAPI, Conversation } from "@/api/real/api";
import { format, parseISO } from "date-fns";
import { toast } from "sonner";
import { useOrganization } from "@/lib/organization-context";

type MessageListProps = {
	type: "chats" | "groups" | "active-shifts" | "one-to-one";
	onSelectConversation: (id: string) => void;
	selectedId: string | null;
	fullWidth?: boolean;
};

export function MessageList({
	type,
	onSelectConversation,
	selectedId,
	fullWidth,
}: MessageListProps) {
	const { getCurrentOrganizationId } = useOrganization();
	const [searchQuery, setSearchQuery] = useState("");
	const [conversations, setConversations] = useState<Conversation[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		async function fetchConversations() {
			try {
				setLoading(true);
				setError(null);
				const orgId = getCurrentOrganizationId();
				const fetchedConversations = await ConversationsAPI.getAll(orgId);

				// Filter conversations by type
				const filteredConversations = fetchedConversations.filter(
					(conv) => conv.type === type
				);

				// Sort conversations by last message date
				const sortedConversations = [...filteredConversations].sort((a, b) => {
					if (!a.lastMessageTime || !b.lastMessageTime) return 0;
					return (
						parseISO(b.lastMessageTime).getTime() -
						parseISO(a.lastMessageTime).getTime()
					);
				});

				setConversations(sortedConversations);
			} catch (err) {
				console.error("Failed to fetch conversations:", err);
				setError("Failed to load conversations");
				toast.error("Failed to load conversations");
			} finally {
				setLoading(false);
			}
		}

		fetchConversations();
	}, [type, getCurrentOrganizationId]);

	const filteredConversations = conversations.filter(
		(conversation) =>
			conversation.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
			(conversation.lastMessage || "")
				.toLowerCase()
				.includes(searchQuery.toLowerCase())
	);

	if (loading) {
		return (
			<div className="flex flex-col items-center justify-center h-full text-muted-foreground p-8">
				<p>Loading conversations...</p>
			</div>
		);
	}

	if (error) {
		return (
			<div className="flex flex-col items-center justify-center h-full text-muted-foreground p-8">
				<p className="text-red-500">{error}</p>
			</div>
		);
	}

	return (
		<div className="flex flex-col h-full overflow-hidden">
			<div className="p-3 border-b flex-shrink-0">
				<div className="relative">
					<Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
					<Input
						placeholder="Search..."
						className="pl-8"
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
					/>
				</div>
			</div>

			<div className="flex-1 overflow-y-auto overflow-x-hidden">
				{conversations.length === 0 ? (
					<div className="flex flex-col items-center justify-center h-full text-muted-foreground p-8">
						<div className="bg-muted/30 p-4 rounded-full mb-4">
							<MessageSquare className="h-10 w-10" />
						</div>
						<p className="text-center">No messages found</p>
					</div>
				) : filteredConversations.length === 0 ? (
					<div className="flex flex-col items-center justify-center h-full text-muted-foreground p-8">
						<div className="bg-muted/30 p-4 rounded-full mb-4">
							<Search className="h-10 w-10" />
						</div>
						<p className="text-center">No matching conversations found</p>
					</div>
				) : (
					// Show conversations
					filteredConversations.map((conversation) => (
						<div
							key={conversation.id}
							className={cn(
								"p-3 flex items-center gap-3 cursor-pointer border-b hover:bg-muted/50 transition-colors",
								{
									"bg-accent": selectedId === conversation.id,
									"w-full": fullWidth,
								}
							)}
							onClick={() => onSelectConversation(conversation.id)}>
							<div className="relative">
								<Avatar className="h-10 w-10">
									<AvatarImage
										src={conversation.avatar || ""}
										alt={conversation.name}
									/>
									<AvatarFallback>
										{conversation.name
											.split(" ")
											.map((n) => n[0])
											.join("")
											.toUpperCase()}
									</AvatarFallback>
								</Avatar>
								{conversation.unreadCount > 0 && (
									<div className="absolute -top-1 -right-1 bg-primary text-primary-foreground rounded-full text-xs w-5 h-5 flex items-center justify-center">
										{conversation.unreadCount}
									</div>
								)}
							</div>
							<div className="flex-1 min-w-0">
								<div className="flex justify-between items-center mb-1">
									<p className="text-sm font-medium truncate">
										{conversation.name}
									</p>
									<p className="text-xs text-muted-foreground whitespace-nowrap">
										{conversation.lastMessageTime
											? format(parseISO(conversation.lastMessageTime), "p")
											: "No messages"}
									</p>
								</div>
								<p className="text-xs text-muted-foreground truncate">
									{conversation.lastMessage || "No messages yet"}
								</p>
							</div>
						</div>
					))
				)}
			</div>
		</div>
	);
}
