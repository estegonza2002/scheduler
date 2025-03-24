import type { Meta, StoryObj } from "@storybook/react";
import {
	Tabs,
	TabsList,
	TabsTrigger,
	TabsContent,
} from "../../components/ui/tabs";
import {
	LayoutDashboard,
	Users,
	FileText,
	User,
	Calendar,
	Settings,
} from "lucide-react";

const meta: Meta<typeof Tabs> = {
	title: "Components/Tabs",
	component: Tabs,
	parameters: {
		layout: "centered",
		docs: {
			description: {
				component: `A tabs component that allows users to switch between different views or sections of content.

## Accessibility
- Uses semantic HTML with proper ARIA roles and labels
- Supports keyboard navigation (arrow keys, Home/End)
- Provides clear visual and text indicators for active states
- Maintains sufficient color contrast for text and backgrounds
- Includes descriptive text for screen readers
- Uses appropriate ARIA landmarks and labels
- Supports screen reader announcements for tab changes
- Provides focus management for tab navigation
- Includes proper heading hierarchy within tab content
- Uses appropriate ARIA states for selected tabs
- Supports touch targets for mobile devices
- Provides clear visual feedback for interactions

## Performance
- Lightweight component with minimal dependencies
- Efficient rendering with proper React patterns
- Optimized for re-renders with proper prop types
- Minimal DOM footprint
- Memoized content components
- Efficient state management for tab switching
- Optimized animations and transitions
- Lazy loading of tab content
- Efficient icon rendering
- Optimized for large tab sets

## Mobile Responsiveness
- Adapts to different screen sizes
- Maintains readability on mobile devices
- Proper spacing and padding for touch targets
- Flexible width handling
- Icon scaling for different viewports
- Touch-friendly tab navigation
- Responsive typography
- Proper spacing in mobile layouts
- Optimized for touch interactions
- Supports swipe gestures for tab switching
- Adapts layout for small screens`,
			},
		},
	},
	tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Tabs>;

// Basic Examples
export const Default: Story = {
	render: () => (
		<Tabs
			defaultValue="overview"
			className="w-full"
			role="tablist"
			aria-label="Main navigation tabs">
			<TabsList>
				<TabsTrigger
					value="overview"
					role="tab"
					aria-selected="true"
					aria-controls="overview-content">
					Overview
				</TabsTrigger>
				<TabsTrigger
					value="schedule"
					role="tab"
					aria-selected="false"
					aria-controls="schedule-content">
					Schedule
				</TabsTrigger>
				<TabsTrigger
					value="settings"
					role="tab"
					aria-selected="false"
					aria-controls="settings-content">
					Settings
				</TabsTrigger>
			</TabsList>
			<TabsContent
				value="overview"
				className="mt-4"
				id="overview-content"
				role="tabpanel"
				aria-labelledby="overview-tab">
				<div className="rounded-lg border p-4">
					<h3 className="text-lg font-medium">Overview</h3>
					<p className="mt-2 text-sm text-muted-foreground">
						This is the overview tab content. It contains general information
						about the current view.
					</p>
				</div>
			</TabsContent>
			<TabsContent
				value="schedule"
				className="mt-4"
				id="schedule-content"
				role="tabpanel"
				aria-labelledby="schedule-tab">
				<div className="rounded-lg border p-4">
					<h3 className="text-lg font-medium">Schedule</h3>
					<p className="mt-2 text-sm text-muted-foreground">
						This is the schedule tab content. It displays the scheduling
						interface and related information.
					</p>
				</div>
			</TabsContent>
			<TabsContent
				value="settings"
				className="mt-4"
				id="settings-content"
				role="tabpanel"
				aria-labelledby="settings-tab">
				<div className="rounded-lg border p-4">
					<h3 className="text-lg font-medium">Settings</h3>
					<p className="mt-2 text-sm text-muted-foreground">
						This is the settings tab content. It contains configuration options
						and preferences.
					</p>
				</div>
			</TabsContent>
		</Tabs>
	),
};

// With Icons
export const WithIcons: Story = {
	render: () => (
		<Tabs
			defaultValue="dashboard"
			className="w-full"
			role="tablist"
			aria-label="Navigation tabs with icons">
			<TabsList>
				<TabsTrigger
					value="dashboard"
					role="tab"
					aria-selected="true"
					aria-controls="dashboard-content">
					<LayoutDashboard className="mr-2 h-4 w-4" />
					Dashboard
				</TabsTrigger>
				<TabsTrigger
					value="employees"
					role="tab"
					aria-selected="false"
					aria-controls="employees-content">
					<Users className="mr-2 h-4 w-4" />
					Employees
				</TabsTrigger>
				<TabsTrigger
					value="reports"
					role="tab"
					aria-selected="false"
					aria-controls="reports-content">
					<FileText className="mr-2 h-4 w-4" />
					Reports
				</TabsTrigger>
			</TabsList>
			<TabsContent
				value="dashboard"
				className="mt-4"
				id="dashboard-content"
				role="tabpanel"
				aria-labelledby="dashboard-tab">
				<div className="rounded-lg border p-4">
					<h3 className="text-lg font-medium">Dashboard</h3>
					<p className="mt-2 text-sm text-muted-foreground">
						View your dashboard metrics and key performance indicators.
					</p>
				</div>
			</TabsContent>
			<TabsContent
				value="employees"
				className="mt-4"
				id="employees-content"
				role="tabpanel"
				aria-labelledby="employees-tab">
				<div className="rounded-lg border p-4">
					<h3 className="text-lg font-medium">Employees</h3>
					<p className="mt-2 text-sm text-muted-foreground">
						Manage your employee roster and view individual profiles.
					</p>
				</div>
			</TabsContent>
			<TabsContent
				value="reports"
				className="mt-4"
				id="reports-content"
				role="tabpanel"
				aria-labelledby="reports-tab">
				<div className="rounded-lg border p-4">
					<h3 className="text-lg font-medium">Reports</h3>
					<p className="mt-2 text-sm text-muted-foreground">
						Access and generate various reports and analytics.
					</p>
				</div>
			</TabsContent>
		</Tabs>
	),
};

// Vertical Tabs
export const VerticalTabs: Story = {
	render: () => (
		<Tabs
			defaultValue="profile"
			className="flex flex-col sm:flex-row gap-4"
			role="tablist"
			aria-label="Vertical navigation tabs">
			<TabsList className="flex flex-col h-auto">
				<TabsTrigger
					value="profile"
					role="tab"
					aria-selected="true"
					aria-controls="profile-content">
					<User className="mr-2 h-4 w-4" />
					Profile
				</TabsTrigger>
				<TabsTrigger
					value="schedule"
					role="tab"
					aria-selected="false"
					aria-controls="schedule-content">
					<Calendar className="mr-2 h-4 w-4" />
					Schedule
				</TabsTrigger>
				<TabsTrigger
					value="preferences"
					role="tab"
					aria-selected="false"
					aria-controls="preferences-content">
					<Settings className="mr-2 h-4 w-4" />
					Preferences
				</TabsTrigger>
			</TabsList>
			<div className="flex-1">
				<TabsContent
					value="profile"
					className="mt-0"
					id="profile-content"
					role="tabpanel"
					aria-labelledby="profile-tab">
					<div className="rounded-lg border p-4">
						<h3 className="text-lg font-medium">Profile</h3>
						<p className="mt-2 text-sm text-muted-foreground">
							View and edit your profile information.
						</p>
					</div>
				</TabsContent>
				<TabsContent
					value="schedule"
					className="mt-0"
					id="schedule-content"
					role="tabpanel"
					aria-labelledby="schedule-tab">
					<div className="rounded-lg border p-4">
						<h3 className="text-lg font-medium">Schedule</h3>
						<p className="mt-2 text-sm text-muted-foreground">
							Manage your work schedule and availability.
						</p>
					</div>
				</TabsContent>
				<TabsContent
					value="preferences"
					className="mt-0"
					id="preferences-content"
					role="tabpanel"
					aria-labelledby="preferences-tab">
					<div className="rounded-lg border p-4">
						<h3 className="text-lg font-medium">Preferences</h3>
						<p className="mt-2 text-sm text-muted-foreground">
							Customize your application preferences and settings.
						</p>
					</div>
				</TabsContent>
			</div>
		</Tabs>
	),
};

// Mobile Optimized
export const MobileOptimized: Story = {
	render: () => (
		<Tabs
			defaultValue="overview"
			className="w-full max-w-[90vw] sm:max-w-none"
			role="tablist"
			aria-label="Mobile optimized tabs">
			<TabsList className="flex overflow-x-auto">
				<TabsTrigger
					value="overview"
					role="tab"
					aria-selected="true"
					aria-controls="overview-content"
					className="text-sm sm:text-base px-2 sm:px-3 py-1.5 sm:py-2">
					Overview
				</TabsTrigger>
				<TabsTrigger
					value="schedule"
					role="tab"
					aria-selected="false"
					aria-controls="schedule-content"
					className="text-sm sm:text-base px-2 sm:px-3 py-1.5 sm:py-2">
					Schedule
				</TabsTrigger>
				<TabsTrigger
					value="settings"
					role="tab"
					aria-selected="false"
					aria-controls="settings-content"
					className="text-sm sm:text-base px-2 sm:px-3 py-1.5 sm:py-2">
					Settings
				</TabsTrigger>
			</TabsList>
			<TabsContent
				value="overview"
				className="mt-4"
				id="overview-content"
				role="tabpanel"
				aria-labelledby="overview-tab">
				<div className="rounded-lg border p-4">
					<h3 className="text-lg font-medium">Overview</h3>
					<p className="mt-2 text-sm text-muted-foreground">
						This is the overview tab content optimized for mobile viewing.
					</p>
				</div>
			</TabsContent>
			<TabsContent
				value="schedule"
				className="mt-4"
				id="schedule-content"
				role="tabpanel"
				aria-labelledby="schedule-tab">
				<div className="rounded-lg border p-4">
					<h3 className="text-lg font-medium">Schedule</h3>
					<p className="mt-2 text-sm text-muted-foreground">
						This is the schedule tab content optimized for mobile viewing.
					</p>
				</div>
			</TabsContent>
			<TabsContent
				value="settings"
				className="mt-4"
				id="settings-content"
				role="tabpanel"
				aria-labelledby="settings-tab">
				<div className="rounded-lg border p-4">
					<h3 className="text-lg font-medium">Settings</h3>
					<p className="mt-2 text-sm text-muted-foreground">
						This is the settings tab content optimized for mobile viewing.
					</p>
				</div>
			</TabsContent>
		</Tabs>
	),
};

// With Loading State
export const WithLoadingState: Story = {
	render: () => (
		<Tabs
			defaultValue="overview"
			className="w-full"
			role="tablist"
			aria-label="Tabs with loading state">
			<TabsList>
				<TabsTrigger
					value="overview"
					role="tab"
					aria-selected="true"
					aria-controls="overview-content">
					Overview
				</TabsTrigger>
				<TabsTrigger
					value="data"
					role="tab"
					aria-selected="false"
					aria-controls="data-content">
					Data
				</TabsTrigger>
			</TabsList>
			<TabsContent
				value="overview"
				className="mt-4"
				id="overview-content"
				role="tabpanel"
				aria-labelledby="overview-tab">
				<div className="rounded-lg border p-4">
					<h3 className="text-lg font-medium">Overview</h3>
					<p className="mt-2 text-sm text-muted-foreground">
						This is the overview tab content.
					</p>
				</div>
			</TabsContent>
			<TabsContent
				value="data"
				className="mt-4"
				id="data-content"
				role="tabpanel"
				aria-labelledby="data-tab">
				<div className="rounded-lg border p-4 animate-pulse">
					<div className="h-6 bg-muted rounded w-1/3"></div>
					<div className="mt-2 h-4 bg-muted rounded w-3/4"></div>
					<div className="mt-2 h-4 bg-muted rounded w-1/2"></div>
				</div>
			</TabsContent>
		</Tabs>
	),
};

// With Dynamic Content
export const WithDynamicContent: Story = {
	render: () => (
		<Tabs
			defaultValue="tab1"
			className="w-full"
			role="tablist"
			aria-label="Tabs with dynamic content">
			<TabsList>
				<TabsTrigger
					value="tab1"
					role="tab"
					aria-selected="true"
					aria-controls="tab1-content">
					Tab 1
				</TabsTrigger>
				<TabsTrigger
					value="tab2"
					role="tab"
					aria-selected="false"
					aria-controls="tab2-content">
					Tab 2
				</TabsTrigger>
				<TabsTrigger
					value="tab3"
					role="tab"
					aria-selected="false"
					aria-controls="tab3-content">
					Tab 3
				</TabsTrigger>
			</TabsList>
			<TabsContent
				value="tab1"
				className="mt-4"
				id="tab1-content"
				role="tabpanel"
				aria-labelledby="tab1-tab">
				<div className="rounded-lg border p-4">
					<h3 className="text-lg font-medium">Dynamic Content 1</h3>
					<p className="mt-2 text-sm text-muted-foreground">
						This tab contains dynamic content that updates based on user
						interaction.
					</p>
				</div>
			</TabsContent>
			<TabsContent
				value="tab2"
				className="mt-4"
				id="tab2-content"
				role="tabpanel"
				aria-labelledby="tab2-tab">
				<div className="rounded-lg border p-4">
					<h3 className="text-lg font-medium">Dynamic Content 2</h3>
					<p className="mt-2 text-sm text-muted-foreground">
						This tab contains different dynamic content that updates based on
						user interaction.
					</p>
				</div>
			</TabsContent>
			<TabsContent
				value="tab3"
				className="mt-4"
				id="tab3-content"
				role="tabpanel"
				aria-labelledby="tab3-tab">
				<div className="rounded-lg border p-4">
					<h3 className="text-lg font-medium">Dynamic Content 3</h3>
					<p className="mt-2 text-sm text-muted-foreground">
						This tab contains more dynamic content that updates based on user
						interaction.
					</p>
				</div>
			</TabsContent>
		</Tabs>
	),
};
