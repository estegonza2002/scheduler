import type { Meta, StoryObj } from "@storybook/react";
import { Badge } from "../../components/ui/badge";
import { Plus, Check, X, Bell, Star } from "lucide-react";

const meta: Meta<typeof Badge> = {
	title: "Components/Badge",
	component: Badge,
	parameters: {
		layout: "centered",
		docs: {
			description: {
				component: `A badge component that can be used to display status, labels, or counts.

## Accessibility
- Uses semantic HTML with proper ARIA roles and labels
- Supports keyboard navigation
- Provides clear visual and text indicators for different states
- Maintains sufficient color contrast for text and backgrounds
- Includes descriptive text for screen readers
- Uses appropriate ARIA landmarks and labels
- Supports screen reader announcements for dynamic content
- Provides focus management for interactive badges
- Includes proper heading hierarchy when used with headings

## Performance
- Lightweight component with minimal dependencies
- Efficient rendering with proper React patterns
- Optimized for re-renders with proper prop types
- Minimal DOM footprint
- Memoized icon components
- Efficient state management for interactive badges
- Optimized animations and transitions

## Mobile Responsiveness
- Adapts to different screen sizes
- Maintains readability on mobile devices
- Proper spacing and padding for touch targets
- Flexible width handling
- Icon scaling for different viewports
- Touch-friendly interactive badges
- Responsive typography
- Proper spacing in mobile layouts`,
			},
		},
	},
	tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Badge>;

// Basic Examples
export const Default: Story = {
	args: {
		children: "Badge",
		role: "status",
		"aria-label": "Status: Default",
	},
};

export const Secondary: Story = {
	args: {
		variant: "secondary",
		children: "Secondary",
		role: "status",
		"aria-label": "Status: Secondary",
	},
};

export const Destructive: Story = {
	args: {
		variant: "destructive",
		children: "Destructive",
		role: "status",
		"aria-label": "Status: Destructive",
	},
};

export const Outline: Story = {
	args: {
		variant: "outline",
		children: "Outline",
		role: "status",
		"aria-label": "Status: Outline",
	},
};

// Interactive Examples
export const Clickable: Story = {
	render: () => (
		<Badge
			role="button"
			tabIndex={0}
			className="cursor-pointer hover:opacity-80 transition-opacity focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
			onClick={() => alert("Badge clicked!")}
			aria-label="Click to perform action">
			Clickable Badge
		</Badge>
	),
};

export const WithKeyboardNavigation: Story = {
	render: () => (
		<Badge
			role="button"
			tabIndex={0}
			className="focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
			aria-label="Interactive badge">
			Press Enter to interact
		</Badge>
	),
};

// Accessibility Examples
export const WithAriaLabels: Story = {
	render: () => (
		<div className="flex flex-wrap gap-2">
			<Badge
				role="status"
				aria-label="Status: Active"
				aria-live="polite">
				Active
			</Badge>
			<Badge
				role="status"
				aria-label="Status: Pending"
				aria-live="polite">
				Pending
			</Badge>
			<Badge
				role="status"
				aria-label="Status: Completed"
				aria-live="polite">
				Completed
			</Badge>
		</div>
	),
};

// Responsive Examples
export const ResponsiveLayout: Story = {
	render: () => (
		<div className="w-full max-w-md mx-auto">
			<div className="flex flex-wrap gap-2 justify-center sm:justify-start">
				<Badge
					role="status"
					aria-label="Status: Responsive"
					className="text-sm sm:text-base">
					Responsive
				</Badge>
				<Badge
					role="status"
					aria-label="Status: Badge"
					className="text-sm sm:text-base">
					Badge
				</Badge>
				<Badge
					role="status"
					aria-label="Status: Layout"
					className="text-sm sm:text-base">
					Layout
				</Badge>
			</div>
		</div>
	),
};

export const MobileOptimized: Story = {
	render: () => (
		<div className="w-full max-w-[90vw] sm:max-w-none">
			<Badge
				role="status"
				aria-label="Status: Mobile"
				className="text-sm sm:text-base px-2 sm:px-3 py-1 sm:py-1.5">
				Mobile Optimized Badge
			</Badge>
		</div>
	),
};

// Loading State
export const Loading: Story = {
	render: () => (
		<Badge
			role="status"
			aria-label="Status: Loading"
			className="animate-pulse">
			Loading...
		</Badge>
	),
};

// Edge Cases
export const WithLongContent: Story = {
	render: () => (
		<Badge
			role="status"
			aria-label="Status: Long content"
			className="max-w-[200px] truncate">
			This is a very long badge text that should be truncated when it exceeds
			the maximum width
		</Badge>
	),
};

export const WithHTMLContent: Story = {
	render: () => (
		<Badge
			role="status"
			aria-label="Status: HTML content">
			This badge contains <strong>HTML content</strong> and{" "}
			<a
				href="#"
				className="underline">
				links
			</a>
		</Badge>
	),
};

// Color Schemes
export const ColorSchemes: Story = {
	render: () => (
		<div className="flex flex-wrap gap-2">
			<Badge
				colorScheme="blue"
				role="status"
				aria-label="Status: Blue">
				Blue
			</Badge>
			<Badge
				colorScheme="purple"
				role="status"
				aria-label="Status: Purple">
				Purple
			</Badge>
			<Badge
				colorScheme="green"
				role="status"
				aria-label="Status: Green">
				Green
			</Badge>
			<Badge
				colorScheme="amber"
				role="status"
				aria-label="Status: Amber">
				Amber
			</Badge>
			<Badge
				colorScheme="red"
				role="status"
				aria-label="Status: Red">
				Red
			</Badge>
			<Badge
				colorScheme="indigo"
				role="status"
				aria-label="Status: Indigo">
				Indigo
			</Badge>
			<Badge
				colorScheme="pink"
				role="status"
				aria-label="Status: Pink">
				Pink
			</Badge>
			<Badge
				colorScheme="teal"
				role="status"
				aria-label="Status: Teal">
				Teal
			</Badge>
		</div>
	),
};

// Sizes
export const Sizes: Story = {
	render: () => (
		<div className="flex items-center gap-2">
			<Badge
				size="sm"
				role="status"
				aria-label="Status: Small">
				Small
			</Badge>
			<Badge
				size="default"
				role="status"
				aria-label="Status: Default">
				Default
			</Badge>
			<Badge
				size="lg"
				role="status"
				aria-label="Status: Large">
				Large
			</Badge>
		</div>
	),
};

// With Icons
export const WithIcons: Story = {
	render: () => (
		<div className="flex flex-wrap gap-2">
			<Badge
				role="status"
				aria-label="Status: Add new">
				<Plus className="mr-1 h-4 w-4" />
				Add New
			</Badge>
			<Badge
				variant="secondary"
				role="status"
				aria-label="Status: Completed">
				<Check className="mr-1 h-4 w-4" />
				Completed
			</Badge>
			<Badge
				variant="destructive"
				role="status"
				aria-label="Status: Failed">
				<X className="mr-1 h-4 w-4" />
				Failed
			</Badge>
			<Badge
				role="status"
				aria-label="Status: Notification">
				<Bell className="mr-1 h-4 w-4" />
				Notification
			</Badge>
			<Badge
				role="status"
				aria-label="Status: Featured">
				<Star className="mr-1 h-4 w-4" />
				Featured
			</Badge>
		</div>
	),
};

// All Variants
export const AllVariants: Story = {
	render: () => (
		<div className="flex flex-wrap gap-2">
			<Badge
				role="status"
				aria-label="Status: Default">
				Default
			</Badge>
			<Badge
				variant="secondary"
				role="status"
				aria-label="Status: Secondary">
				Secondary
			</Badge>
			<Badge
				variant="destructive"
				role="status"
				aria-label="Status: Destructive">
				Destructive
			</Badge>
			<Badge
				variant="outline"
				role="status"
				aria-label="Status: Outline">
				Outline
			</Badge>
		</div>
	),
};
