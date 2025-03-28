import { useState, useEffect, useRef } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Paperclip, Send, Smile, MessageSquare, Loader2 } from "lucide-react";
import { useAuth } from "../../lib/auth";
import {
	ConversationsAPI,
	MessagesAPI,
	Message,
	Conversation,
} from "@/api/real/api";
import { toast } from "sonner";
import { LoadingState } from "@/components/ui/loading-state";
import { EmptyState } from "@/components/ui/empty-state";

type ChatViewProps = {
	conversationId: string;
	conversationType: "chats" | "groups" | "active-shifts" | "one-to-one";
};

export function ChatView({ conversationId, conversationType }: ChatViewProps) {
	const { user } = useAuth();
	const [message, setMessage] = useState("");
	const [messages, setMessages] = useState<Message[]>([]);
	const [conversation, setConversation] = useState<Conversation | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const messagesEndRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const fetchData = async () => {
			if (!conversationId) return;

			try {
				setLoading(true);
				setError(null);
				const [conversationData, messagesData] = await Promise.all([
					ConversationsAPI.getById(conversationId),
					MessagesAPI.getAll(conversationId),
				]);

				if (!conversationData) {
					setError("Conversation not found");
					return;
				}

				setConversation(conversationData);
				setMessages(messagesData);
			} catch (err) {
				setError(
					err instanceof Error ? err.message : "Failed to load conversation"
				);
				toast.error("Failed to load conversation");
			} finally {
				setLoading(false);
			}
		};

		fetchData();
	}, [conversationId, conversationType]);

	useEffect(() => {
		// Scroll to bottom whenever messages change
		messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
	}, [messages]);

	const handleSendMessage = async () => {
		if (!message.trim() || !conversationId) return;

		try {
			const newMessage = await MessagesAPI.send({
				conversation_id: conversationId,
				content: message.trim(),
			});

			setMessages([...messages, newMessage]);
			setMessage("");
		} catch (err) {
			toast.error("Failed to send message");
		}
	};

	if (loading) {
		return (
			<LoadingState
				message="Loading conversation..."
				type="spinner"
				className="h-full"
			/>
		);
	}

	if (error || !conversation) {
		return (
			<EmptyState
				icon={<MessageSquare className="h-10 w-10" />}
				title="Conversation not found"
				description={
					error ||
					"This conversation doesn't exist or you don't have access to it"
				}
			/>
		);
	}

	return (
		<div className="flex flex-col h-full overflow-hidden">
			<div className="p-4 border-b flex items-center gap-3">
				<Avatar>
					<AvatarImage src={conversation.avatar} />
					<AvatarFallback>
						{conversation.name
							.split(" ")
							.map((n: string) => n[0])
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
			</div>

			<div className="flex-1 overflow-y-auto overflow-x-hidden p-4">
				<div className="space-y-4">
					{messages.length === 0 ? (
						<EmptyState
							icon={<MessageSquare className="h-6 w-6" />}
							title="No messages yet"
							description="Start the conversation by sending a message"
							className="py-8"
						/>
					) : (
						messages.map((msg) => (
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
											<AvatarFallback>
												{msg.senderName.charAt(0)}
											</AvatarFallback>
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
						))
					)}
					<div ref={messagesEndRef} />
				</div>
			</div>

			<div className="p-3 border-t flex-shrink-0">
				<div className="flex items-center gap-2">
					<Button
						variant="ghost"
						size="icon"
						className="shrink-0"
						title="Attach file">
						<Paperclip className="h-5 w-5" />
					</Button>
					<Button
						variant="ghost"
						size="icon"
						className="shrink-0"
						title="Add emoji">
						<Smile className="h-5 w-5" />
					</Button>
					<Input
						value={message}
						onChange={(e) => setMessage(e.target.value)}
						onKeyDown={(e) => {
							if (e.key === "Enter" && !e.shiftKey) {
								e.preventDefault();
								handleSendMessage();
							}
						}}
						placeholder="Type a message..."
						className="flex-1"
					/>
					<Button
						variant="default"
						size="icon"
						className="shrink-0"
						onClick={handleSendMessage}
						disabled={!message.trim()}>
						<Send className="h-5 w-5" />
					</Button>
				</div>
			</div>
		</div>
	);
}
