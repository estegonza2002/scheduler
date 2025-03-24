import type { Meta, StoryObj } from "@storybook/react";
import { LoginPage } from "@/pages/auth/LoginPage";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Github, Mail } from "lucide-react";

const meta: Meta<typeof LoginPage> = {
	title: "Pages/Auth/LoginPage",
	component: LoginPage,
	parameters: {
		layout: "centered",
		docs: {
			description: {
				component: `A login page component with advanced features and social authentication.

## Accessibility
- Uses semantic HTML with proper ARIA roles and labels
- Supports keyboard navigation (Tab, Enter)
- Provides clear visual and text indicators for form states
- Maintains sufficient color contrast for text and backgrounds
- Includes descriptive text for screen readers
- Uses appropriate ARIA landmarks and labels
- Supports screen reader announcements for form changes
- Provides focus management for form inputs
- Includes proper heading hierarchy
- Uses appropriate ARIA states for form validation
- Supports touch targets for mobile devices
- Provides clear visual feedback for interactions
- Maintains focus trap when modal is open
- Supports escape key to close modal

## Performance
- Lightweight component with minimal dependencies
- Efficient rendering with proper React patterns
- Optimized for re-renders with proper prop types
- Minimal DOM footprint
- Efficient state management
- Optimized animations and transitions
- Efficient icon rendering
- Optimized for form validation
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
type Story = StoryObj<typeof LoginPage>;

// Basic Examples
export const Default: Story = {
	render: () => (
		<LoginPage
			title="Welcome back"
			description="Enter your credentials to access your account."
		/>
	),
};

// With Social Login
export const WithSocialLogin: Story = {
	render: () => (
		<Card className="w-[350px]">
			<CardHeader>
				<CardTitle>Welcome back</CardTitle>
				<CardDescription>
					Enter your credentials to access your account.
				</CardDescription>
			</CardHeader>
			<CardContent>
				<div className="grid gap-4">
					<div className="grid gap-2">
						<Label htmlFor="email">Email</Label>
						<Input
							id="email"
							type="email"
							placeholder="name@example.com"
						/>
					</div>
					<div className="grid gap-2">
						<Label htmlFor="password">Password</Label>
						<Input
							id="password"
							type="password"
						/>
					</div>
					<div className="flex items-center space-x-2">
						<Checkbox id="remember" />
						<Label htmlFor="remember">Remember me</Label>
					</div>
					<Button>Sign in</Button>
					<div className="relative">
						<div className="absolute inset-0 flex items-center">
							<Separator />
						</div>
						<div className="relative flex justify-center text-xs uppercase">
							<span className="bg-background px-2 text-muted-foreground">
								Or continue with
							</span>
						</div>
					</div>
					<div className="grid grid-cols-2 gap-4">
						<Button variant="outline">
							<Github className="mr-2 h-4 w-4" />
							Github
						</Button>
						<Button variant="outline">
							<Mail className="mr-2 h-4 w-4" />
							Google
						</Button>
					</div>
				</div>
			</CardContent>
			<CardFooter className="flex flex-col gap-4">
				<div className="text-sm text-muted-foreground">
					Don't have an account?{" "}
					<a
						href="#"
						className="text-primary hover:underline">
						Sign up
					</a>
				</div>
				<a
					href="#"
					className="text-sm text-primary hover:underline">
					Forgot your password?
				</a>
			</CardFooter>
		</Card>
	),
};

// With Error State
export const WithErrorState: Story = {
	render: () => (
		<Card className="w-[350px]">
			<CardHeader>
				<CardTitle>Welcome back</CardTitle>
				<CardDescription>
					Enter your credentials to access your account.
				</CardDescription>
			</CardHeader>
			<CardContent>
				<div className="grid gap-4">
					<div className="grid gap-2">
						<Label htmlFor="email">Email</Label>
						<Input
							id="email"
							type="email"
							placeholder="name@example.com"
						/>
					</div>
					<div className="grid gap-2">
						<Label htmlFor="password">Password</Label>
						<Input
							id="password"
							type="password"
						/>
					</div>
					<div className="text-sm text-destructive">
						Invalid email or password. Please try again.
					</div>
					<Button>Sign in</Button>
				</div>
			</CardContent>
		</Card>
	),
};

// Mobile Optimized
export const MobileOptimized: Story = {
	render: () => (
		<div className="w-full max-w-[90vw] sm:max-w-md mx-auto">
			<Card>
				<CardHeader>
					<CardTitle>Welcome back</CardTitle>
					<CardDescription>
						Enter your credentials to access your account.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="grid gap-4">
						<div className="grid gap-2">
							<Label htmlFor="email">Email</Label>
							<Input
								id="email"
								type="email"
								placeholder="name@example.com"
							/>
						</div>
						<div className="grid gap-2">
							<Label htmlFor="password">Password</Label>
							<Input
								id="password"
								type="password"
							/>
						</div>
						<Button>Sign in</Button>
					</div>
				</CardContent>
			</Card>
		</div>
	),
};

// With Loading State
export const WithLoadingState: Story = {
	render: () => (
		<Card className="w-[350px] animate-pulse">
			<CardHeader>
				<div className="space-y-2">
					<div className="h-6 w-32 rounded bg-muted" />
					<div className="h-4 w-48 rounded bg-muted" />
				</div>
			</CardHeader>
			<CardContent>
				<div className="space-y-4">
					<div className="space-y-2">
						<div className="h-4 w-16 rounded bg-muted" />
						<div className="h-10 w-full rounded bg-muted" />
					</div>
					<div className="space-y-2">
						<div className="h-4 w-20 rounded bg-muted" />
						<div className="h-10 w-full rounded bg-muted" />
					</div>
					<div className="h-10 w-full rounded bg-muted" />
				</div>
			</CardContent>
		</Card>
	),
};
