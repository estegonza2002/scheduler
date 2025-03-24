import type { Meta, StoryObj } from "@storybook/react";
import {
	Sidebar,
	SidebarProvider,
	SidebarHeader,
	SidebarContent,
	SidebarFooter,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
	LayoutDashboard,
	Users,
	Calendar,
	Settings,
	Search,
	Menu,
	X,
} from "lucide-react";

const meta: Meta<typeof Sidebar> = {
	title: "Components/Sidebar",
	component: Sidebar,
	parameters: {
		layout: "centered",
		docs: {
			description: {
				component: `A responsive sidebar component with collapsible and mobile support.

## Accessibility
- Uses semantic HTML with proper ARIA roles and labels
- Supports keyboard navigation (Tab, Arrow keys)
- Provides clear visual and text indicators for active states
- Maintains sufficient color contrast for text and backgrounds
- Includes descriptive text for screen readers
- Uses appropriate ARIA landmarks and labels
- Supports screen reader announcements for state changes
- Provides focus management for navigation
- Includes proper heading hierarchy
- Uses appropriate ARIA states for collapsed/expanded
- Supports touch targets for mobile devices
- Provides clear visual feedback for interactions
- Maintains focus trap when sidebar is open on mobile
- Supports escape key to close sidebar

## Performance
- Lightweight component with minimal dependencies
- Efficient rendering with proper React patterns
- Optimized for re-renders with proper prop types
- Minimal DOM footprint
- Memoized navigation items
- Efficient state management for collapse/expand
- Optimized animations and transitions
- Lazy loading of sidebar content
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
- Supports swipe gestures for opening/closing
- Adapts layout for small screens
- Handles orientation changes gracefully
- Provides mobile-specific interactions`,
			},
		},
	},
	tags: ["autodocs"],
	decorators: [
		(Story) => (
			<SidebarProvider>
				<div className="flex h-[600px]">
					<Story />
					<main className="flex-1 p-4">
						<h2 className="text-2xl font-bold">Main Content</h2>
						<p className="mt-4">
							This is the main content area. The sidebar can be toggled using
							the button in the sidebar header or with the keyboard shortcut
							(Cmd/Ctrl + B).
						</p>
					</main>
				</div>
			</SidebarProvider>
		),
	],
};

export default meta;
type Story = StoryObj<typeof Sidebar>;

const navigationItems = [
	{
		title: "Dashboard",
		href: "/dashboard",
		icon: <LayoutDashboard className="h-5 w-5" />,
		ariaLabel: "Navigate to Dashboard",
	},
	{
		title: "Employees",
		href: "/employees",
		icon: <Users className="h-5 w-5" />,
		ariaLabel: "Navigate to Employees",
	},
	{
		title: "Schedule",
		href: "/schedule",
		icon: <Calendar className="h-5 w-5" />,
		ariaLabel: "Navigate to Schedule",
	},
	{
		title: "Settings",
		href: "/settings",
		icon: <Settings className="h-5 w-5" />,
		ariaLabel: "Navigate to Settings",
	},
];

// Basic Examples
export const Default: Story = {
	render: () => (
		<Sidebar>
			<SidebarHeader>
				<div className="flex items-center justify-between px-4 py-2">
					<span className="text-lg font-semibold">Scheduler</span>
					<Button
						variant="ghost"
						size="icon"
						className="h-8 w-8"
						aria-label="Toggle sidebar">
						<Menu className="h-4 w-4" />
					</Button>
				</div>
				<Separator />
			</SidebarHeader>
			<SidebarContent>
				<nav
					className="space-y-1 px-2"
					role="navigation"
					aria-label="Main navigation">
					{navigationItems.map((item) => (
						<a
							key={item.title}
							href={item.href}
							className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
							aria-label={item.ariaLabel}>
							{item.icon}
							<span>{item.title}</span>
						</a>
					))}
				</nav>
			</SidebarContent>
			<SidebarFooter>
				<div className="p-4">
					<Input
						type="search"
						placeholder="Search..."
						className="h-8 w-full"
						aria-label="Search"
					/>
				</div>
			</SidebarFooter>
		</Sidebar>
	),
};

