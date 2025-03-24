import { useState, useEffect } from "react";
import { Tabs, TabsList, TabsTrigger } from "../components/ui/tabs";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "../components/ui/card";
import { MessageList } from "../components/messages/MessageList";
import { ChatView } from "../components/messages/ChatView";

type MessageTab = "chats" | "groups" | "active-shifts";

export default function MessagesPage() {
	const [activeTab, setActiveTab] = useState<MessageTab>("chats");
	const [selectedConversation, setSelectedConversation] = useState<
		string | null
	>(null);

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
			// If no stored conversation, select the first conversation with unread messages
			// For this demo, we'll select the first active shift as they're typically more urgent
			setSelectedConversation("shift-1");
		}
	}, []);

	// Store the selected conversation and tab whenever they change
	useEffect(() => {
		if (selectedConversation) {
			localStorage.setItem("lastActiveConversation", selectedConversation);
		}
		localStorage.setItem("lastActiveMessageTab", activeTab);
	}, [selectedConversation, activeTab]);

	return (
		<div className="h-[calc(100vh-64px)]">
			<div className="h-full flex flex-col">
				<div className="flex flex-1 min-h-0">
					{/* Left column - Conversation list */}
					<div className="w-1/3 border-r min-h-0 flex flex-col">
						<div className="p-2 border-b">
							<Tabs
								defaultValue={activeTab}
								value={activeTab}
								onValueChange={(value) => {
									setActiveTab(value as MessageTab);
								}}>
								<TabsList className="grid w-full grid-cols-3">
									<TabsTrigger value="chats">Chats</TabsTrigger>
									<TabsTrigger value="groups">Groups</TabsTrigger>
									<TabsTrigger value="active-shifts">Active Shifts</TabsTrigger>
								</TabsList>
							</Tabs>
						</div>

						<div className="flex-1 min-h-0 overflow-hidden">
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
						</div>
					</div>

					{/* Right column - Chat window */}
					<div className="w-2/3 min-h-0">
						{selectedConversation ? (
							<ChatView
								conversationId={selectedConversation}
								conversationType={activeTab}
							/>
						) : (
							<div className="h-full flex items-center justify-center text-muted-foreground">
								Select a conversation to start messaging
							</div>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}
