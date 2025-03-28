import { useState, useEffect, useRef } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Paperclip, Send, Smile, MessageSquare, Loader2 } from "lucide-react";
import { useAuth } from "../../lib/auth";

type ChatViewProps = {
	conversationId: string;
	conversationType: "chats" | "groups" | "active-shifts" | "one-to-one";
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

export function ChatView({ conversationId, conversationType }: ChatViewProps) {
	const { user } = useAuth();
	const [message, setMessage] = useState("");
	const [messages, setMessages] = useState<Message[]>([]);
	const [conversation, setConversation] = useState<Conversation | null>(null);
	const messagesEndRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		// Here you would fetch real conversation data and messages from your API
		// For now, we'll continue with mock data until the real API is implemented

		// Mock conversation data based on type and ID
		const fetchConversationDetails = () => {
			// This would be replaced with a real API call
			const mockConversations: Record<string, Conversation> = {
				"chat-1": {
					id: "chat-1",
					name: "General Chat",
					avatar: "",
					participants: 15,
				},
				// ... other mock conversations ...
			};

			setConversation(mockConversations[conversationId] || null);
		};

		// Mock messages based on conversation
		const fetchMessages = () => {
			// This would be replaced with a real API call
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
				// ... other mock messages ...
			];

			setMessages(mockMessages);
		};

		fetchConversationDetails();
		fetchMessages();
	}, [conversationId, conversationType, user]);

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
					This conversation doesn't exist or you don't have access to it
				</p>
			</div>
		);
	}

	return (
		<div className="flex flex-col h-full overflow-hidden">
			<div className="p-4 border-b flex items-center gap-3">
				{conversation ? (
					<>
						<Avatar>
							<AvatarImage src={conversation.avatar} />
							<AvatarFallback>
								{conversation.name
									.split(" ")
									.map((n) => n[0])
									.join("")
									.toUpperCase()}
							</AvatarFallback>
						</Avatar>
						<div>
							<h2 className="text-base font-medium">{conversation.name}</h2>
							<p className="text-sm text-muted-foreground">
								{conversation.participants > 2
									? `${conversation.participants} participants`
									: "Direct message"}
							</p>
						</div>
					</>
				) : (
					<div className="flex items-center">
						<Loader2 className="h-5 w-5 text-muted-foreground animate-spin mr-2" />
						<p className="text-muted-foreground">Loading conversation...</p>
					</div>
				)}
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
