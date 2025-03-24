import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "../components/ui/button";

const meta: Meta<typeof Button> = {
	title: "Components/Buttons/Button",
	component: Button,
	parameters: {
		layout: "centered",
		docs: {
			description: {
				component:
					"A button component from the ShadCN UI library with various styles and sizes.",
			},
		},
	},
	tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Button>;

// Base Button
export const Default: Story = {
	args: {
		children: "Button",
		variant: "default",
		size: "default",
	},
};

// Different Variants
export const Primary: Story = {
	args: {
		...Default.args,
		children: "Primary Button",
	},
};

export const Destructive: Story = {
	args: {
		...Default.args,
		variant: "destructive",
		children: "Destructive Button",
	},
};

export const Outline: Story = {
	args: {
		...Default.args,
		variant: "outline",
		children: "Outline Button",
	},
};

export const Secondary: Story = {
	args: {
		...Default.args,
		variant: "secondary",
		children: "Secondary Button",
	},
};

export const Ghost: Story = {
	args: {
		...Default.args,
		variant: "ghost",
		children: "Ghost Button",
	},
};

export const Link: Story = {
	args: {
		...Default.args,
		variant: "link",
		children: "Link Button",
	},
};

// Different Sizes
export const Small: Story = {
	args: {
		...Default.args,
		size: "sm",
		children: "Small Button",
	},
};

export const Large: Story = {
	args: {
		...Default.args,
		size: "lg",
		children: "Large Button",
	},
};

export const Icon: Story = {
	args: {
		...Default.args,
		size: "icon",
		children: "🔍",
	},
};

// States
export const Disabled: Story = {
	args: {
		...Default.args,
		disabled: true,
		children: "Disabled Button",
	},
};

export const Loading: Story = {
	args: {
		...Default.args,
		disabled: true,
		children: (
			<>
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
				Loading...
			</>
		),
	},
};

// With Icon
export const WithIcon: Story = {
	args: {
		...Default.args,
		children: (
			<>
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
					className="mr-2 h-4 w-4">
					<circle
						cx="12"
						cy="12"
						r="10"
					/>
					<line
						x1="12"
						y1="8"
						x2="12"
						y2="16"
					/>
					<line
						x1="8"
						y1="12"
						x2="16"
						y2="12"
					/>
				</svg>
				Add Item
			</>
		),
	},
};

// Responsive Examples
export const ResponsiveGroup: Story = {
	render: () => (
		<div className="flex flex-col sm:flex-row gap-4">
			<Button
				variant="default"
				className="w-full sm:w-auto">
				Responsive Button
			</Button>
			<Button
				variant="outline"
				className="w-full sm:w-auto">
				Responsive Button
			</Button>
		</div>
	),
};

// Accessibility Examples
export const AccessibilityExample: Story = {
	render: () => (
		<div className="space-y-4">
			<Button aria-label="Close dialog">×</Button>
			<Button aria-expanded="true">Expand</Button>
			<Button aria-pressed="true">Pressed</Button>
		</div>
	),
};

// Performance Considerations
export const PerformanceExample: Story = {
	render: () => (
		<div className="space-y-4">
			<p className="text-sm text-muted-foreground">
				This button uses React.memo internally for optimal performance with
				frequent re-renders.
			</p>
			<Button>Optimized Button</Button>
		</div>
	),
};
