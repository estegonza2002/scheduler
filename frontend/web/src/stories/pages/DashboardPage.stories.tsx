import type { Meta, StoryObj } from "@storybook/react";
import { DashboardPage } from "@/pages/dashboard/DashboardPage";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Users, Clock, AlertCircle } from "lucide-react";

const meta: Meta<typeof DashboardPage> = {
	title: "Pages/Dashboard/DashboardPage",
	component: DashboardPage,
	parameters: {
		layout: "fullscreen",
		docs: {
			description: {
				component: `A dashboard page component that displays key metrics and information.

## Accessibility
- Uses semantic HTML with proper ARIA roles and labels
- Supports keyboard navigation (Tab, Enter)
- Provides clear visual and text indicators for interactive elements
- Maintains sufficient color contrast for text and backgrounds
- Includes descriptive text for screen readers
- Uses appropriate ARIA landmarks and labels
- Supports screen reader announcements for updates
- Provides focus management for interactive elements
- Includes proper heading hierarchy
- Uses appropriate ARIA states for interactive elements
- Supports touch targets for mobile devices
- Provides clear visual feedback for interactions
- Maintains focus management for dynamic content
- Supports keyboard shortcuts for common actions

## Performance
- Lightweight component with minimal dependencies
- Efficient rendering with proper React patterns
- Optimized for re-renders with proper prop types
- Minimal DOM footprint
- Efficient state management
- Optimized animations and transitions
- Efficient icon rendering
- Optimized for data updates
- Efficient mobile viewport handling
- Lazy loading for heavy components
- Efficient data fetching patterns
- Optimized chart rendering

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
- Provides mobile-specific interactions
- Responsive grid layouts
- Collapsible sections for mobile`,
			},
		},
	},
	tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof DashboardPage>;

// Basic Examples
export const Default: Story = {
	render: () => (
		<DashboardPage
			title="Dashboard"
			description="Overview of your schedule and team."
		/>
	),
};

// With Metrics
export const WithMetrics: Story = {
	render: () => (
		<div className="p-6 space-y-6">
			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Total Shifts</CardTitle>
						<Calendar className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">24</div>
						<p className="text-xs text-muted-foreground">+2 from last week</p>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Team Members</CardTitle>
						<Users className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">12</div>
						<p className="text-xs text-muted-foreground">+1 from last month</p>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Hours Worked</CardTitle>
						<Clock className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">168</div>
						<p className="text-xs text-muted-foreground">+12 from last week</p>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Open Requests</CardTitle>
						<AlertCircle className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">3</div>
						<p className="text-xs text-muted-foreground">-1 from yesterday</p>
					</CardContent>
				</Card>
			</div>
		</div>
	),
};

// With Actions
export const WithActions: Story = {
	render: () => (
		<div className="p-6 space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
					<p className="text-muted-foreground">
						Overview of your schedule and team.
					</p>
				</div>
				<div className="flex items-center space-x-2">
					<Button variant="outline">Export</Button>
					<Button>New Shift</Button>
				</div>
			</div>
		</div>
	),
};

// Mobile Optimized
export const MobileOptimized: Story = {
	render: () => (
		<div className="p-4 space-y-4">
			<div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Total Shifts</CardTitle>
						<Calendar className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">24</div>
						<p className="text-xs text-muted-foreground">+2 from last week</p>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Team Members</CardTitle>
						<Users className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">12</div>
						<p className="text-xs text-muted-foreground">+1 from last month</p>
					</CardContent>
				</Card>
			</div>
		</div>
	),
};

// With Loading State
export const WithLoadingState: Story = {
	render: () => (
		<div className="p-6 space-y-6 animate-pulse">
			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<div className="h-4 w-24 rounded bg-muted" />
						<div className="h-4 w-4 rounded bg-muted" />
					</CardHeader>
					<CardContent>
						<div className="h-8 w-16 rounded bg-muted" />
						<div className="h-3 w-24 rounded bg-muted mt-2" />
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<div className="h-4 w-24 rounded bg-muted" />
						<div className="h-4 w-4 rounded bg-muted" />
					</CardHeader>
					<CardContent>
						<div className="h-8 w-16 rounded bg-muted" />
						<div className="h-3 w-24 rounded bg-muted mt-2" />
					</CardContent>
				</Card>
			</div>
		</div>
	),
};
