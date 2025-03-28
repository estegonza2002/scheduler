import { useState, useRef, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import {
	Send,
	X,
	ArrowUp,
	Bot,
	Search,
	Globe,
	Sparkles,
	MoreHorizontal,
	Mic,
	Plus,
} from "lucide-react";
import { useInView } from "react-intersection-observer";

type Message = {
	id: string;
	content: string;
	timestamp: string;
	isUser: boolean;
};

type SmarterAIProps = {
	onClose: () => void;
	onMinimize?: () => void;
	isHero?: boolean;
};

export function SmarterAI({
	onClose,
	onMinimize,
	isHero = false,
}: SmarterAIProps) {
	const [message, setMessage] = useState("");
	const [messages, setMessages] = useState<Message[]>([]);
	const [conversationStarted, setConversationStarted] = useState(false);
	const messagesEndRef = useRef<HTMLDivElement>(null);
	const inputRef = useRef<HTMLInputElement>(null);
	const { ref: visibilityRef, inView } = useInView({
		threshold: 0.1,
	});

	const [scrollDirection, setScrollDirection] = useState<"up" | "down" | null>(
		null
	);
	const [lastScrollTop, setLastScrollTop] = useState(0);
	const [showAI, setShowAI] = useState(true);
	const [autoScrolling, setAutoScrolling] = useState(false);
	const [isAnimating, setIsAnimating] = useState(false);

	useEffect(() => {
		// Scroll to bottom whenever messages change
		messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
	}, [messages]);

	useEffect(() => {
		// Focus the input field when the component mounts
		inputRef.current?.focus();
	}, []);

	useEffect(() => {
		if (!isHero) return; // Only add scroll listener if in hero mode

		// Add scroll event listener for detecting user's interest
		const handleScroll = () => {
			const st = window.pageYOffset || document.documentElement.scrollTop;

			if (st > lastScrollTop) {
				// Scrolling down
				setScrollDirection("down");
			} else {
				// Scrolling up
				setScrollDirection("up");
			}

			setLastScrollTop(st);
		};

		window.addEventListener("scroll", handleScroll);
		return () => window.removeEventListener("scroll", handleScroll);
	}, [lastScrollTop, isHero]);

	useEffect(() => {
		if (!isHero) return; // Only auto-hide if in hero mode

		// If user is scrolling down (away from the chat) and chat is not in view
		// for more than 2 seconds, hide the AI interface
		let timeout: NodeJS.Timeout;

		if (scrollDirection === "down" && !inView && !autoScrolling) {
			timeout = setTimeout(() => {
				handleHideAI();
			}, 2000);
		}

		return () => clearTimeout(timeout);
	}, [scrollDirection, inView, autoScrolling, isHero]);

	const handleSendMessage = () => {
		if (!message.trim()) return;

		if (!conversationStarted) {
			setConversationStarted(true);
		}

		const newUserMessage: Message = {
			id: `msg-${Date.now()}`,
			content: message,
			timestamp: new Date().toLocaleTimeString([], {
				hour: "2-digit",
				minute: "2-digit",
			}),
			isUser: true,
		};

		setMessages([...messages, newUserMessage]);
		setMessage("");

		// Simulate AI response after a short delay
		setTimeout(() => {
			const aiResponse: Message = {
				id: `msg-${Date.now() + 1}`,
				content: getMockAIResponse(message),
				timestamp: new Date().toLocaleTimeString([], {
					hour: "2-digit",
					minute: "2-digit",
				}),
				isUser: false,
			};
			setMessages((prev) => [...prev, aiResponse]);
		}, 1000);
	};

	const getMockAIResponse = (userMessage: string): string => {
		const lowerMsg = userMessage.toLowerCase();

		if (lowerMsg.includes("hello") || lowerMsg.includes("hi")) {
			return "Hello! How can I assist you today?";
		} else if (lowerMsg.includes("schedule") || lowerMsg.includes("shift")) {
			return "I can help you manage schedules and shifts. Would you like me to show you how to create a new shift?";
		} else if (lowerMsg.includes("employee") || lowerMsg.includes("staff")) {
			return "Need help with employee management? I can assist with adding new employees, viewing performance, or managing time off.";
		} else if (lowerMsg.includes("location")) {
			return "I can help you manage your business locations. Would you like to see your current locations or add a new one?";
		} else if (lowerMsg.includes("help")) {
			return "I'm here to help! I can assist with scheduling, employee management, location setup, and more. Just let me know what you need.";
		} else {
			return (
				"I understand you're asking about \"" +
				userMessage +
				'". How can I provide more specific help with that?'
			);
		}
	};

	const handleHideAI = () => {
		setIsAnimating(true);
		// Add a small delay before actually hiding
		setTimeout(() => {
			setShowAI(false);
			setIsAnimating(false);
		}, 300);
	};

	const handleRestoreChat = () => {
		setAutoScrolling(true);
		setShowAI(true);
		// Use setTimeout to ensure the DOM has updated before scrolling
		setTimeout(() => {
			window.scrollTo({ top: 0, behavior: "smooth" });
			setTimeout(() => setAutoScrolling(false), 1000);
		}, 100);
	};

	// Function to handle explicit close from user
	const handleClose = () => {
		// First hide with animation
		handleHideAI();
		// Then call the provided onClose callback with a delay
		setTimeout(() => {
			onClose();
		}, 350);
	};

	const handleMinimize = () => {
		if (onMinimize) {
			handleHideAI();
			setTimeout(() => {
				onMinimize();
			}, 350);
		}
	};

	if (!showAI && isHero) {
		return (
			<Button
				className="fixed bottom-4 right-4 rounded-full p-3 shadow-lg animate-fadeIn transition-all duration-300 ease-in-out"
				onClick={handleRestoreChat}>
				<Sparkles className="h-5 w-5 mr-2" />
				<span>Talk to your data</span>
			</Button>
		);
	}

	// New centered search-like interface
	if (isHero) {
		return (
			<div
				className="w-full flex flex-col items-center justify-center py-16 animate-fadeIn transition-all duration-300 mb-8"
				ref={visibilityRef}>
				{!conversationStarted ? (
					<>
						<h1 className="text-3xl font-bold mb-12 text-center">
							What can I help with?
						</h1>
						<div className="w-full max-w-2xl bg-white rounded-2xl shadow-lg p-2 border border-gray-200 relative">
							<Input
								ref={inputRef}
								placeholder="Ask anything"
								value={message}
								onChange={(e) => setMessage(e.target.value)}
								onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
								className="w-full border-none text-base p-3 pl-4 focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0"
								autoFocus
							/>
							<div className="absolute inset-y-0 right-0 flex items-center pr-3 gap-2">
								<Button
									variant="ghost"
									size="icon"
									className="rounded-full h-8 w-8 hover:bg-gray-100"
									onClick={() => {}}>
									<Plus className="h-5 w-5 text-gray-500" />
								</Button>
								<Button
									variant="ghost"
									size="icon"
									className="rounded-full h-8 w-8 hover:bg-gray-100"
									onClick={() => {}}>
									<Search className="h-5 w-5 text-gray-500" />
								</Button>
								<Button
									variant="ghost"
									size="icon"
									className="rounded-full h-8 w-8 hover:bg-gray-100"
									onClick={() => {}}>
									<Sparkles className="h-5 w-5 text-gray-500" />
								</Button>
								<Button
									variant="ghost"
									size="icon"
									className="rounded-full h-8 w-8 hover:bg-gray-100"
									onClick={() => {}}>
									<MoreHorizontal className="h-5 w-5 text-gray-500" />
								</Button>
								<Button
									variant="default"
									size="icon"
									className="rounded-full h-10 w-10 bg-black hover:bg-gray-800 ml-1"
									onClick={handleSendMessage}
									disabled={!message.trim()}>
									<Mic className="h-5 w-5 text-white" />
								</Button>
							</div>
						</div>
					</>
				) : (
					<div className="w-full max-w-3xl bg-white rounded-xl shadow-md overflow-hidden border border-gray-200 transition-all">
						<div className="flex flex-col h-[600px]">
							<div className="p-4 border-b flex justify-between items-center">
								<h2 className="font-semibold text-lg">Talk to your data</h2>
								<Button
									variant="ghost"
									size="icon"
									onClick={handleMinimize}
									className="h-8 w-8 rounded-full hover:bg-gray-100">
									<X className="h-4 w-4" />
								</Button>
							</div>

							<div className="flex-1 overflow-y-auto p-6">
								<div className="space-y-6">
									{messages.map((msg) => (
										<div
											key={msg.id}
											className={`flex ${
												msg.isUser ? "justify-end" : "justify-start"
											}`}>
											<div
												className={`max-w-[80%] ${
													msg.isUser ? "" : "flex items-start gap-3"
												}`}>
												{!msg.isUser && (
													<Avatar className="h-8 w-8 mt-1">
														<AvatarImage src="/ai-avatar.png" />
														<AvatarFallback className="bg-primary/10">
															<Sparkles className="h-4 w-4 text-primary" />
														</AvatarFallback>
													</Avatar>
												)}
												<div>
													<div
														className={`p-3 rounded-lg ${
															msg.isUser
																? "bg-primary text-primary-foreground"
																: "bg-muted"
														}`}>
														<p className="text-sm">{msg.content}</p>
													</div>
												</div>
											</div>
										</div>
									))}
									<div ref={messagesEndRef} />
								</div>
							</div>

							<div className="p-4 border-t">
								<div className="flex items-center gap-2 bg-muted/50 rounded-xl p-1 pl-4">
									<Input
										ref={inputRef}
										placeholder="Ask a follow-up question..."
										value={message}
										onChange={(e) => setMessage(e.target.value)}
										onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
										className="border-none bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
									/>
									<Button
										variant="default"
										size="icon"
										className="rounded-lg h-9 w-9"
										onClick={handleSendMessage}
										disabled={!message.trim()}>
										<Send className="h-4 w-4" />
									</Button>
								</div>
							</div>
						</div>
					</div>
				)}
			</div>
		);
	}

	// Fullscreen version (legacy)
	return (
		<div className="fixed inset-0 z-50 flex items-start justify-center bg-black/20">
			<div
				className={`flex flex-col bg-background h-[75vh] w-full mt-0 rounded-b-xl shadow-xl ${
					isAnimating ? "animate-fadeOut" : "animate-fadeIn"
				} transition-all duration-300 ease-in-out`}
				ref={visibilityRef}>
				<div className="py-3 px-4 border-b flex items-center justify-between flex-shrink-0">
					<div className="flex items-center gap-3">
						<Avatar>
							<AvatarImage src="/ai-avatar.png" />
							<AvatarFallback>
								<Bot className="h-5 w-5" />
							</AvatarFallback>
						</Avatar>
						<div>
							<h3 className="font-medium">Smarter</h3>
							<p className="text-xs text-muted-foreground">
								Your AI Business Assistant
							</p>
						</div>
					</div>
					<Button
						variant="ghost"
						size="icon"
						onClick={handleClose}
						className="hover:bg-red-100 hover:text-red-600 transition-colors">
						<X className="h-5 w-5" />
					</Button>
				</div>

				<div className="flex-1 overflow-y-auto overflow-x-hidden p-4">
					<div className="space-y-4">
						{messages.map((msg) => (
							<div
								key={msg.id}
								className={`flex ${
									msg.isUser ? "justify-end" : "justify-start"
								}`}>
								<div
									className={`flex gap-3 max-w-[70%] ${
										msg.isUser ? "flex-row-reverse" : ""
									}`}>
									{!msg.isUser && (
										<Avatar className="h-8 w-8">
											<AvatarImage src="/ai-avatar.png" />
											<AvatarFallback>
												<Bot className="h-4 w-4" />
											</AvatarFallback>
										</Avatar>
									)}
									<div>
										<div
											className={`p-3 rounded-lg ${
												msg.isUser
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
						<Input
							ref={inputRef}
							placeholder="Type a message to Smarter..."
							value={message}
							onChange={(e) => setMessage(e.target.value)}
							onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
							className="flex-1"
						/>
						<Button
							variant="default"
							className="rounded-full"
							onClick={handleSendMessage}
							disabled={!message.trim()}>
							<Send className="h-5 w-5" />
						</Button>
					</div>
				</div>
			</div>
		</div>
	);
}
