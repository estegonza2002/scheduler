import React from "react";
import { Button } from "../components/ui/button";

export default {
	title: "ShadCN/Button",
	component: Button,
	argTypes: {
		variant: {
			options: [
				"default",
				"destructive",
				"outline",
				"secondary",
				"ghost",
				"link",
			],
			control: { type: "select" },
			description: "The visual style of the button",
			table: {
				defaultValue: { summary: "default" },
			},
		},
		size: {
			options: ["default", "sm", "lg", "icon"],
			control: { type: "select" },
			description: "The size of the button",
			table: {
				defaultValue: { summary: "default" },
			},
		},
		asChild: {
			control: "boolean",
			description: "Whether to render as a child element or use the as prop",
			table: {
				defaultValue: { summary: false },
			},
		},
		disabled: {
			control: "boolean",
			description: "Whether the button is disabled",
			table: {
				defaultValue: { summary: false },
			},
		},
		children: {
			control: "text",
			description: "The content of the button",
		},
	},
	parameters: {
		docs: {
			description: {
				component:
					"A button component from the ShadCN UI library with various styles and sizes.",
			},
		},
	},
};

// Base Button
export const Default = {
	args: {
		children: "Button",
		variant: "default",
		size: "default",
	},
};

// Different Variants
export const Primary = {
	args: {
		...Default.args,
		children: "Primary Button",
	},
};

export const Destructive = {
	args: {
		...Default.args,
		variant: "destructive",
		children: "Destructive Button",
	},
};

export const Outline = {
	args: {
		...Default.args,
		variant: "outline",
		children: "Outline Button",
	},
};

export const Secondary = {
	args: {
		...Default.args,
		variant: "secondary",
		children: "Secondary Button",
	},
};

export const Ghost = {
	args: {
		...Default.args,
		variant: "ghost",
		children: "Ghost Button",
	},
};

export const Link = {
	args: {
		...Default.args,
		variant: "link",
		children: "Link Button",
	},
};

// Different Sizes
export const Small = {
	args: {
		...Default.args,
		size: "sm",
		children: "Small Button",
	},
};

export const Large = {
	args: {
		...Default.args,
		size: "lg",
		children: "Large Button",
	},
};

export const Icon = {
	args: {
		...Default.args,
		size: "icon",
		children: "🔍",
	},
};

// Disabled State
export const Disabled = {
	args: {
		...Default.args,
		disabled: true,
		children: "Disabled Button",
	},
};

// With Icon
export const WithIcon = {
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

// Multiple Buttons Display
export const ButtonGroup = {
	render: (args) => (
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

// New York Style Button (ShadCN variant)
export const NewYorkStyle = {
	render: () => (
		<div className="space-y-4">
			<h3 className="text-lg font-medium">New York Style Buttons</h3>
			<p className="text-sm text-muted-foreground">
				The New York variant has squared corners and stronger borders.
			</p>
			<div className="flex flex-wrap gap-4">
				<Button variant="default">Default</Button>
				<Button variant="destructive">Destructive</Button>
				<Button variant="outline">Outline</Button>
			</div>
		</div>
	),
};
