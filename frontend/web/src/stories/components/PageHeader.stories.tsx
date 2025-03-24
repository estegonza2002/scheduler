import type { Meta, StoryObj } from "@storybook/react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Plus, Search, Filter, Download } from "lucide-react";

const meta: Meta<typeof PageHeader> = {
	title: "Components/Layout/PageHeader",
	component: PageHeader,
	parameters: {
		layout: "centered",
		docs: {
			description: {
				component: `A page header component for displaying page titles and actions.

## Accessibility
- Uses semantic HTML with proper ARIA roles and labels
- Supports keyboard navigation (Tab, Enter)
- Provides clear visual and text indicators for header states
- Maintains sufficient color contrast for text and backgrounds
- Includes descriptive text for screen readers
- Uses appropriate ARIA landmarks and labels
- Supports screen reader announcements for header changes
- Provides focus management for interactive elements
- Includes proper heading hierarchy
- Uses appropriate ARIA states for interactive elements
- Supports touch targets for mobile devices
- Provides clear visual feedback for interactions
- Maintains focus trap when modal is open
- Supports escape key to close modal

## Performance
- Lightweight component with minimal dependencies
- Efficient rendering with proper React patterns
- Optimized for re-renders with proper prop types
- Minimal DOM footprint
- Efficient state management
- Optimized animations and transitions
- Efficient icon rendering
- Optimized for large lists
- Efficient mobile viewport handling

## Mobile Responsiveness
- Adapts to different screen sizes
- Maintains readability on mobile devices
- Proper spacing and padding for touch targets
- Flexible width handling
- Icon scaling for different viewports
- Touch-friendly controls
- Responsive typography
- Proper spacing in mobile layouts
- Optimized for touch interactions
- Supports mobile keyboard handling
- Adapts layout for small screens
- Handles orientation changes gracefully
- Provides mobile-specific interactions`,
			},
		},
	},
	tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof PageHeader>;

// Basic Examples
export const Default: Story = {
	render: () => (
		<PageHeader
			title="Employees"
			description="Manage your team members and their schedules."
		/>
	),
};

// With Actions
export const WithActions: Story = {
	render: () => (
		<PageHeader
			title="Employees"
			description="Manage your team members and their schedules."
			actions={
				<>
					<Button
						variant="outline"
						size="sm">
						<Search className="mr-2 h-4 w-4" />
						Search
					</Button>
					<Button
						variant="outline"
						size="sm">
						<Filter className="mr-2 h-4 w-4" />
						Filter
					</Button>
					<Button
						variant="outline"
						size="sm">
						<Download className="mr-2 h-4 w-4" />
						Export
					</Button>
					<Button size="sm">
						<Plus className="mr-2 h-4 w-4" />
						Add Employee
					</Button>
				</>
			}
		/>
	),
};

// With Breadcrumbs
export const WithBreadcrumbs: Story = {
	render: () => (
		<PageHeader
			title="Employee Details"
			description="View and edit employee information."
			breadcrumbs={[
				{ label: "Home", href: "/" },
				{ label: "Employees", href: "/employees" },
				{ label: "John Smith", href: "/employees/1" },
			]}
		/>
	),
};

// With Tabs
export const WithTabs: Story = {
	render: () => (
		<PageHeader
			title="Schedule"
			description="Manage employee shifts and schedules."
			tabs={[
				{ label: "Overview", value: "overview" },
				{ label: "Shifts", value: "shifts" },
				{ label: "Calendar", value: "calendar" },
				{ label: "Reports", value: "reports" },
			]}
		/>
	),
};

// Mobile Optimized
export const MobileOptimized: Story = {
	render: () => (
		<div className="w-full max-w-[90vw] sm:max-w-md mx-auto">
			<PageHeader
				title="Employees"
				description="Manage your team members and their schedules."
				actions={
					<>
						<Button
							variant="outline"
							size="sm">
							<Search className="mr-2 h-4 w-4" />
							Search
						</Button>
						<Button
							variant="outline"
							size="sm">
							<Filter className="mr-2 h-4 w-4" />
							Filter
						</Button>
						<Button size="sm">
							<Plus className="mr-2 h-4 w-4" />
							Add
						</Button>
					</>
				}
			/>
		</div>
	),
};

// With Loading State
export const WithLoadingState: Story = {
	render: () => (
		<div className="space-y-4 animate-pulse">
			<div className="h-8 w-48 rounded bg-muted" />
			<div className="h-4 w-72 rounded bg-muted" />
			<div className="flex gap-2">
				<div className="h-8 w-24 rounded bg-muted" />
			</div>
		</div>
	),
};
