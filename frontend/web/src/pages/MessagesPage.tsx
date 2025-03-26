import { useState, useEffect } from "react";
import { Tabs, TabsList, TabsTrigger } from "../components/ui/tabs";
import { MessageList } from "../components/messages/MessageList";
import { ChatView } from "../components/messages/ChatView";
import { MessageSquare, Plus } from "lucide-react";
import { toast } from "sonner";
import { NewConversationModal } from "../components/messages/NewConversationModal";
import { useNotifications } from "../lib/notification-context";

import { ContentContainer } from "../components/ui/content-container";
import { Button } from "../components/ui/button";
import { PageHeader } from "../components/ui/page-header";

type MessageTab = "chats" | "groups" | "active-shifts" | "one-to-one";

export default function MessagesPage() {
	const [activeTab, setActiveTab] = useState<MessageTab>("chats");
	const [selectedConversation, setSelectedConversation] = useState<
		string | null
	>(null);
	const { useSampleData } = useNotifications();
	const [isNewConversationModalOpen, setIsNewConversationModalOpen] =
		useState(false);

	useEffect(() => {
		// Get latest conversation from localStorage if available
		const storedConversation = localStorage.getItem("lastActiveConversation");
		const storedTab = localStorage.getItem("lastActiveMessageTab");

		if (storedTab && ["chats", "groups", "active-shifts"].includes(storedTab)) {
			setActiveTab(storedTab as MessageTab);
		}

		if (storedConversation && useSampleData) {
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
	}, [useSampleData]);

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
		if (!useSampleData) {
			return {
				title: "No messages yet",
				description:
					"Your messages will appear here once you start or receive conversations.",
			};
		}
		return {
			title: "No conversation selected",
			description:
				"Select a conversation from the list or start a new one to begin messaging",
		};
	};

	const emptyState = getEmptyStateMessage();

	// Action for the page header
	const headerActions = (
		<Button onClick={() => setIsNewConversationModalOpen(true)}>
			<Plus className="h-4 w-4 mr-2" /> New Conversation
		</Button>
	);

	return (
		<>
			<PageHeader
				title="Messages"
				description="Communicate with your team and manage conversations"
				actions={headerActions}
			/>
			<ContentContainer
				className="h-[calc(100vh-8rem)] max-h-[calc(100vh-8rem)] overflow-hidden"
				withPadding={false}>
				<div className="h-full w-full flex flex-col overflow-hidden">
					<div className="flex flex-1 w-full overflow-hidden">
						{/* Left column - Conversation list */}
						<div className="w-1/3 border-r flex flex-col overflow-hidden">
							<div className="p-4 border-b space-y-4 flex-shrink-0">
								<div className="flex justify-between items-center">
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
											<TabsTrigger value="active-shifts">
												Active Shifts
											</TabsTrigger>
										</TabsList>
									</Tabs>
								</div>
							</div>

							<div className="flex-1 overflow-y-auto overflow-x-hidden">
								{activeTab === "chats" && (
									<MessageList
										type="chats"
										onSelectConversation={setSelectedConversation}
										selectedId={selectedConversation}
										useSampleData={useSampleData}
									/>
								)}
								{activeTab === "groups" && (
									<MessageList
										type="groups"
										onSelectConversation={setSelectedConversation}
										selectedId={selectedConversation}
										useSampleData={useSampleData}
									/>
								)}
								{activeTab === "active-shifts" && (
									<MessageList
										type="active-shifts"
										onSelectConversation={setSelectedConversation}
										selectedId={selectedConversation}
										useSampleData={useSampleData}
									/>
								)}
								{activeTab === "one-to-one" && (
									<MessageList
										type="one-to-one"
										onSelectConversation={setSelectedConversation}
										selectedId={selectedConversation}
										useSampleData={useSampleData}
									/>
								)}
							</div>
						</div>

						{/* Right column - Chat window */}
						<div className="w-2/3 flex flex-col border-l overflow-hidden">
							{selectedConversation && useSampleData ? (
								<ChatView
									conversationId={selectedConversation}
									conversationType={activeTab}
									useSampleData={useSampleData}
								/>
							) : (
								<div className="h-full flex flex-col items-center justify-center text-muted-foreground p-8 overflow-hidden">
									<div className="bg-muted/30 p-4 rounded-full mb-4">
										<MessageSquare className="h-10 w-10" />
									</div>
									<h3 className="text-lg font-medium mb-2">
										{emptyState.title}
									</h3>
									<p className="text-sm text-center max-w-sm">
										{emptyState.description}
									</p>
								</div>
							)}
						</div>
					</div>
				</div>
			</ContentContainer>

			{useSampleData && (
				<NewConversationModal
					onStartConversation={handleStartConversation}
					isOpen={isNewConversationModalOpen}
					onClose={() => setIsNewConversationModalOpen(false)}
				/>
			)}
		</>
	);
}
