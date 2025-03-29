import { useState, useEffect } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageList } from "@/components/messages/MessageList";
import { ChatView } from "@/components/messages/ChatView";
import { MessageSquare, Plus } from "lucide-react";
import { toast } from "sonner";
import { NewConversationModal } from "@/components/messages/NewConversationModal";

import { ContentContainer } from "@/components/ui/content-container";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { ContentSection } from "@/components/ui/content-section";
import { Card, CardContent } from "@/components/ui/card";
import { AppContent } from "@/components/layout/AppLayout";

type MessageTab = "chats" | "groups" | "active-shifts" | "one-to-one";

export default function MessagesPage() {
	const [activeTab, setActiveTab] = useState<MessageTab>("chats");
	const [selectedConversation, setSelectedConversation] = useState<
		string | null
	>(null);
	const [isNewConversationModalOpen, setIsNewConversationModalOpen] =
		useState(false);

	useEffect(() => {
		// Get latest conversation from localStorage if available
		const storedConversation = localStorage.getItem("lastActiveConversation");
		const storedTab = localStorage.getItem("lastActiveMessageTab");

		if (storedTab && ["chats", "groups", "active-shifts"].includes(storedTab)) {
			setActiveTab(storedTab as MessageTab);
		}

		if (storedConversation) {
			setSelectedConversation(storedConversation);
		} else {
			setSelectedConversation(null);
		}

		// Add style to prevent body scrolling
		document.body.style.overflow = "hidden";

		return () => {
			// Reset body overflow when component unmounts
			document.body.style.overflow = "";
		};
	}, []);

	// Store the selected conversation and tab whenever they change
	useEffect(() => {
		if (selectedConversation) {
			localStorage.setItem("lastActiveConversation", selectedConversation);
		}
		localStorage.setItem("lastActiveMessageTab", activeTab);
	}, [selectedConversation, activeTab]);

	// Listen for the custom event from the header button
	useEffect(() => {
		const handleNewConversationClick = () => {
			setIsNewConversationModalOpen(true);
		};

		window.addEventListener(
			"new-conversation-click",
			handleNewConversationClick
		);

		return () => {
			window.removeEventListener(
				"new-conversation-click",
				handleNewConversationClick
			);
		};
	}, []);

	const handleStartConversation = (
		userId: string,
		isGroup: boolean = false
	) => {
		if (isGroup) {
			setActiveTab("groups");
			setSelectedConversation(`group-${Date.now()}`);
			toast.success(`Group "${userId}" created`);
		} else {
			setActiveTab("one-to-one");
			setSelectedConversation(userId);
			toast.success("New conversation started");
		}
	};

	const getEmptyStateMessage = () => {
		return {
			title: "No messages yet",
			description:
				"Your messages will appear here once you start or receive conversations.",
		};
	};

	const emptyState = getEmptyStateMessage();

	// Action for the page header
	const headerActions = (
		<Button onClick={() => setIsNewConversationModalOpen(true)}>
			<Plus className="h-4 w-4 mr-2" /> New Conversation
		</Button>
	);

	// Create the message sidebar component
	const messageSidebar = (
		<div className="flex flex-col h-full overflow-hidden">
			<ContentSection
				title="Message Categories"
				description="Filter your conversations"
				flat={true}
				className="p-0 mb-0"
				contentClassName="p-0">
				<Card className="border-t-0 border-l-0 border-r-0 rounded-none shadow-none">
					<CardContent className="p-4 space-y-4 flex-shrink-0">
						<Tabs
							defaultValue={activeTab}
							value={activeTab}
							onValueChange={(value) => {
								setActiveTab(value as MessageTab);
							}}
							className="w-full">
							<TabsList className="grid w-full grid-cols-3">
								<TabsTrigger value="chats">Chats</TabsTrigger>
								<TabsTrigger value="groups">Groups</TabsTrigger>
								<TabsTrigger value="active-shifts">Active Shifts</TabsTrigger>
							</TabsList>
						</Tabs>
					</CardContent>
				</Card>
			</ContentSection>

			<div className="flex-1 overflow-y-auto overflow-x-hidden">
				{activeTab === "chats" && (
					<MessageList
						type="chats"
						onSelectConversation={setSelectedConversation}
						selectedId={selectedConversation}
					/>
				)}
				{activeTab === "groups" && (
					<MessageList
						type="groups"
						onSelectConversation={setSelectedConversation}
						selectedId={selectedConversation}
					/>
				)}
				{activeTab === "active-shifts" && (
					<MessageList
						type="active-shifts"
						onSelectConversation={setSelectedConversation}
						selectedId={selectedConversation}
					/>
				)}
				{activeTab === "one-to-one" && (
					<MessageList
						type="one-to-one"
						onSelectConversation={setSelectedConversation}
						selectedId={selectedConversation}
					/>
				)}
			</div>
		</div>
	);

	return (
		<>
			<div className="mb-6">
				<h1 className="text-2xl font-bold tracking-tight">Messages</h1>
				<p className="mt-2 text-muted-foreground">
					Communicate with your team and manage conversations
				</p>
			</div>
			<div className="flex">
				{/* Sidebar */}
				<div className="w-64 flex-shrink-0">{messageSidebar}</div>

				{/* Content */}
				<AppContent className="flex-1 h-[calc(100vh-8rem)] max-h-[calc(100vh-8rem)] overflow-hidden">
					{/* Right column - Chat window */}
					<div className="h-full flex flex-col overflow-hidden">
						{selectedConversation ? (
							<ChatView
								conversationId={selectedConversation}
								conversationType={activeTab}
							/>
						) : (
							<ContentSection
								title={emptyState.title}
								description={emptyState.description}
								flat={true}
								className="h-full flex flex-col items-center justify-center p-8 border-0"
								contentClassName="flex flex-col items-center">
								<Card className="bg-muted/30 border-0 shadow-none">
									<CardContent className="p-4 flex items-center justify-center">
										<MessageSquare className="h-10 w-10" />
									</CardContent>
								</Card>
							</ContentSection>
						)}
					</div>
				</AppContent>
			</div>

			<NewConversationModal
				onStartConversation={handleStartConversation}
				isOpen={isNewConversationModalOpen}
				onClose={() => setIsNewConversationModalOpen(false)}
			/>
		</>
	);
}
