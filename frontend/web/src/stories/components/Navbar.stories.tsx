import type { Meta, StoryObj } from "@storybook/react";
import { Navbar } from "@/components/ui/navbar";
import { Button } from "@/components/ui/button";
import { User, Bell, Menu, X } from "lucide-react";

const meta: Meta<typeof Navbar> = {
	title: "Components/Navbar",
	component: Navbar,
	parameters: {
		layout: "centered",
		docs: {
			description: {
				component: `A responsive navigation bar component with desktop and mobile versions.

## Accessibility
- Uses semantic HTML with proper ARIA roles and labels
- Supports keyboard navigation (Tab, Arrow keys)
- Provides clear visual and text indicators for active states
- Maintains sufficient color contrast for text and backgrounds
- Includes descriptive text for screen readers
- Uses appropriate ARIA landmarks and labels
- Supports screen reader announcements for navigation
- Provides focus management for dropdowns
- Includes proper heading hierarchy
- Uses appropriate ARIA states for expanded/collapsed
- Supports touch targets for mobile devices
- Provides clear visual feedback for interactions
- Maintains focus trap when mobile menu is open
- Supports escape key to close mobile menu

## Performance
- Lightweight component with minimal dependencies
- Efficient rendering with proper React patterns
- Optimized for re-renders with proper prop types
- Minimal DOM footprint
- Memoized navigation items
- Efficient state management for mobile menu
- Optimized animations and transitions
- Lazy loading of dropdown content
- Efficient icon rendering
- Optimized for large navigation sets
- Efficient mobile viewport handling

## Mobile Responsiveness
- Adapts to different screen sizes
- Maintains readability on mobile devices
- Proper spacing and padding for touch targets
- Flexible width handling
- Icon scaling for different viewports
- Touch-friendly navigation
- Responsive typography
- Proper spacing in mobile layouts
- Optimized for touch interactions
- Supports swipe gestures for mobile menu
- Adapts layout for small screens
- Handles orientation changes gracefully
- Provides mobile-specific interactions`,
			},
		},
	},
	tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Navbar>;

const navigationItems = [
	{
		title: "Dashboard",
		href: "/dashboard",
		ariaLabel: "Navigate to Dashboard",
	},
	{
		title: "Employees",
		href: "/employees",
		ariaLabel: "Navigate to Employees",
		items: [
			{
				title: "All Employees",
				href: "/employees",
				description: "View and manage all employees",
				ariaLabel: "View all employees",
			},
			{
				title: "Add Employee",
				href: "/employees/add",
				description: "Add a new employee to the system",
				ariaLabel: "Add new employee",
			},
			{
				title: "Departments",
				href: "/employees/departments",
				description: "Manage employee departments",
				ariaLabel: "Manage departments",
			},
		],
	},
	{
		title: "Schedule",
		href: "/schedule",
		ariaLabel: "Navigate to Schedule",
		items: [
			{
				title: "Calendar",
				href: "/schedule/calendar",
				description: "View and manage schedules in calendar view",
				ariaLabel: "View schedule calendar",
			},
			{
				title: "Shifts",
				href: "/schedule/shifts",
				description: "Manage individual shifts",
				ariaLabel: "Manage shifts",
			},
			{
				title: "Templates",
				href: "/schedule/templates",
				description: "Create and manage schedule templates",
				ariaLabel: "Manage schedule templates",
			},
		],
	},
	{
		title: "Settings",
		href: "/settings",
		ariaLabel: "Navigate to Settings",
	},
];

// Basic Examples
export const Default: Story = {
	render: () => (
		<Navbar
			items={navigationItems}
			logo={<span className="text-xl font-bold">Scheduler</span>}
			actions={
				<div className="flex items-center gap-2">
					<Button
						variant="ghost"
						aria-label="Sign in">
						Sign In
					</Button>
					<Button aria-label="Sign up">Sign Up</Button>
				</div>
			}
		/>
	),
};

// Mobile Optimized
export const MobileOptimized: Story = {
	render: () => (
		<Navbar
			items={navigationItems}
			logo={<span className="text-xl font-bold">Scheduler</span>}
			actions={
				<div className="flex items-center gap-2">
					<Button
						variant="ghost"
						size="icon"
						className="h-8 w-8"
						aria-label="Toggle notifications">
						<Bell className="h-4 w-4" />
					</Button>
					<Button
						variant="ghost"
						size="icon"
						className="h-8 w-8"
						aria-label="Toggle user menu">
						<User className="h-4 w-4" />
					</Button>
				</div>
			}
			className="w-full max-w-[90vw] sm:max-w-none"
		/>
	),
};

// With Dropdowns
export const WithDropdowns: Story = {
	render: () => (
		<Navbar
			items={navigationItems}
			logo={<span className="text-xl font-bold">Scheduler</span>}
			actions={
				<div className="flex items-center gap-2">
					<Button
						variant="ghost"
						aria-label="Sign in">
						Sign In
					</Button>
					<Button aria-label="Sign up">Sign Up</Button>
				</div>
			}
			ariaLabel="Main navigation"
		/>
	),
};

// With User Menu
export const WithUserMenu: Story = {
	render: () => (
		<Navbar
			items={navigationItems}
			logo={<span className="text-xl font-bold">Scheduler</span>}
			actions={
				<div className="flex items-center gap-2">
					<Button
						variant="ghost"
						size="icon"
						className="h-8 w-8"
						aria-label="Toggle user menu">
						<User className="h-4 w-4" />
					</Button>
				</div>
			}
		/>
	),
};

// Loading State
export const Loading: Story = {
	render: () => (
		<Navbar
			items={navigationItems}
			logo={<div className="h-6 w-32 animate-pulse rounded bg-muted" />}
			actions={
				<div className="flex items-center gap-2">
					<div className="h-8 w-20 animate-pulse rounded bg-muted" />
				</div>
			}
		/>
	),
};

// With Notifications
export const WithNotifications: Story = {
	render: () => (
		<Navbar
			items={navigationItems}
			logo={<span className="text-xl font-bold">Scheduler</span>}
			actions={
				<div className="flex items-center gap-2">
					<Button
						variant="ghost"
						size="icon"
						className="h-8 w-8 relative"
						aria-label="View notifications">
						<Bell className="h-4 w-4" />
						<span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-xs text-white flex items-center justify-center">
							3
						</span>
					</Button>
					<Button
						variant="ghost"
						size="icon"
						className="h-8 w-8"
						aria-label="Toggle user menu">
						<User className="h-4 w-4" />
					</Button>
				</div>
			}
		/>
	),
};
