import type { Meta, StoryObj } from "@storybook/react";
import { MessageList } from "./MessageList";

const meta: Meta<typeof MessageList> = {
	title: "Components/MessageList",
	component: MessageList,
	parameters: {
		layout: "centered",
	},
	tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof MessageList>;

export const Chats: Story = {
	args: {
		type: "chats",
		selectedId: null,
		onSelectConversation: (id) => console.log("Selected conversation:", id),
	},
};

export const Groups: Story = {
	args: {
		type: "groups",
		selectedId: null,
		onSelectConversation: (id) => console.log("Selected conversation:", id),
	},
};

export const ActiveShifts: Story = {
	args: {
		type: "active-shifts",
		selectedId: null,
		onSelectConversation: (id) => console.log("Selected conversation:", id),
	},
};

export const OneToOne: Story = {
	args: {
		type: "one-to-one",
		selectedId: null,
		onSelectConversation: (id) => console.log("Selected conversation:", id),
	},
};

export const WithSelectedItem: Story = {
	args: {
		type: "chats",
		selectedId: "chat-1",
		onSelectConversation: (id) => console.log("Selected conversation:", id),
	},
};

export const FullWidth: Story = {
	args: {
		type: "chats",
		selectedId: null,
		fullWidth: true,
		onSelectConversation: (id) => console.log("Selected conversation:", id),
	},
};
