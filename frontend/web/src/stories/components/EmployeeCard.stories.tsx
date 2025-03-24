import type { Meta, StoryObj } from "@storybook/react";
import { EmployeeCard } from "@/components/employees/EmployeeCard";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Phone, Mail, Calendar, Clock, MapPin, Building2 } from "lucide-react";

const meta: Meta<typeof EmployeeCard> = {
	title: "Components/Employees/EmployeeCard",
	component: EmployeeCard,
	parameters: {
		layout: "centered",
		docs: {
			description: {
				component: `A card component for displaying employee information with advanced features.

## Accessibility
- Uses semantic HTML with proper ARIA roles and labels
- Supports keyboard navigation (Tab, Enter)
- Provides clear visual and text indicators for card states
- Maintains sufficient color contrast for text and backgrounds
- Includes descriptive text for screen readers
- Uses appropriate ARIA landmarks and labels
- Supports screen reader announcements for card interactions
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
- Lazy loading of images
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
type Story = StoryObj<typeof EmployeeCard>;

// Basic Examples
export const Default: Story = {
	render: () => (
		<EmployeeCard
			employee={{
				id: "1",
				name: "John Smith",
				email: "john.smith@example.com",
				phone: "+1 (555) 123-4567",
				position: "Senior Software Engineer",
				department: "Engineering",
				location: "San Francisco, CA",
				avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=John",
				status: "active",
				shift: "Morning",
				startDate: "2023-01-15",
			}}
		/>
	),
};

// With Actions
export const WithActions: Story = {
	render: () => (
		<EmployeeCard
			employee={{
				id: "1",
				name: "John Smith",
				email: "john.smith@example.com",
				phone: "+1 (555) 123-4567",
				position: "Senior Software Engineer",
				department: "Engineering",
				location: "San Francisco, CA",
				avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=John",
				status: "active",
				shift: "Morning",
				startDate: "2023-01-15",
			}}
			actions={
				<>
					<Button
						variant="outline"
						size="sm">
						View Profile
					</Button>
					<Button
						variant="outline"
						size="sm">
						Edit
					</Button>
				</>
			}
		/>
	),
};

// With Status Badge
export const WithStatusBadge: Story = {
	render: () => (
		<EmployeeCard
			employee={{
				id: "1",
				name: "John Smith",
				email: "john.smith@example.com",
				phone: "+1 (555) 123-4567",
				position: "Senior Software Engineer",
				department: "Engineering",
				location: "San Francisco, CA",
				avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=John",
				status: "active",
				shift: "Morning",
				startDate: "2023-01-15",
			}}
			statusBadge={<Badge variant="success">Active</Badge>}
		/>
	),
};

// With Custom Content
export const WithCustomContent: Story = {
	render: () => (
		<Card className="w-[350px]">
			<CardHeader>
				<div className="flex items-center gap-4">
					<Avatar>
						<AvatarImage
							src="https://api.dicebear.com/7.x/avataaars/svg?seed=John"
							alt="John Smith"
						/>
						<AvatarFallback>JS</AvatarFallback>
					</Avatar>
					<div>
						<CardTitle>John Smith</CardTitle>
						<CardDescription>Senior Software Engineer</CardDescription>
					</div>
				</div>
			</CardHeader>
			<CardContent>
				<div className="space-y-2">
					<div className="flex items-center gap-2">
						<Mail className="h-4 w-4 text-muted-foreground" />
						<span className="text-sm">john.smith@example.com</span>
					</div>
					<div className="flex items-center gap-2">
						<Phone className="h-4 w-4 text-muted-foreground" />
						<span className="text-sm">+1 (555) 123-4567</span>
					</div>
					<div className="flex items-center gap-2">
						<Building2 className="h-4 w-4 text-muted-foreground" />
						<span className="text-sm">Engineering</span>
					</div>
					<div className="flex items-center gap-2">
						<MapPin className="h-4 w-4 text-muted-foreground" />
						<span className="text-sm">San Francisco, CA</span>
					</div>
					<div className="flex items-center gap-2">
						<Clock className="h-4 w-4 text-muted-foreground" />
						<span className="text-sm">Morning Shift</span>
					</div>
					<div className="flex items-center gap-2">
						<Calendar className="h-4 w-4 text-muted-foreground" />
						<span className="text-sm">Started Jan 15, 2023</span>
					</div>
				</div>
			</CardContent>
			<CardFooter className="flex justify-end gap-2">
				<Button
					variant="outline"
					size="sm">
					View Profile
				</Button>
				<Button
					variant="outline"
					size="sm">
					Edit
				</Button>
			</CardFooter>
		</Card>
	),
};

// Mobile Optimized
export const MobileOptimized: Story = {
	render: () => (
		<div className="w-full max-w-[90vw] sm:max-w-md mx-auto">
			<EmployeeCard
				employee={{
					id: "1",
					name: "John Smith",
					email: "john.smith@example.com",
					phone: "+1 (555) 123-4567",
					position: "Senior Software Engineer",
					department: "Engineering",
					location: "San Francisco, CA",
					avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=John",
					status: "active",
					shift: "Morning",
					startDate: "2023-01-15",
				}}
			/>
		</div>
	),
};

// With Loading State
export const WithLoadingState: Story = {
	render: () => (
		<Card className="w-[350px] animate-pulse">
			<CardHeader>
				<div className="flex items-center gap-4">
					<div className="h-12 w-12 rounded-full bg-muted" />
					<div className="space-y-2">
						<div className="h-4 w-32 rounded bg-muted" />
						<div className="h-3 w-24 rounded bg-muted" />
					</div>
				</div>
			</CardHeader>
			<CardContent>
				<div className="space-y-2">
					<div className="h-4 w-full rounded bg-muted" />
					<div className="h-4 w-full rounded bg-muted" />
					<div className="h-4 w-full rounded bg-muted" />
					<div className="h-4 w-full rounded bg-muted" />
				</div>
			</CardContent>
		</Card>
	),
};
