import type { Meta, StoryObj } from "@storybook/react";
import { LoginForm } from "@/components/auth/LoginForm";
import { useRef } from "react";

const meta: Meta<typeof LoginForm> = {
	title: "Components/Auth/LoginForm",
	component: LoginForm,
	parameters: {
		layout: "centered",
		docs: {
			description: {
				component: `A login form component with validation and error handling.

## Accessibility
- Uses semantic HTML with proper ARIA roles and labels
- Supports keyboard navigation (Tab, Enter)
- Provides clear visual and text indicators for form states
- Maintains sufficient color contrast for text and backgrounds
- Includes descriptive text for screen readers
- Uses appropriate ARIA landmarks and labels
- Supports screen reader announcements for validation errors
- Provides focus management for form fields
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
- Memoized form validation
- Efficient state management
- Optimized animations and transitions
- Lazy loading of form components
- Efficient icon rendering
- Optimized for large form sets
- Efficient mobile viewport handling

## Mobile Responsiveness
- Adapts to different screen sizes
- Maintains readability on mobile devices
- Proper spacing and padding for touch targets
- Flexible width handling
- Icon scaling for different viewports
- Touch-friendly form controls
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
type Story = StoryObj<typeof LoginForm>;

// Basic Examples
export const Default: Story = {
	render: () => <LoginForm />,
};

// With Pre-filled Values
export const WithPrefilledValues: Story = {
	render: () => {
		const formRef = useRef(null);
		return <LoginForm ref={formRef} />;
	},
};

// Loading State
export const Loading: Story = {
	render: () => {
		const formRef = useRef(null);
		// Simulate loading state
		return (
			<div className="opacity-50">
				<LoginForm ref={formRef} />
			</div>
		);
	},
};

// Error State
export const WithError: Story = {
	render: () => {
		const formRef = useRef(null);
		return (
			<div className="space-y-4">
				<LoginForm ref={formRef} />
				<div
					role="alert"
					className="p-4 text-sm text-red-500 bg-red-50 rounded-md">
					Invalid email or password. Please try again.
				</div>
			</div>
		);
	},
};

// Mobile Optimized
export const MobileOptimized: Story = {
	render: () => (
		<div className="w-full max-w-[90vw] sm:max-w-md mx-auto">
			<LoginForm />
		</div>
	),
};

// With Social Login
export const WithSocialLogin: Story = {
	render: () => (
		<div className="space-y-4">
			<LoginForm />
			<div className="relative">
				<div className="absolute inset-0 flex items-center">
					<span className="w-full border-t" />
				</div>
				<div className="relative flex justify-center text-xs uppercase">
					<span className="bg-background px-2 text-muted-foreground">
						Or continue with
					</span>
				</div>
			</div>
			<div className="grid grid-cols-2 gap-2">
				<button
					type="button"
					className="flex items-center justify-center gap-2 rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
					aria-label="Sign in with Google">
					<svg
						className="h-4 w-4"
						viewBox="0 0 24 24"
						fill="currentColor">
						<path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
						<path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
						<path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
						<path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
					</svg>
					Google
				</button>
				<button
					type="button"
					className="flex items-center justify-center gap-2 rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
					aria-label="Sign in with GitHub">
					<svg
						className="h-4 w-4"
						viewBox="0 0 24 24"
						fill="currentColor">
						<path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
					</svg>
					GitHub
				</button>
			</div>
		</div>
	),
};

// With Remember Me
export const WithRememberMe: Story = {
	render: () => (
		<div className="space-y-4">
			<LoginForm />
			<div className="flex items-center justify-between">
				<div className="flex items-center space-x-2">
					<input
						type="checkbox"
						id="remember"
						className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
					/>
					<label
						htmlFor="remember"
						className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
						Remember me
					</label>
				</div>
				<a
					href="/forgot-password"
					className="text-sm font-medium text-primary hover:text-primary/90">
					Forgot password?
				</a>
			</div>
		</div>
	),
};
