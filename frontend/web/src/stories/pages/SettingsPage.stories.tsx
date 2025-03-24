import type { Meta, StoryObj } from "@storybook/react";
import { SettingsPage } from "@/pages/settings/SettingsPage";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Bell, Lock, Globe, User, Mail, Shield } from "lucide-react";

const meta: Meta<typeof SettingsPage> = {
	title: "Pages/Settings/SettingsPage",
	component: SettingsPage,
	parameters: {
		layout: "fullscreen",
		docs: {
			description: {
				component: `A settings page component for managing user preferences and account settings.

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
- Provides ARIA live regions for settings updates
- Supports screen reader navigation of settings sections
- Includes proper form validation feedback

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
- Optimized form handling
- Efficient settings persistence
- Optimized validation logic

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
- Touch-friendly form controls
- Mobile-optimized settings navigation`,
			},
		},
	},
	tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof SettingsPage>;

// Basic Examples
export const Default: Story = {
	render: () => (
		<SettingsPage
			title="Settings"
			description="Manage your account settings and preferences."
		/>
	),
};

// With Profile Settings
export const WithProfileSettings: Story = {
	render: () => (
		<div className="p-6 space-y-6">
			<div>
				<h2 className="text-3xl font-bold tracking-tight">Settings</h2>
				<p className="text-muted-foreground">
					Manage your account settings and preferences.
				</p>
			</div>
			<Card>
				<CardHeader>
					<CardTitle>Profile Settings</CardTitle>
					<CardDescription>Update your personal information.</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="grid gap-4">
						<div className="grid gap-2">
							<Label htmlFor="name">Name</Label>
							<Input
								id="name"
								defaultValue="John Doe"
							/>
						</div>
						<div className="grid gap-2">
							<Label htmlFor="email">Email</Label>
							<Input
								id="email"
								type="email"
								defaultValue="john@example.com"
							/>
						</div>
					</div>
					<Button>Save Changes</Button>
				</CardContent>
			</Card>
		</div>
	),
};

// With Security Settings
export const WithSecuritySettings: Story = {
	render: () => (
		<div className="p-6 space-y-6">
			<Card>
				<CardHeader>
					<CardTitle>Security Settings</CardTitle>
					<CardDescription>Manage your account security.</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="flex items-center justify-between">
						<div className="space-y-0.5">
							<Label>Two-Factor Authentication</Label>
							<p className="text-sm text-muted-foreground">
								Add an extra layer of security to your account.
							</p>
						</div>
						<Switch />
					</div>
					<Separator />
					<div className="flex items-center justify-between">
						<div className="space-y-0.5">
							<Label>Email Notifications</Label>
							<p className="text-sm text-muted-foreground">
								Receive notifications about account activity.
							</p>
						</div>
						<Switch />
					</div>
				</CardContent>
			</Card>
		</div>
	),
};

// With Notification Settings
export const WithNotificationSettings: Story = {
	render: () => (
		<div className="p-6 space-y-6">
			<Card>
				<CardHeader>
					<CardTitle>Notification Settings</CardTitle>
					<CardDescription>
						Configure how you receive notifications.
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="flex items-center justify-between">
						<div className="space-y-0.5">
							<Label>Push Notifications</Label>
							<p className="text-sm text-muted-foreground">
								Receive push notifications on your devices.
							</p>
						</div>
						<Switch />
					</div>
					<Separator />
					<div className="flex items-center justify-between">
						<div className="space-y-0.5">
							<Label>Email Notifications</Label>
							<p className="text-sm text-muted-foreground">
								Receive notifications via email.
							</p>
						</div>
						<Switch />
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
			<div>
				<h2 className="text-2xl font-bold tracking-tight">Settings</h2>
				<p className="text-sm text-muted-foreground">
					Manage your account settings.
				</p>
			</div>
			<Card>
				<CardHeader>
					<CardTitle>Profile</CardTitle>
					<CardDescription>Update your information.</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="grid gap-4">
						<div className="grid gap-2">
							<Label htmlFor="name">Name</Label>
							<Input
								id="name"
								defaultValue="John Doe"
							/>
						</div>
						<div className="grid gap-2">
							<Label htmlFor="email">Email</Label>
							<Input
								id="email"
								type="email"
								defaultValue="john@example.com"
							/>
						</div>
					</div>
					<Button className="w-full">Save Changes</Button>
				</CardContent>
			</Card>
		</div>
	),
};

// With Loading State
export const WithLoadingState: Story = {
	render: () => (
		<div className="p-6 space-y-6 animate-pulse">
			<div className="space-y-2">
				<div className="h-8 w-32 rounded bg-muted" />
				<div className="h-4 w-48 rounded bg-muted" />
			</div>
			<Card>
				<CardHeader>
					<div className="space-y-2">
						<div className="h-6 w-32 rounded bg-muted" />
						<div className="h-4 w-48 rounded bg-muted" />
					</div>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="grid gap-4">
						<div className="space-y-2">
							<div className="h-4 w-16 rounded bg-muted" />
							<div className="h-10 w-full rounded bg-muted" />
						</div>
						<div className="space-y-2">
							<div className="h-4 w-16 rounded bg-muted" />
							<div className="h-10 w-full rounded bg-muted" />
						</div>
					</div>
					<div className="h-10 w-24 rounded bg-muted" />
				</CardContent>
			</Card>
		</div>
	),
};
