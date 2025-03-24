import type { Meta, StoryObj } from "@storybook/react";

const meta: Meta = {
	title: "Foundation/Spacing/LayoutGrid",
	parameters: {
		layout: "padded",
		docs: {
			description: {
				component:
					"Our layout grid system provides a consistent structure for page layouts and component arrangements. It ensures proper alignment and spacing across different screen sizes.",
			},
		},
	},
	tags: ["autodocs"],
};

export default meta;
type Story = StoryObj;

const GridDemo = ({
	cols,
	gap,
	className = "",
}: {
	cols: number;
	gap: number;
	className?: string;
}) => (
	<div
		className={`grid ${className}`}
		style={{ gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: `${gap}px` }}>
		{Array.from({ length: cols }).map((_, i) => (
			<div
				key={i}
				className="h-20 bg-primary/10 rounded-md flex items-center justify-center">
				<span className="text-sm font-medium">Column {i + 1}</span>
			</div>
		))}
	</div>
);

export const GridSystem: Story = {
	render: () => (
		<div className="space-y-8">
			<h2 className="text-2xl font-semibold">Grid System</h2>

			<div className="space-y-6">
				<div>
					<h3 className="text-lg font-medium mb-4">Basic Grid</h3>
					<GridDemo
						cols={3}
						gap={16}
					/>
				</div>

				<div>
					<h3 className="text-lg font-medium mb-4">Responsive Grid</h3>
					<GridDemo
						cols={3}
						gap={16}
						className="grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
					/>
				</div>

				<div>
					<h3 className="text-lg font-medium mb-4">Grid with Gaps</h3>
					<GridDemo
						cols={4}
						gap={24}
					/>
				</div>
			</div>
		</div>
	),
};

export const LayoutPatterns: Story = {
	render: () => (
		<div className="space-y-8">
			<h2 className="text-2xl font-semibold">Layout Patterns</h2>

			<div className="space-y-6">
				<div>
					<h3 className="text-lg font-medium mb-4">Page Layout</h3>
					<div className="border rounded-lg p-4">
						<div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
							<div className="lg:col-span-3">
								<div className="h-40 bg-muted rounded-md flex items-center justify-center">
									Sidebar
								</div>
							</div>
							<div className="lg:col-span-9">
								<div className="space-y-4">
									<div className="h-20 bg-muted rounded-md flex items-center justify-center">
										Header
									</div>
									<div className="h-60 bg-muted rounded-md flex items-center justify-center">
										Main Content
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>

				<div>
					<h3 className="text-lg font-medium mb-4">Card Grid</h3>
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
						{[1, 2, 3].map((i) => (
							<div
								key={i}
								className="border rounded-lg p-4">
								<div className="h-32 bg-muted rounded-md mb-4" />
								<h4 className="font-medium">Card Title {i}</h4>
								<p className="text-sm text-muted-foreground mt-2">
									This is an example of a card in a responsive grid layout.
								</p>
							</div>
						))}
					</div>
				</div>

				<div>
					<h3 className="text-lg font-medium mb-4">Form Layout</h3>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						<div className="space-y-2">
							<label className="text-sm font-medium">First Name</label>
							<input
								type="text"
								className="w-full px-3 py-2 border rounded-md"
								placeholder="Enter first name"
							/>
						</div>
						<div className="space-y-2">
							<label className="text-sm font-medium">Last Name</label>
							<input
								type="text"
								className="w-full px-3 py-2 border rounded-md"
								placeholder="Enter last name"
							/>
						</div>
						<div className="md:col-span-2 space-y-2">
							<label className="text-sm font-medium">Email</label>
							<input
								type="email"
								className="w-full px-3 py-2 border rounded-md"
								placeholder="Enter email"
							/>
						</div>
					</div>
				</div>
			</div>
		</div>
	),
};

export const ContainerWidths: Story = {
	render: () => (
		<div className="space-y-8">
			<h2 className="text-2xl font-semibold">Container Widths</h2>

			<div className="space-y-6">
				<div>
					<h3 className="text-lg font-medium mb-4">Full Width</h3>
					<div className="w-full h-20 bg-primary/10 rounded-md flex items-center justify-center">
						<span className="text-sm font-medium">Full Width Container</span>
					</div>
				</div>

				<div>
					<h3 className="text-lg font-medium mb-4">Max Width (xl)</h3>
					<div className="max-w-xl mx-auto h-20 bg-primary/10 rounded-md flex items-center justify-center">
						<span className="text-sm font-medium">
							Max Width Container (xl)
						</span>
					</div>
				</div>

				<div>
					<h3 className="text-lg font-medium mb-4">Max Width (2xl)</h3>
					<div className="max-w-2xl mx-auto h-20 bg-primary/10 rounded-md flex items-center justify-center">
						<span className="text-sm font-medium">
							Max Width Container (2xl)
						</span>
					</div>
				</div>

				<div>
					<h3 className="text-lg font-medium mb-4">Responsive Padding</h3>
					<div className="max-w-2xl mx-auto">
						<div className="px-4 md:px-6 lg:px-8">
							<div className="h-20 bg-primary/10 rounded-md flex items-center justify-center">
								<span className="text-sm font-medium">
									Container with Responsive Padding
								</span>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	),
};
