import type { Meta, StoryObj } from "@storybook/react";
import { EmployeesPage } from "@/pages/employees/EmployeesPage";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, Filter, MoreVertical } from "lucide-react";

const meta: Meta<typeof EmployeesPage> = {
	title: "Pages/Employees/EmployeesPage",
	component: EmployeesPage,
	parameters: {
		layout: "fullscreen",
		docs: {
			description: {
				component: `A page component for managing employee information and details.

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
- Provides ARIA live regions for list updates
- Supports screen reader navigation of employee list
- Includes proper table semantics for data grids

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
- Virtual scrolling for large lists
- Efficient search and filter operations
- Optimized image loading with proper sizing

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
- Touch-friendly list items
- Mobile-optimized search experience`,
			},
		},
	},
	tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof EmployeesPage>;

// Basic Examples
export const Default: Story = {
	render: () => (
		<EmployeesPage
			title="Employees"
			description="Manage your team members and their information."
		/>
	),
};

// With Employee List
export const WithEmployeeList: Story = {
	render: () => (
		<div className="p-6 space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h2 className="text-3xl font-bold tracking-tight">Employees</h2>
					<p className="text-muted-foreground">
						Manage your team members and their information.
					</p>
				</div>
				<div className="flex items-center space-x-2">
					<Button variant="outline">
						<Filter className="mr-2 h-4 w-4" />
						Filter
					</Button>
					<Button>
						<Plus className="mr-2 h-4 w-4" />
						Add Employee
					</Button>
				</div>
			</div>
			<div className="relative">
				<Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
				<Input
					placeholder="Search employees..."
					className="pl-8"
				/>
			</div>
			<div className="grid gap-4">
				{[
					{
						name: "John Doe",
						email: "john@example.com",
						role: "Manager",
						department: "Engineering",
						status: "Active",
						avatar: "/avatars/01.png",
					},
					{
						name: "Jane Smith",
						email: "jane@example.com",
						role: "Developer",
						department: "Engineering",
						status: "Active",
						avatar: "/avatars/02.png",
					},
				].map((employee) => (
					<Card key={employee.email}>
						<CardContent className="flex items-center justify-between p-4">
							<div className="flex items-center space-x-4">
								<Avatar>
									<AvatarImage
										src={employee.avatar}
										alt={employee.name}
									/>
									<AvatarFallback>{employee.name.slice(0, 2)}</AvatarFallback>
								</Avatar>
								<div>
									<p className="font-medium">{employee.name}</p>
									<p className="text-sm text-muted-foreground">
										{employee.email}
									</p>
								</div>
							</div>
							<div className="flex items-center space-x-4">
								<Badge variant="outline">{employee.role}</Badge>
								<Button
									variant="ghost"
									size="icon">
									<MoreVertical className="h-4 w-4" />
								</Button>
							</div>
						</CardContent>
					</Card>
				))}
			</div>
		</div>
	),
};

// With Employee Details
export const WithEmployeeDetails: Story = {
	render: () => (
		<div className="p-6 space-y-6">
			<Card>
				<CardHeader>
					<div className="flex items-center space-x-4">
						<Avatar className="h-16 w-16">
							<AvatarImage
								src="/avatars/01.png"
								alt="John Doe"
							/>
							<AvatarFallback>JD</AvatarFallback>
						</Avatar>
						<div>
							<CardTitle>John Doe</CardTitle>
							<CardDescription>Manager, Engineering</CardDescription>
						</div>
					</div>
				</CardHeader>
				<CardContent>
					<div className="grid gap-4">
						<div>
							<h3 className="font-medium">Contact Information</h3>
							<p className="text-sm text-muted-foreground">john@example.com</p>
							<p className="text-sm text-muted-foreground">+1 (555) 123-4567</p>
						</div>
						<div>
							<h3 className="font-medium">Schedule</h3>
							<p className="text-sm text-muted-foreground">Monday - Friday</p>
							<p className="text-sm text-muted-foreground">9:00 AM - 5:00 PM</p>
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
					<h2 className="text-2xl font-bold tracking-tight">Employees</h2>
					<p className="text-sm text-muted-foreground">
						Manage your team members.
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
						<Plus className="mr-2 h-4 w-4" />
						Add
					</Button>
				</div>
			</div>
			<div className="relative">
				<Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
				<Input
					placeholder="Search..."
					className="pl-8"
				/>
			</div>
			<div className="space-y-4">
				{[
					{
						name: "John Doe",
						email: "john@example.com",
						role: "Manager",
						avatar: "/avatars/01.png",
					},
					{
						name: "Jane Smith",
						email: "jane@example.com",
						role: "Developer",
						avatar: "/avatars/02.png",
					},
				].map((employee) => (
					<Card key={employee.email}>
						<CardContent className="flex items-center justify-between p-3">
							<div className="flex items-center space-x-3">
								<Avatar>
									<AvatarImage
										src={employee.avatar}
										alt={employee.name}
									/>
									<AvatarFallback>{employee.name.slice(0, 2)}</AvatarFallback>
								</Avatar>
								<div>
									<p className="text-sm font-medium">{employee.name}</p>
									<p className="text-xs text-muted-foreground">
										{employee.role}
									</p>
								</div>
							</div>
							<Button
								variant="ghost"
								size="icon">
								<MoreVertical className="h-4 w-4" />
							</Button>
						</CardContent>
					</Card>
				))}
			</div>
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
			<div className="h-10 w-full rounded bg-muted" />
			<div className="space-y-4">
				{[...Array(3)].map((_, i) => (
					<Card key={i}>
						<CardContent className="flex items-center justify-between p-4">
							<div className="flex items-center space-x-4">
								<div className="h-10 w-10 rounded-full bg-muted" />
								<div className="space-y-2">
									<div className="h-4 w-32 rounded bg-muted" />
									<div className="h-3 w-48 rounded bg-muted" />
								</div>
							</div>
							<div className="h-8 w-8 rounded bg-muted" />
						</CardContent>
					</Card>
				))}
			</div>
		</div>
	),
};