// Collapsible Example
export const Collapsible: Story = {
	render: () => (
		<Sidebar collapsible="icon">
			<SidebarHeader>
				<div className="flex items-center justify-between px-4 py-2">
					<span className="text-lg font-semibold">Scheduler</span>
					<Button
						variant="ghost"
						size="icon"
						className="h-8 w-8"
						aria-label="Toggle sidebar">
						<Menu className="h-4 w-4" />
					</Button>
				</div>
				<Separator />
			</SidebarHeader>
			<SidebarContent>
				<nav
					className="space-y-1 px-2"
					role="navigation"
					aria-label="Main navigation">
					{navigationItems.map((item) => (
						<a
							key={item.title}
							href={item.href}
							className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
							aria-label={item.ariaLabel}>
							{item.icon}
							<span>{item.title}</span>
						</a>
					))}
				</nav>
			</SidebarContent>
			<SidebarFooter>
				<div className="p-4">
					<Input
						type="search"
						placeholder="Search..."
						className="h-8 w-full"
						aria-label="Search"
					/>
				</div>
			</SidebarFooter>
		</Sidebar>
	),
};

// Mobile Optimized
export const MobileOptimized: Story = {
	render: () => (
		<Sidebar className="w-full max-w-[90vw] sm:max-w-none">
			<SidebarHeader>
				<div className="flex items-center justify-between px-4 py-2">
					<span className="text-lg font-semibold">Scheduler</span>
					<Button
						variant="ghost"
						size="icon"
						className="h-8 w-8"
						aria-label="Close sidebar">
						<X className="h-4 w-4" />
					</Button>
				</div>
				<Separator />
			</SidebarHeader>
			<SidebarContent>
				<nav
					className="space-y-1 px-2"
					role="navigation"
					aria-label="Main navigation">
					{navigationItems.map((item) => (
						<a
							key={item.title}
							href={item.href}
							className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-accent hover:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
							aria-label={item.ariaLabel}>
							{item.icon}
							<span>{item.title}</span>
						</a>
					))}
				</nav>
			</SidebarContent>
			<SidebarFooter>
				<div className="p-4">
					<Input
						type="search"
						placeholder="Search..."
						className="h-10 w-full text-base"
						aria-label="Search">
						<Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
					</Input>
				</div>
			</SidebarFooter>
		</Sidebar>
	),
};

// With Loading State
export const WithLoadingState: Story = {
	render: () => (
		<Sidebar>
			<SidebarHeader>
				<div className="flex items-center justify-between px-4 py-2">
					<div className="h-6 w-32 animate-pulse rounded bg-muted" />
					<Button
						variant="ghost"
						size="icon"
						className="h-8 w-8"
						aria-label="Toggle sidebar">
						<Menu className="h-4 w-4" />
					</Button>
				</div>
				<Separator />
			</SidebarHeader>
			<SidebarContent>
				<nav
					className="space-y-1 px-2"
					role="navigation"
					aria-label="Main navigation">
					{Array.from({ length: 4 }).map((_, i) => (
						<div
							key={i}
							className="flex items-center gap-3 rounded-lg px-3 py-2">
							<div className="h-5 w-5 animate-pulse rounded bg-muted" />
							<div className="h-4 w-24 animate-pulse rounded bg-muted" />
						</div>
					))}
				</nav>
			</SidebarContent>
			<SidebarFooter>
				<div className="p-4">
					<div className="h-8 w-full animate-pulse rounded bg-muted" />
				</div>
			</SidebarFooter>
		</Sidebar>
	),
};

// With Dynamic Content
export const WithDynamicContent: Story = {
	render: () => (
		<Sidebar>
			<SidebarHeader>
				<div className="flex items-center justify-between px-4 py-2">
					<span className="text-lg font-semibold">Scheduler</span>
					<Button
						variant="ghost"
						size="icon"
						className="h-8 w-8"
						aria-label="Toggle sidebar">
						<Menu className="h-4 w-4" />
					</Button>
				</div>
				<Separator />
			</SidebarHeader>
			<SidebarContent>
				<nav
					className="space-y-1 px-2"
					role="navigation"
					aria-label="Main navigation">
					{navigationItems.map((item) => (
						<a
							key={item.title}
							href={item.href}
							className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
							aria-label={item.ariaLabel}>
							{item.icon}
							<span>{item.title}</span>
						</a>
					))}
				</nav>
				<div className="mt-4 px-4">
					<h3 className="text-sm font-medium text-muted-foreground">
						Recent Activity
					</h3>
					<div className="mt-2 space-y-2">
						<div className="flex items-center gap-2 text-sm">
							<div className="h-2 w-2 rounded-full bg-green-500" />
							<span>New employee added</span>
						</div>
						<div className="flex items-center gap-2 text-sm">
							<div className="h-2 w-2 rounded-full bg-blue-500" />
							<span>Schedule updated</span>
						</div>
					</div>
				</div>
			</SidebarContent>
			<SidebarFooter>
				<div className="p-4">
					<Input
						type="search"
						placeholder="Search..."
						className="h-8 w-full"
						aria-label="Search">
						<Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
					</Input>
				</div>
			</SidebarFooter>
		</Sidebar>
	),
};
