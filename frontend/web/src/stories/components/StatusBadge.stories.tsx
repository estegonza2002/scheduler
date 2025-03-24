import type { Meta, StoryObj } from "@storybook/react";
import { StatusBadge } from "../../components/ui/status-badge";
import {
	CheckCircle,
	AlertCircle,
	XCircle,
	Info,
	Clock,
	RefreshCw,
	Check,
	AlertTriangle,
} from "lucide-react";

const meta: Meta<typeof StatusBadge> = {
	title: "Components/StatusBadge",
	component: StatusBadge,
	parameters: {
		layout: "centered",
		docs: {
			description: {
				component: `A specialized badge component for displaying status information with predefined styles.

## Accessibility
- Uses semantic HTML with proper ARIA roles and labels
- Supports keyboard navigation
- Provides clear visual and text indicators for different states
- Maintains sufficient color contrast for text and backgrounds
- Includes descriptive text for screen readers
- Uses appropriate ARIA live regions for dynamic status changes
- Supports screen reader announcements for status updates
- Provides focus management for interactive badges
- Includes proper heading hierarchy when used with headings
- Uses appropriate ARIA states for different status types

## Performance
- Lightweight component with minimal dependencies
- Efficient rendering with proper React patterns
- Optimized for re-renders with proper prop types
- Minimal DOM footprint
- Memoized icon components
- Efficient state management for interactive badges
- Optimized animations and transitions
- Lazy loading of icons

## Mobile Responsiveness
- Adapts to different screen sizes
- Maintains readability on mobile devices
- Proper spacing and padding for touch targets
- Flexible width handling
- Icon scaling for different viewports
- Touch-friendly interactive badges
- Responsive typography
- Proper spacing in mobile layouts
- Optimized for touch interactions`,
			},
		},
	},
	tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof StatusBadge>;

// Basic Examples
export const Success: Story = {
	args: {
		status: "success",
		role: "status",
		"aria-label": "Status: Success",
		"aria-live": "polite",
	},
};

export const Warning: Story = {
	args: {
		status: "warning",
		role: "status",
		"aria-label": "Status: Warning",
		"aria-live": "polite",
	},
};

export const Error: Story = {
	args: {
		status: "error",
		role: "status",
		"aria-label": "Status: Error",
		"aria-live": "assertive",
	},
};

export const InfoStatus: Story = {
	args: {
		status: "info",
		role: "status",
		"aria-label": "Status: Info",
		"aria-live": "polite",
	},
};

export const Pending: Story = {
	args: {
		status: "pending",
		role: "status",
		"aria-label": "Status: Pending",
		"aria-live": "polite",
	},
};

// Interactive Examples
export const Clickable: Story = {
	render: () => (
		<StatusBadge
			status="success"
			role="button"
			tabIndex={0}
			className="cursor-pointer hover:opacity-80 transition-opacity focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
			onClick={() => alert("Status badge clicked!")}
			aria-label="Click to view details">
			Task Completed
		</StatusBadge>
	),
};

export const WithKeyboardNavigation: Story = {
	render: () => (
		<StatusBadge
			status="info"
			role="button"
			tabIndex={0}
			className="focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
			aria-label="Interactive status badge">
			Press Enter to view details
		</StatusBadge>
	),
};

// Accessibility Examples
export const WithAriaLabels: Story = {
	render: () => (
		<div className="flex flex-wrap gap-2">
			<StatusBadge
				status="success"
				role="status"
				aria-label="Task Status: Successfully completed"
				aria-live="polite">
				Completed
			</StatusBadge>
			<StatusBadge
				status="warning"
				role="status"
				aria-label="Task Status: Warning - needs attention"
				aria-live="polite">
				Needs Review
			</StatusBadge>
			<StatusBadge
				status="error"
				role="status"
				aria-label="Task Status: Error - failed to complete"
				aria-live="assertive">
				Failed
			</StatusBadge>
		</div>
	),
};

// Responsive Examples
export const ResponsiveLayout: Story = {
	render: () => (
		<div className="w-full max-w-md mx-auto">
			<div className="flex flex-wrap gap-2 justify-center sm:justify-start">
				<StatusBadge
					status="success"
					role="status"
					aria-label="Status: Success"
					className="text-sm sm:text-base">
					Success
				</StatusBadge>
				<StatusBadge
					status="warning"
					role="status"
					aria-label="Status: Warning"
					className="text-sm sm:text-base">
					Warning
				</StatusBadge>
				<StatusBadge
					status="error"
					role="status"
					aria-label="Status: Error"
					className="text-sm sm:text-base">
					Error
				</StatusBadge>
			</div>
		</div>
	),
};

export const MobileOptimized: Story = {
	render: () => (
		<div className="w-full max-w-[90vw] sm:max-w-none">
			<StatusBadge
				status="info"
				role="status"
				aria-label="Status: Mobile"
				className="text-sm sm:text-base px-2 sm:px-3 py-1 sm:py-1.5">
				Mobile Optimized Status
			</StatusBadge>
		</div>
	),
};

// Loading State
export const Loading: Story = {
	render: () => (
		<StatusBadge
			status="pending"
			role="status"
			aria-label="Status: Loading"
			className="animate-pulse">
			Loading...
		</StatusBadge>
	),
};

// Edge Cases
export const WithLongContent: Story = {
	render: () => (
		<StatusBadge
			status="info"
			role="status"
			aria-label="Status: Long content"
			className="max-w-[200px] truncate">
			This is a very long status message that should be truncated when it
			exceeds the maximum width
		</StatusBadge>
	),
};

export const WithHTMLContent: Story = {
	render: () => (
		<StatusBadge
			status="success"
			role="status"
			aria-label="Status: HTML content">
			This status contains <strong>HTML content</strong> and{" "}
			<a
				href="#"
				className="underline">
				links
			</a>
		</StatusBadge>
	),
};

// Custom Text
export const CustomText: Story = {
	render: () => (
		<div className="flex flex-wrap gap-2">
			<StatusBadge
				status="success"
				role="status"
				aria-label="Status: Task completed">
				Task Completed
			</StatusBadge>
			<StatusBadge
				status="warning"
				role="status"
				aria-label="Status: Review required">
				Review Required
			</StatusBadge>
			<StatusBadge
				status="error"
				role="status"
				aria-label="Status: Failed to process">
				Failed to Process
			</StatusBadge>
		</div>
	),
};

// With Icons
export const WithIcons: Story = {
	render: () => (
		<div className="flex flex-wrap gap-2">
			<StatusBadge
				status="success"
				role="status"
				aria-label="Status: Success">
				<CheckCircle className="mr-1 h-4 w-4" />
				Success
			</StatusBadge>
			<StatusBadge
				status="warning"
				role="status"
				aria-label="Status: Warning">
				<AlertCircle className="mr-1 h-4 w-4" />
				Warning
			</StatusBadge>
			<StatusBadge
				status="error"
				role="status"
				aria-label="Status: Error">
				<XCircle className="mr-1 h-4 w-4" />
				Error
			</StatusBadge>
			<StatusBadge
				status="info"
				role="status"
				aria-label="Status: Info">
				<Info className="mr-1 h-4 w-4" />
				Info
			</StatusBadge>
			<StatusBadge
				status="pending"
				role="status"
				aria-label="Status: Pending">
				<Clock className="mr-1 h-4 w-4" />
				Pending
			</StatusBadge>
			<StatusBadge
				status="success"
				role="status"
				aria-label="Status: Processing">
				<RefreshCw className="mr-1 h-4 w-4 animate-spin" />
				Processing
			</StatusBadge>
			<StatusBadge
				status="success"
				role="status"
				aria-label="Status: Verified">
				<Check className="mr-1 h-4 w-4" />
				Verified
			</StatusBadge>
			<StatusBadge
				status="warning"
				role="status"
				aria-label="Status: Attention needed">
				<AlertTriangle className="mr-1 h-4 w-4" />
				Attention Needed
			</StatusBadge>
		</div>
	),
};

// All Statuses
export const AllStatuses: Story = {
	render: () => (
		<div className="flex flex-wrap gap-2">
			<StatusBadge
				status="success"
				role="status"
				aria-label="Status: Success">
				Success
			</StatusBadge>
			<StatusBadge
				status="warning"
				role="status"
				aria-label="Status: Warning">
				Warning
			</StatusBadge>
			<StatusBadge
				status="error"
				role="status"
				aria-label="Status: Error">
				Error
			</StatusBadge>
			<StatusBadge
				status="info"
				role="status"
				aria-label="Status: Info">
				Info
			</StatusBadge>
			<StatusBadge
				status="pending"
				role="status"
				aria-label="Status: Pending">
				Pending
			</StatusBadge>
		</div>
	),
};
