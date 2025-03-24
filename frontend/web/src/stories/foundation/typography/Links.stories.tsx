import type { Meta, StoryObj } from "@storybook/react";

const meta: Meta = {
	title: "Foundation/Typography/Links",
	parameters: {
		layout: "padded",
		docs: {
			description: {
				component:
					"Our link system provides clear visual feedback for interactive text elements. Links maintain consistent styling across the application while providing clear hover and focus states.",
			},
		},
	},
	tags: ["autodocs"],
};

export default meta;
type Story = StoryObj;

export const AllLinks: Story = {
	render: () => (
		<div className="space-y-8">
			<div>
				<h3 className="text-lg font-medium mb-2">Default Links</h3>
				<div className="space-y-2">
					<a
						href="#"
						className="text-primary hover:underline">
						Primary Link
					</a>
					<br />
					<a
						href="#"
						className="text-secondary hover:underline">
						Secondary Link
					</a>
					<br />
					<a
						href="#"
						className="text-muted-foreground hover:underline">
						Muted Link
					</a>
				</div>
			</div>

			<div>
				<h3 className="text-lg font-medium mb-2">Link Sizes</h3>
				<div className="space-y-2">
					<a
						href="#"
						className="text-lg text-primary hover:underline">
						Large Link
					</a>
					<br />
					<a
						href="#"
						className="text-base text-primary hover:underline">
						Regular Link
					</a>
					<br />
					<a
						href="#"
						className="text-sm text-primary hover:underline">
						Small Link
					</a>
				</div>
			</div>

			<div>
				<h3 className="text-lg font-medium mb-2">Link States</h3>
				<div className="space-y-2">
					<a
						href="#"
						className="text-primary hover:underline">
						Hover State
					</a>
					<br />
					<a
						href="#"
						className="text-primary underline">
						Active State
					</a>
					<br />
					<a
						href="#"
						className="text-primary hover:underline focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2">
						Focus State
					</a>
				</div>
			</div>
		</div>
	),
};

export const UsageExample: Story = {
	render: () => (
		<div className="space-y-4">
			<h2 className="text-2xl font-semibold">Navigation Example</h2>

			<nav className="space-y-2">
				<div>
					<a
						href="#"
						className="text-lg text-primary hover:underline">
						Dashboard
					</a>
				</div>

				<div>
					<a
						href="#"
						className="text-base text-primary hover:underline">
						Employee Management
					</a>
				</div>

				<div>
					<a
						href="#"
						className="text-sm text-muted-foreground hover:underline">
						View all employees →
					</a>
				</div>
			</nav>
		</div>
	),
};
