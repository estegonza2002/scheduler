import type { Meta, StoryObj } from "@storybook/react";
import { ShiftCard } from "@/components/shifts/ShiftCard";
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
import {
	Clock,
	Calendar,
	MapPin,
	Users,
	CheckCircle2,
	AlertCircle,
} from "lucide-react";

const meta: Meta<typeof ShiftCard> = {
	title: "Components/Shifts/ShiftCard",
	component: ShiftCard,
	parameters: {
		layout: "centered",
		docs: {
			description: {
				component: `A card component for displaying shift information with advanced features.

## Accessibility
- Uses semantic HTML with proper ARIA roles and labels
- Supports keyboard navigation (Tab, Enter)
- Provides clear visual and text indicators for shift states
- Maintains sufficient color contrast for text and backgrounds
- Includes descriptive text for screen readers
- Uses appropriate ARIA landmarks and labels
- Supports screen reader announcements for shift changes
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
type Story = StoryObj<typeof ShiftCard>;

// Basic Examples
export const Default: Story = {
	render: () => (
		<ShiftCard
			shift={{
				id: "1",
				title: "Morning Shift",
				startTime: "09:00",
				endTime: "17:00",
				date: "2024-03-20",
				location: "Main Office",
				employees: [
					{
						id: "1",
						name: "John Smith",
						avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=John",
					},
					{
						id: "2",
						name: "Jane Doe",
						avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Jane",
					},
				],
				status: "scheduled",
				requiredEmployees: 3,
			}}
		/>
	),
};

// With Actions
export const WithActions: Story = {
	render: () => (
		<ShiftCard
			shift={{
				id: "1",
				title: "Morning Shift",
				startTime: "09:00",
				endTime: "17:00",
				date: "2024-03-20",
				location: "Main Office",
				employees: [
					{
						id: "1",
						name: "John Smith",
						avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=John",
					},
					{
						id: "2",
						name: "Jane Doe",
						avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Jane",
					},
				],
				status: "scheduled",
				requiredEmployees: 3,
			}}
			actions={
				<>
					<Button
						variant="outline"
						size="sm">
						Edit Shift
					</Button>
					<Button
						variant="outline"
						size="sm">
						View Details
					</Button>
				</>
			}
		/>
	),
};

// With Status Badge
export const WithStatusBadge: Story = {
	render: () => (
		<ShiftCard
			shift={{
				id: "1",
				title: "Morning Shift",
				startTime: "09:00",
				endTime: "17:00",
				date: "2024-03-20",
				location: "Main Office",
				employees: [
					{
						id: "1",
						name: "John Smith",
						avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=John",
					},
					{
						id: "2",
						name: "Jane Doe",
						avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Jane",
					},
				],
				status: "scheduled",
				requiredEmployees: 3,
			}}
			statusBadge={<Badge variant="success">Scheduled</Badge>}
		/>
	),
};

// With Custom Content
export const WithCustomContent: Story = {
	render: () => (
		<Card className="w-[350px]">
			<CardHeader>
				<div className="flex items-center justify-between">
					<div>
						<CardTitle>Morning Shift</CardTitle>
						<CardDescription>March 20, 2024</CardDescription>
					</div>
					<Badge variant="success">Scheduled</Badge>
				</div>
			</CardHeader>
			<CardContent>
				<div className="space-y-4">
					<div className="flex items-center gap-2">
						<Clock className="h-4 w-4 text-muted-foreground" />
						<span className="text-sm">09:00 - 17:00</span>
					</div>
					<div className="flex items-center gap-2">
						<MapPin className="h-4 w-4 text-muted-foreground" />
						<span className="text-sm">Main Office</span>
					</div>
					<div className="flex items-center gap-2">
						<Users className="h-4 w-4 text-muted-foreground" />
						<span className="text-sm">2/3 Employees Assigned</span>
					</div>
					<div className="flex items-center gap-2">
						<CheckCircle2 className="h-4 w-4 text-green-500" />
						<span className="text-sm">Fully Staffed</span>
					</div>
				</div>
				<div className="mt-4 flex -space-x-2">
					<Avatar>
						<AvatarImage
							src="https://api.dicebear.com/7.x/avataaars/svg?seed=John"
							alt="John Smith"
						/>
						<AvatarFallback>JS</AvatarFallback>
					</Avatar>
					<Avatar>
						<AvatarImage
							src="https://api.dicebear.com/7.x/avataaars/svg?seed=Jane"
							alt="Jane Doe"
						/>
						<AvatarFallback>JD</AvatarFallback>
					</Avatar>
				</div>
			</CardContent>
			<CardFooter className="flex justify-end gap-2">
				<Button
					variant="outline"
					size="sm">
					Edit Shift
				</Button>
				<Button
					variant="outline"
					size="sm">
					View Details
				</Button>
			</CardFooter>
		</Card>
	),
};

// Mobile Optimized
export const MobileOptimized: Story = {
	render: () => (
		<div className="w-full max-w-[90vw] sm:max-w-md mx-auto">
			<ShiftCard
				shift={{
					id: "1",
					title: "Morning Shift",
					startTime: "09:00",
					endTime: "17:00",
					date: "2024-03-20",
					location: "Main Office",
					employees: [
						{
							id: "1",
							name: "John Smith",
							avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=John",
						},
						{
							id: "2",
							name: "Jane Doe",
							avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Jane",
						},
					],
					status: "scheduled",
					requiredEmployees: 3,
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
				<div className="flex items-center justify-between">
					<div className="space-y-2">
						<div className="h-4 w-32 rounded bg-muted" />
						<div className="h-3 w-24 rounded bg-muted" />
					</div>
					<div className="h-5 w-20 rounded bg-muted" />
				</div>
			</CardHeader>
			<CardContent>
				<div className="space-y-4">
					<div className="h-4 w-full rounded bg-muted" />
					<div className="h-4 w-full rounded bg-muted" />
					<div className="h-4 w-full rounded bg-muted" />
					<div className="h-4 w-full rounded bg-muted" />
				</div>
				<div className="mt-4 flex gap-2">
					<div className="h-8 w-8 rounded-full bg-muted" />
					<div className="h-8 w-8 rounded-full bg-muted" />
				</div>
			</CardContent>
		</Card>
	),
};
