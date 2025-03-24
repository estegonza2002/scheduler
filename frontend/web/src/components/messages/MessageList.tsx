import { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Input } from "../ui/input";
import { Search } from "lucide-react";

type MessageListProps = {
	type: "chats" | "groups" | "active-shifts" | "one-to-one";
	onSelectConversation: (id: string) => void;
	selectedId: string | null;
	fullWidth?: boolean;
};

type Conversation = {
	id: string;
	name: string;
	avatar: string;
	lastMessage: string;
	timestamp: string;
	unread: number;
};

export function MessageList({
	type,
	onSelectConversation,
	selectedId,
	fullWidth,
}: MessageListProps) {
	const [searchQuery, setSearchQuery] = useState("");
	const [conversations, setConversations] = useState<Conversation[]>([]);

	useEffect(() => {
		// In a real app, this would be an API call to fetch conversations based on type
		// For now, we'll use mock data
		const mockConversations: Record<string, Conversation[]> = {
			chats: [
				{
					id: "chat-1",
					name: "General Chat",
					avatar: "",
					lastMessage: "Has anyone seen the new schedule?",
					timestamp: "10:30 AM",
					unread: 3,
				},
				{
					id: "chat-2",
					name: "Manager Updates",
					avatar: "",
					lastMessage: "New policy update for next week",
					timestamp: "Yesterday",
					unread: 0,
				},
				{
					id: "chat-3",
					name: "Kitchen Staff",
					avatar: "",
					lastMessage: "We need to order more supplies",
					timestamp: "2 days ago",
					unread: 1,
				},
			],
			groups: [
				{
					id: "group-1",
					name: "Front Desk Team",
					avatar: "",
					lastMessage: "Meeting at 3 PM today",
					timestamp: "9:45 AM",
					unread: 2,
				},
				{
					id: "group-2",
					name: "Wait Staff",
					avatar: "",
					lastMessage: "New uniforms are in",
					timestamp: "Yesterday",
					unread: 0,
				},
				{
					id: "group-3",
					name: "Management",
					avatar: "",
					lastMessage: "Budget review tomorrow",
					timestamp: "3 days ago",
					unread: 0,
				},
			],
			"active-shifts": [
				{
					id: "shift-1",
					name: "Morning Shift (8AM-4PM)",
					avatar: "",
					lastMessage: "Alex: Running late by 15 min",
					timestamp: "Just now",
					unread: 5,
				},
				{
					id: "shift-2",
					name: "Evening Shift (4PM-12AM)",
					avatar: "",
					lastMessage: "Sarah: Can someone cover section 3?",
					timestamp: "30 min ago",
					unread: 1,
				},
			],
			"one-to-one": [
				{
					id: "user-1",
					name: "John Smith",
					avatar: "",
					lastMessage: "Can we discuss my schedule?",
					timestamp: "11:20 AM",
					unread: 1,
				},
				{
					id: "user-2",
					name: "Emma Johnson",
					avatar: "",
					lastMessage: "Thanks for covering my shift",
					timestamp: "Yesterday",
					unread: 0,
				},
				{
					id: "user-3",
					name: "Michael Brown",
					avatar: "",
					lastMessage: "Are you available next weekend?",
					timestamp: "2 days ago",
					unread: 0,
				},
				{
					id: "user-4",
					name: "Lisa Davis",
					avatar: "",
					lastMessage: "I need to request time off",
					timestamp: "3 days ago",
					unread: 0,
				},
			],
		};

		// Get conversations and sort them: first by unread count (descending), then by recency
		const conversations = [...(mockConversations[type] || [])];

		// Sort conversations - first by unread messages, then by recency
		conversations.sort((a, b) => {
			// First sort by unread (more unread messages first)
			if (a.unread !== b.unread) {
				return b.unread - a.unread;
			}

			// Then sort by timestamp (convert relative times to a numeric value for sorting)
			const timeValues: Record<string, number> = {
				"Just now": 6,
				"30 min ago": 5,
				"10:30 AM": 4,
				"11:20 AM": 4,
				"9:45 AM": 4,
				Yesterday: 3,
				"2 days ago": 2,
				"3 days ago": 1,
			};

			const aTimeValue = timeValues[a.timestamp] || 0;
			const bTimeValue = timeValues[b.timestamp] || 0;

			return bTimeValue - aTimeValue;
		});

		setConversations(conversations);
	}, [type]);

	const filteredConversations = conversations.filter(
		(conversation) =>
			conversation.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
			conversation.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
	);

	return (
		<div className="flex flex-col h-full">
			<div className="p-3 border-b">
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

			<div className="flex-1 overflow-y-auto">
				{filteredConversations.length > 0 ? (
					<ul className="divide-y">
						{filteredConversations.map((conversation) => (
							<li
								key={conversation.id}
								className={`p-3 hover:bg-muted/50 cursor-pointer ${
									selectedId === conversation.id ? "bg-muted" : ""
								}`}
								onClick={() => onSelectConversation(conversation.id)}>
								<div className="flex items-start gap-3">
									<Avatar>
										<AvatarImage src={conversation.avatar} />
										<AvatarFallback>
											{conversation.name.charAt(0)}
										</AvatarFallback>
									</Avatar>
									<div className="flex-1 min-w-0">
										<div className="flex justify-between items-start">
											<p className="font-medium truncate">
												{conversation.name}
											</p>
											<span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
												{conversation.timestamp}
											</span>
										</div>
										<p className="text-sm text-muted-foreground truncate">
											{conversation.lastMessage}
										</p>
									</div>
									{conversation.unread > 0 && (
										<div className="bg-primary text-primary-foreground text-xs font-medium rounded-full h-5 min-w-5 flex items-center justify-center px-1.5">
											{conversation.unread}
										</div>
									)}
								</div>
							</li>
						))}
					</ul>
				) : (
					<div className="flex items-center justify-center h-full text-muted-foreground">
						No conversations found
					</div>
				)}
			</div>
		</div>
	);
}
