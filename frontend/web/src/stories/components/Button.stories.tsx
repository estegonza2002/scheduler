import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "@/components/ui/button";

const meta: Meta<typeof Button> = {
	title: "Components/Button",
	component: Button,
	parameters: {
		layout: "padded",
		docs: {
			description: {
				component:
					"A versatile button component with multiple variants and sizes.",
			},
		},
	},
	tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Default: Story = {
	render: () => <Button>Default Button</Button>,
};

export const Variants: Story = {
	render: () => (
		<div className="flex flex-wrap gap-4">
			<Button variant="default">Default</Button>
			<Button variant="destructive">Destructive</Button>
			<Button variant="outline">Outline</Button>
			<Button variant="secondary">Secondary</Button>
			<Button variant="ghost">Ghost</Button>
			<Button variant="link">Link</Button>
		</div>
	),
};

export const Sizes: Story = {
	render: () => (
		<div className="flex items-center gap-4">
			<Button size="sm">Small</Button>
			<Button size="default">Default</Button>
			<Button size="lg">Large</Button>
			<Button size="icon">👋</Button>
		</div>
	),
};

export const WithIcon: Story = {
	render: () => (
		<div className="flex gap-4">
			<Button>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="16"
					height="16"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					strokeWidth="2"
					strokeLinecap="round"
					strokeLinejoin="round"
					className="mr-2">
					<path d="M5 12h14" />
					<path d="m12 5 7 7-7 7" />
				</svg>
				Next
			</Button>
			<Button variant="outline">
				Previous
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="16"
					height="16"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					strokeWidth="2"
					strokeLinecap="round"
					strokeLinejoin="round"
					className="ml-2">
					<path d="M19 12H5" />
					<path d="m12 19-7-7 7-7" />
				</svg>
			</Button>
		</div>
	),
};

export const Disabled: Story = {
	render: () => (
		<div className="flex gap-4">
			<Button disabled>Default</Button>
			<Button
				variant="destructive"
				disabled>
				Destructive
			</Button>
			<Button
				variant="outline"
				disabled>
				Outline
			</Button>
		</div>
	),
};

export const Loading: Story = {
	render: () => (
		<div className="flex gap-4">
			<Button disabled>
				<svg
					className="mr-2 h-4 w-4 animate-spin"
					xmlns="http://www.w3.org/2000/svg"
					fill="none"
					viewBox="0 0 24 24">
					<circle
						className="opacity-25"
						cx="12"
						cy="12"
						r="10"
						stroke="currentColor"
						strokeWidth="4"
					/>
					<path
						className="opacity-75"
						fill="currentColor"
						d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
					/>
				</svg>
				Loading
			</Button>
		</div>
	),
};
