import type { Meta, StoryObj } from "@storybook/react";
import { SchedulePage } from "@/pages/schedule/SchedulePage";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, Users, Filter } from "lucide-react";

const meta: Meta<typeof SchedulePage> = {
	title: "Pages/Schedule/SchedulePage",
	component: SchedulePage,
	parameters: {
		layout: "fullscreen",
		docs: {
			description: {
				component: `A schedule page component that displays and manages employee shifts.

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
- Provides ARIA live regions for schedule updates
- Supports screen reader navigation of schedule grid

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
- Optimized calendar rendering
- Virtual scrolling for large schedules
- Efficient filter and search operations

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
- Collapsible sections for mobile
- Touch-friendly drag and drop
- Mobile-optimized calendar view`,
			},
		},
	},
	tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof SchedulePage>;

// Basic Examples
export const Default: Story = {
	render: () => (
		<SchedulePage
			title="Schedule"
			description="Manage and view employee shifts."
		/>
	),
};

// With Calendar View
export const WithCalendarView: Story = {
	render: () => (
		<div className="p-6 space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h2 className="text-3xl font-bold tracking-tight">Schedule</h2>
					<p className="text-muted-foreground">
						Manage and view employee shifts.
					</p>
				</div>
				<div className="flex items-center space-x-2">
					<Button variant="outline">
						<Filter className="mr-2 h-4 w-4" />
						Filter
					</Button>
					<Button>
						<Calendar className="mr-2 h-4 w-4" />
						New Shift
					</Button>
				</div>
			</div>
			<Card>
				<CardHeader>
					<CardTitle>Weekly Schedule</CardTitle>
					<CardDescription>
						View and manage shifts for the current week.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="grid grid-cols-7 gap-4">
						{["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
							<div
								key={day}
								className="p-4 border rounded-lg">
								<h3 className="font-medium">{day}</h3>
								<div className="mt-2 space-y-2">
									<div className="p-2 bg-muted rounded">
										<p className="text-sm">Morning Shift</p>
										<p className="text-xs text-muted-foreground">
											8:00 AM - 4:00 PM
										</p>
									</div>
									<div className="p-2 bg-muted rounded">
										<p className="text-sm">Evening Shift</p>
										<p className="text-xs text-muted-foreground">
											4:00 PM - 12:00 AM
										</p>
									</div>
								</div>
							</div>
						))}
					</div>
				</CardContent>
			</Card>
		</div>
	),
};

// With Shift Details
export const WithShiftDetails: Story = {
	render: () => (
		<div className="p-6 space-y-6">
			<Card>
				<CardHeader>
					<CardTitle>Shift Details</CardTitle>
					<CardDescription>View and edit shift information.</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="grid gap-4">
						<div className="flex items-center space-x-4">
							<Clock className="h-4 w-4 text-muted-foreground" />
							<div>
								<p className="text-sm font-medium">Time</p>
								<p className="text-sm text-muted-foreground">
									8:00 AM - 4:00 PM
								</p>
							</div>
						</div>
						<div className="flex items-center space-x-4">
							<Users className="h-4 w-4 text-muted-foreground" />
							<div>
								<p className="text-sm font-medium">Assigned Employees</p>
								<p className="text-sm text-muted-foreground">3 employees</p>
							</div>
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	),
};

// Mobile Optimized
export const MobileOptimized: Story = {
	render: () => (
		<div className="p-4 space-y-4">
			<div className="flex items-center justify-between">
				<div>
					<h2 className="text-2xl font-bold tracking-tight">Schedule</h2>
					<p className="text-sm text-muted-foreground">
						Manage and view employee shifts.
					</p>
				</div>
				<div className="flex items-center space-x-2">
					<Button
						variant="outline"
						size="sm">
						<Filter className="mr-2 h-4 w-4" />
						Filter
					</Button>
					<Button size="sm">
						<Calendar className="mr-2 h-4 w-4" />
						New
					</Button>
				</div>
			</div>
			<Card>
				<CardHeader>
					<CardTitle>Today's Schedule</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="space-y-4">
						<div className="p-3 bg-muted rounded">
							<p className="text-sm font-medium">Morning Shift</p>
							<p className="text-xs text-muted-foreground">8:00 AM - 4:00 PM</p>
						</div>
						<div className="p-3 bg-muted rounded">
							<p className="text-sm font-medium">Evening Shift</p>
							<p className="text-xs text-muted-foreground">
								4:00 PM - 12:00 AM
							</p>
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	),
};

// With Loading State
export const WithLoadingState: Story = {
	render: () => (
		<div className="p-6 space-y-6 animate-pulse">
			<div className="flex items-center justify-between">
				<div className="space-y-2">
					<div className="h-8 w-32 rounded bg-muted" />
					<div className="h-4 w-48 rounded bg-muted" />
				</div>
				<div className="flex items-center space-x-2">
					<div className="h-9 w-20 rounded bg-muted" />
				</div>
			</div>
			<Card>
				<CardHeader>
					<div className="space-y-2">
						<div className="h-6 w-32 rounded bg-muted" />
						<div className="h-4 w-48 rounded bg-muted" />
					</div>
				</CardHeader>
				<CardContent>
					<div className="grid grid-cols-7 gap-4">
						{[...Array(7)].map((_, i) => (
							<div
								key={i}
								className="space-y-2">
								<div className="h-4 w-12 rounded bg-muted" />
								<div className="space-y-2">
									<div className="h-16 rounded bg-muted" />
									<div className="h-16 rounded bg-muted" />
								</div>
							</div>
						))}
					</div>
				</CardContent>
			</Card>
		</div>
	),
};
