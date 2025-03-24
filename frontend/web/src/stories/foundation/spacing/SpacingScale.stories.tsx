import type { Meta, StoryObj } from "@storybook/react";

const meta: Meta = {
	title: "Foundation/Spacing/SpacingScale",
	parameters: {
		layout: "padded",
		docs: {
			description: {
				component:
					"Our spacing system provides a consistent scale for margins, padding, and gaps throughout the application. This ensures visual rhythm and proper content hierarchy.",
			},
		},
	},
	tags: ["autodocs"],
};

export default meta;
type Story = StoryObj;

const SpacingSwatch = ({
	size,
	value,
	description,
}: {
	size: string;
	value: string;
	description: string;
}) => (
	<div className="flex items-center space-x-4 p-4 border rounded-lg">
		<div className="flex items-center justify-center w-16 h-16 bg-muted rounded-md">
			<span className="text-sm font-mono">{size}</span>
		</div>
		<div>
			<h3 className="font-medium">{value}</h3>
			<p className="text-sm text-muted-foreground">{description}</p>
		</div>
	</div>
);

export const SpacingScale: Story = {
	render: () => (
		<div className="space-y-4">
			<h2 className="text-2xl font-semibold">Spacing Scale</h2>
			<div className="space-y-2">
				<SpacingSwatch
					size="0"
					value="0px"
					description="No spacing"
				/>
				<SpacingSwatch
					size="1"
					value="0.25rem (4px)"
					description="Tight spacing for icons and small elements"
				/>
				<SpacingSwatch
					size="2"
					value="0.5rem (8px)"
					description="Small spacing for compact layouts"
				/>
				<SpacingSwatch
					size="3"
					value="0.75rem (12px)"
					description="Standard spacing for most UI elements"
				/>
				<SpacingSwatch
					size="4"
					value="1rem (16px)"
					description="Base spacing unit, used for standard gaps"
				/>
				<SpacingSwatch
					size="5"
					value="1.25rem (20px)"
					description="Slightly larger spacing for emphasis"
				/>
				<SpacingSwatch
					size="6"
					value="1.5rem (24px)"
					description="Medium spacing for section gaps"
				/>
				<SpacingSwatch
					size="8"
					value="2rem (32px)"
					description="Large spacing for major sections"
				/>
				<SpacingSwatch
					size="10"
					value="2.5rem (40px)"
					description="Extra large spacing for page sections"
				/>
				<SpacingSwatch
					size="12"
					value="3rem (48px)"
					description="Maximum spacing for major content blocks"
				/>
			</div>
		</div>
	),
};

export const SpacingUsage: Story = {
	render: () => (
		<div className="space-y-8">
			<h2 className="text-2xl font-semibold">Spacing Usage Examples</h2>

			<div className="space-y-4">
				<h3 className="text-lg font-medium">Card Layout</h3>
				<div className="p-6 border rounded-lg">
					<div className="space-y-4">
						<h4 className="text-xl font-semibold">Card Title</h4>
						<p className="text-muted-foreground">
							This card demonstrates proper spacing between elements using our
							spacing scale.
						</p>
						<div className="flex items-center space-x-4">
							<button className="px-4 py-2 bg-primary text-primary-foreground rounded-md">
								Action
							</button>
							<button className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md">
								Cancel
							</button>
						</div>
					</div>
				</div>
			</div>

			<div className="space-y-4">
				<h3 className="text-lg font-medium">Form Layout</h3>
				<div className="space-y-6">
					<div className="space-y-2">
						<label className="text-sm font-medium">Email</label>
						<input
							type="email"
							className="w-full px-3 py-2 border rounded-md"
							placeholder="Enter your email"
						/>
					</div>
					<div className="space-y-2">
						<label className="text-sm font-medium">Password</label>
						<input
							type="password"
							className="w-full px-3 py-2 border rounded-md"
							placeholder="Enter your password"
						/>
					</div>
					<button className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-md">
						Sign In
					</button>
				</div>
			</div>

			<div className="space-y-4">
				<h3 className="text-lg font-medium">List Layout</h3>
				<div className="space-y-2">
					<div className="flex items-center space-x-3 p-3 border rounded-md">
						<div className="w-8 h-8 bg-primary rounded-full" />
						<div>
							<h4 className="font-medium">Item Title</h4>
							<p className="text-sm text-muted-foreground">Item description</p>
						</div>
					</div>
					<div className="flex items-center space-x-3 p-3 border rounded-md">
						<div className="w-8 h-8 bg-primary rounded-full" />
						<div>
							<h4 className="font-medium">Item Title</h4>
							<p className="text-sm text-muted-foreground">Item description</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	),
};

export const ResponsiveSpacing: Story = {
	render: () => (
		<div className="space-y-6">
			<h2 className="text-2xl font-semibold">Responsive Spacing</h2>

			<div className="space-y-4">
				<h3 className="text-lg font-medium">
					Container with Responsive Padding
				</h3>
				<div className="p-4 md:p-6 lg:p-8 border rounded-lg">
					<p className="text-muted-foreground">
						This container demonstrates responsive padding that increases at
						different breakpoints:
					</p>
					<ul className="mt-4 space-y-2 text-sm text-muted-foreground">
						<li>• Mobile: 1rem (16px) padding</li>
						<li>• Tablet: 1.5rem (24px) padding</li>
						<li>• Desktop: 2rem (32px) padding</li>
					</ul>
				</div>
			</div>

			<div className="space-y-4">
				<h3 className="text-lg font-medium">Grid with Responsive Gaps</h3>
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8">
					{[1, 2, 3].map((i) => (
						<div
							key={i}
							className="p-4 border rounded-lg">
							<h4 className="font-medium">Grid Item {i}</h4>
							<p className="text-sm text-muted-foreground mt-2">
								This grid demonstrates responsive gaps that increase at
								different breakpoints.
							</p>
						</div>
					))}
				</div>
			</div>
		</div>
	),
};
