import type { Meta, StoryObj } from "@storybook/react";
import { EmptyState } from "./empty-state";
import { Button } from "./button";
import { Search, Plus, AlertCircle } from "lucide-react";

const meta: Meta<typeof EmptyState> = {
	title: "UI/EmptyState",
	component: EmptyState,
	parameters: {
		layout: "centered",
	},
	tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof EmptyState>;

export const Default: Story = {
	args: {
		title: "No items found",
		description: "Get started by creating a new item.",
		action: (
			<Button>
				<Plus className="mr-2 h-4 w-4" />
				Create Item
			</Button>
		),
	},
};

export const SearchVariant: Story = {
	args: {
		variant: "search",
		title: "No results found",
		description: "Try adjusting your search or filter criteria.",
		action: (
			<Button variant="outline">
				<Search className="mr-2 h-4 w-4" />
				Try Different Search
			</Button>
		),
	},
};

export const NoData: Story = {
	args: {
		variant: "no-data",
		title: "No data available",
		description: "There are no items to display at the moment.",
		action: (
			<Button variant="outline">
				<Plus className="mr-2 h-4 w-4" />
				Add Data
			</Button>
		),
	},
};

export const NoResults: Story = {
	args: {
		variant: "no-results",
		title: "No matching results",
		description: "Try adjusting your filters to see more results.",
		action: <Button variant="outline">Clear Filters</Button>,
	},
};

export const Error: Story = {
	args: {
		variant: "error",
		title: "Something went wrong",
		description: "We encountered an error while loading the data.",
		action: (
			<Button variant="destructive">
				<AlertCircle className="mr-2 h-4 w-4" />
				Try Again
			</Button>
		),
	},
};

export const Small: Story = {
	args: {
		size: "sm",
		title: "No items",
		description: "Add your first item to get started.",
		action: (
			<Button size="sm">
				<Plus className="mr-2 h-3 w-3" />
				Add Item
			</Button>
		),
	},
};

export const Large: Story = {
	args: {
		size: "lg",
		title: "Welcome to Your Dashboard",
		description: "Get started by adding your first project or task.",
		action: (
			<Button size="lg">
				<Plus className="mr-2 h-5 w-5" />
				Create Project
			</Button>
		),
	},
};

export const WithCustomIcon: Story = {
	args: {
		icon: <Search className="h-5 w-5 text-muted-foreground" />,
		title: "Custom Icon Example",
		description: "This empty state uses a custom icon.",
		action: <Button>Custom Action</Button>,
	},
};

export const WithImage: Story = {
	args: {
		image: (
			<img
				src="https://placehold.co/200x200"
				alt="Illustration"
				className="rounded-lg"
			/>
		),
		title: "With Image",
		description: "This empty state includes a custom image.",
		action: <Button>Get Started</Button>,
	},
};
