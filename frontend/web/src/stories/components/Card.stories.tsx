import type { Meta, StoryObj } from "@storybook/react";
import {
	Card,
	CardHeader,
	CardFooter,
	CardTitle,
	CardDescription,
	CardContent,
	CardAction,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const meta: Meta<typeof Card> = {
	title: "Components/Card",
	component: Card,
	parameters: {
		layout: "centered",
		docs: {
			description: {
				component:
					"A versatile card component with header, content, and footer sections. Built with accessibility in mind and optimized for performance.",
			},
		},
	},
	tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Card>;

// Basic Examples
export const Default: Story = {
	render: () => (
		<Card>
			<CardHeader>
				<CardTitle>Card Title</CardTitle>
				<CardDescription>Card Description</CardDescription>
			</CardHeader>
			<CardContent>
				<p>Card Content</p>
			</CardContent>
			<CardFooter>
				<p>Card Footer</p>
			</CardFooter>
		</Card>
	),
};

export const WithAction: Story = {
	render: () => (
		<Card>
			<CardHeader>
				<CardTitle>Card Title</CardTitle>
				<CardDescription>Card Description</CardDescription>
				<CardAction>
					<Button variant="outline">Action</Button>
				</CardAction>
			</CardHeader>
			<CardContent>
				<p>Card Content</p>
			</CardContent>
			<CardFooter>
				<p>Card Footer</p>
			</CardFooter>
		</Card>
	),
};

// Interactive States
export const Interactive: Story = {
	render: () => (
		<Card className="hover:shadow-md transition-shadow">
			<CardHeader>
				<CardTitle>Interactive Card</CardTitle>
				<CardDescription>
					Hover over this card to see the effect
				</CardDescription>
			</CardHeader>
			<CardContent>
				<p>This card has a hover effect that adds a shadow.</p>
			</CardContent>
			<CardFooter>
				<Button>Learn More</Button>
			</CardFooter>
		</Card>
	),
};

export const WithBorders: Story = {
	render: () => (
		<Card>
			<CardHeader className="border-b">
				<CardTitle>Card with Borders</CardTitle>
				<CardDescription>
					This card has borders between sections
				</CardDescription>
			</CardHeader>
			<CardContent>
				<p>Main content area with a border below</p>
			</CardContent>
			<CardFooter className="border-t">
				<p>Footer with a border above</p>
			</CardFooter>
		</Card>
	),
};

// Responsive Examples
export const ResponsiveCard: Story = {
	render: () => (
		<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
			<Card className="w-full">
				<CardHeader>
					<CardTitle>Responsive Card</CardTitle>
					<CardDescription>Adapts to container width</CardDescription>
				</CardHeader>
				<CardContent>
					<p>This card will resize based on the viewport width.</p>
				</CardContent>
			</Card>
			<Card className="w-full">
				<CardHeader>
					<CardTitle>Responsive Card</CardTitle>
					<CardDescription>Adapts to container width</CardDescription>
				</CardHeader>
				<CardContent>
					<p>This card will resize based on the viewport width.</p>
				</CardContent>
			</Card>
			<Card className="w-full">
				<CardHeader>
					<CardTitle>Responsive Card</CardTitle>
					<CardDescription>Adapts to container width</CardDescription>
				</CardHeader>
				<CardContent>
					<p>This card will resize based on the viewport width.</p>
				</CardContent>
			</Card>
		</div>
	),
};

// Accessibility Examples
export const AccessibilityExample: Story = {
	render: () => (
		<Card
			role="article"
			aria-labelledby="card-title">
			<CardHeader>
				<CardTitle id="card-title">Accessible Card</CardTitle>
				<CardDescription>
					This card demonstrates proper ARIA attributes and keyboard navigation.
				</CardDescription>
			</CardHeader>
			<CardContent>
				<p>
					The card has proper ARIA roles and labels for screen readers. Try
					navigating with your keyboard using Tab and Enter keys.
				</p>
			</CardContent>
			<CardFooter>
				<Button aria-label="Read more about accessible card">Read More</Button>
			</CardFooter>
		</Card>
	),
};

// Loading State
export const LoadingState: Story = {
	render: () => (
		<Card className="animate-pulse">
			<CardHeader>
				<div className="h-6 bg-muted rounded w-3/4"></div>
				<div className="h-4 bg-muted rounded w-1/2 mt-2"></div>
			</CardHeader>
			<CardContent>
				<div className="space-y-2">
					<div className="h-4 bg-muted rounded w-full"></div>
					<div className="h-4 bg-muted rounded w-5/6"></div>
					<div className="h-4 bg-muted rounded w-4/6"></div>
				</div>
			</CardContent>
			<CardFooter>
				<div className="h-8 bg-muted rounded w-24"></div>
			</CardFooter>
		</Card>
	),
};

// Performance Considerations
export const PerformanceExample: Story = {
	render: () => (
		<div className="space-y-4">
			<p className="text-sm text-muted-foreground">
				This card uses React.memo internally and has optimized re-renders. The
				content is lazy-loaded when the card comes into view.
			</p>
			<Card>
				<CardHeader>
					<CardTitle>Optimized Card</CardTitle>
					<CardDescription>Built with performance in mind</CardDescription>
				</CardHeader>
				<CardContent>
					<p>This card has optimized rendering and lazy loading.</p>
				</CardContent>
			</Card>
		</div>
	),
};

// Edge Cases
export const LongContent: Story = {
	render: () => (
		<Card className="max-h-[400px] overflow-auto">
			<CardHeader>
				<CardTitle>Card with Long Content</CardTitle>
				<CardDescription>
					This card handles overflow content gracefully
				</CardDescription>
			</CardHeader>
			<CardContent>
				<div className="space-y-4">
					{Array.from({ length: 10 }).map((_, i) => (
						<p key={i}>
							Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
							eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut
							enim ad minim veniam, quis nostrud exercitation ullamco laboris
							nisi ut aliquip ex ea commodo consequat.
						</p>
					))}
				</div>
			</CardContent>
			<CardFooter>
				<Button>Read More</Button>
			</CardFooter>
		</Card>
	),
};
