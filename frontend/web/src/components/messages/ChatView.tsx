import { useState, useEffect, useRef } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Paperclip, Send, Smile, MessageSquare } from "lucide-react";
import { useAuth } from "../../lib/auth";

type ChatViewProps = {
	conversationId: string;
	conversationType: "chats" | "groups" | "active-shifts" | "one-to-one";
	useSampleData?: boolean;
};

type Message = {
	id: string;
	senderId: string;
	senderName: string;
	senderAvatar: string;
	content: string;
	timestamp: string;
	isCurrentUser: boolean;
};

type Conversation = {
	id: string;
	name: string;
	avatar: string;
	participants: number;
	isActive?: boolean;
};

export function ChatView({
	conversationId,
	conversationType,
	useSampleData = true,
}: ChatViewProps) {
	const { user } = useAuth();
	const [message, setMessage] = useState("");
	const [messages, setMessages] = useState<Message[]>([]);
	const [conversation, setConversation] = useState<Conversation | null>(null);
	const messagesEndRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (!useSampleData) {
			// In a real app, this would fetch the conversation details from an API
			setConversation(null);
			setMessages([]);
			return;
		}

		// Mock conversation data based on type and ID
		const fetchConversationDetails = () => {
			const mockConversations: Record<string, Conversation> = {
				"chat-1": {
					id: "chat-1",
					name: "General Chat",
					avatar: "",
					participants: 15,
				},
				"chat-2": {
					id: "chat-2",
					name: "Manager Updates",
					avatar: "",
					participants: 8,
				},
				"chat-3": {
					id: "chat-3",
					name: "Kitchen Staff",
					avatar: "",
					participants: 6,
				},
				"group-1": {
					id: "group-1",
					name: "Front Desk Team",
					avatar: "",
					participants: 5,
				},
				"group-2": {
					id: "group-2",
					name: "Wait Staff",
					avatar: "",
					participants: 12,
				},
				"group-3": {
					id: "group-3",
					name: "Management",
					avatar: "",
					participants: 4,
				},
				"shift-1": {
					id: "shift-1",
					name: "Morning Shift (8AM-4PM)",
					avatar: "",
					participants: 7,
					isActive: true,
				},
				"shift-2": {
					id: "shift-2",
					name: "Evening Shift (4PM-12AM)",
					avatar: "",
					participants: 8,
					isActive: true,
				},
				"user-1": {
					id: "user-1",
					name: "John Smith",
					avatar: "",
					participants: 2,
				},
				"user-2": {
					id: "user-2",
					name: "Emma Johnson",
					avatar: "",
					participants: 2,
				},
				"user-3": {
					id: "user-3",
					name: "Michael Brown",
					avatar: "",
					participants: 2,
				},
				"user-4": {
					id: "user-4",
					name: "Lisa Davis",
					avatar: "",
					participants: 2,
				},
			};

			setConversation(mockConversations[conversationId] || null);
		};

		// Mock messages based on conversation
		const fetchMessages = () => {
			const mockMessages: Message[] = [
				{
					id: "msg-1",
					senderId: "user-2",
					senderName: "Emma Johnson",
					senderAvatar: "",
					content: "Good morning everyone!",
					timestamp: "8:30 AM",
					isCurrentUser: false,
				},
				{
					id: "msg-2",
					senderId: "user-3",
					senderName: "Michael Brown",
					senderAvatar: "",
					content: "Hi Emma, how are you today?",
					timestamp: "8:32 AM",
					isCurrentUser: false,
				},
				{
					id: "msg-3",
					senderId: "current-user",
					senderName: user?.user_metadata?.firstName
						? `${user.user_metadata.firstName} ${user.user_metadata.lastName}`
						: "Current User",
					senderAvatar: user?.user_metadata?.avatar || "",
					content: "Morning all! Just checking in before the shift starts.",
					timestamp: "8:45 AM",
					isCurrentUser: true,
				},
				{
					id: "msg-4",
					senderId: "user-1",
					senderName: "John Smith",
					senderAvatar: "",
					content: "Can someone help me with the new schedule system?",
					timestamp: "9:15 AM",
					isCurrentUser: false,
				},
				{
					id: "msg-5",
					senderId: "current-user",
					senderName: user?.user_metadata?.firstName
						? `${user.user_metadata.firstName} ${user.user_metadata.lastName}`
						: "Current User",
					senderAvatar: user?.user_metadata?.avatar || "",
					content:
						"Sure John, I can show you how it works. Let's meet at the front desk in 10 minutes.",
					timestamp: "9:20 AM",
					isCurrentUser: true,
				},
			];

			setMessages(mockMessages);
		};

		fetchConversationDetails();
		fetchMessages();
	}, [conversationId, conversationType, user, useSampleData]);

	useEffect(() => {
		// Scroll to bottom whenever messages change
		messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
	}, [messages]);

	const handleSendMessage = () => {
		if (!message.trim()) return;

		const newMessage: Message = {
			id: `msg-${Date.now()}`,
			senderId: "current-user",
			senderName: user?.user_metadata?.firstName
				? `${user.user_metadata.firstName} ${user.user_metadata.lastName}`
				: "Current User",
			senderAvatar: user?.user_metadata?.avatar || "",
			content: message,
			timestamp: new Date().toLocaleTimeString([], {
				hour: "2-digit",
				minute: "2-digit",
			}),
			isCurrentUser: true,
		};

		setMessages([...messages, newMessage]);
		setMessage("");
	};

	if (!conversation) {
		return (
			<div className="h-full flex flex-col items-center justify-center text-muted-foreground p-8">
				<div className="bg-muted/30 p-4 rounded-full mb-4">
					<MessageSquare className="h-10 w-10" />
				</div>
				<h3 className="text-lg font-medium mb-2">Conversation not found</h3>
				<p className="text-sm text-center max-w-sm">
					{useSampleData
						? "This conversation doesn't exist in the sample data"
						: "This conversation doesn't exist or you don't have access to it"}
				</p>
			</div>
		);
	}

	return (
		<div className="flex flex-col h-full overflow-hidden">
			<div className="py-3 px-4 border-b flex items-center flex-shrink-0">
				<div className="flex items-center gap-3">
					<Avatar>
						<AvatarImage src={conversation.avatar} />
						<AvatarFallback>{conversation.name.charAt(0)}</AvatarFallback>
					</Avatar>
					<div>
						<h3 className="font-medium">{conversation.name}</h3>
						<p className="text-xs text-muted-foreground">
							{conversation.participants} participant
							{conversation.participants !== 1 ? "s" : ""}
							{conversation.isActive ? " • Active now" : ""}
						</p>
					</div>
				</div>
			</div>

			<div className="flex-1 overflow-y-auto overflow-x-hidden p-4">
				<div className="space-y-4">
					{messages.map((msg) => (
						<div
							key={msg.id}
							className={`flex ${
								msg.isCurrentUser ? "justify-end" : "justify-start"
							}`}>
							<div
								className={`flex gap-3 max-w-[70%] ${
									msg.isCurrentUser ? "flex-row-reverse" : ""
								}`}>
								{!msg.isCurrentUser && (
									<Avatar className="h-8 w-8">
										<AvatarImage src={msg.senderAvatar} />
										<AvatarFallback>{msg.senderName.charAt(0)}</AvatarFallback>
									</Avatar>
								)}
								<div>
									{!msg.isCurrentUser && (
										<p className="text-xs text-muted-foreground mb-1">
											{msg.senderName}
										</p>
									)}
									<div
										className={`p-3 rounded-lg ${
											msg.isCurrentUser
												? "bg-primary text-primary-foreground"
												: "bg-muted"
										}`}>
										<p className="text-sm">{msg.content}</p>
									</div>
									<p className="text-xs text-muted-foreground mt-1">
										{msg.timestamp}
									</p>
								</div>
							</div>
						</div>
					))}
					<div ref={messagesEndRef} />
				</div>
			</div>

			<div className="p-3 border-t flex-shrink-0">
				<div className="flex items-center gap-2">
					<Button
						variant="ghost"
						size="icon"
						className="rounded-full">
						<Paperclip className="h-5 w-5" />
					</Button>
					<Input
						placeholder="Type a message..."
						value={message}
						onChange={(e) => setMessage(e.target.value)}
						onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
						className="flex-1"
					/>
					<Button
						variant="ghost"
						size="icon"
						className="rounded-full">
						<Smile className="h-5 w-5" />
					</Button>
					<Button
						variant="default"
						size="icon"
						className="rounded-full"
						onClick={handleSendMessage}
						disabled={!message.trim()}>
						<Send className="h-5 w-5" />
					</Button>
				</div>
			</div>
		</div>
	);
}
