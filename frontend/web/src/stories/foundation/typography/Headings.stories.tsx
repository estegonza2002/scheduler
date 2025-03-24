import type { Meta, StoryObj } from "@storybook/react";

const meta: Meta = {
	title: "Foundation/Typography/Headings",
	parameters: {
		layout: "padded",
		docs: {
			description: {
				component:
					"Our heading system uses a consistent scale for hierarchy and readability. All headings use the primary font family and maintain proper spacing.",
			},
		},
	},
	tags: ["autodocs"],
};

export default meta;
type Story = StoryObj;

export const AllHeadings: Story = {
	render: () => (
		<div className="space-y-8">
			<div>
				<h1 className="text-4xl font-bold tracking-tight">Heading 1</h1>
				<p className="text-sm text-muted-foreground mt-1">
					Used for main page titles and hero sections
				</p>
			</div>

			<div>
				<h2 className="text-3xl font-semibold tracking-tight">Heading 2</h2>
				<p className="text-sm text-muted-foreground mt-1">
					Used for section headers and major content divisions
				</p>
			</div>

			<div>
				<h3 className="text-2xl font-semibold tracking-tight">Heading 3</h3>
				<p className="text-sm text-muted-foreground mt-1">
					Used for subsection headers and card titles
				</p>
			</div>

			<div>
				<h4 className="text-xl font-semibold tracking-tight">Heading 4</h4>
				<p className="text-sm text-muted-foreground mt-1">
					Used for smaller section headers and form labels
				</p>
			</div>

			<div>
				<h5 className="text-lg font-medium tracking-tight">Heading 5</h5>
				<p className="text-sm text-muted-foreground mt-1">
					Used for minor section headers and list headers
				</p>
			</div>

			<div>
				<h6 className="text-base font-medium tracking-tight">Heading 6</h6>
				<p className="text-sm text-muted-foreground mt-1">
					Used for the smallest section headers and table headers
				</p>
			</div>
		</div>
	),
};

export const UsageExample: Story = {
	render: () => (
		<div className="space-y-6">
			<h1 className="text-4xl font-bold tracking-tight">Employee Schedule</h1>

			<section>
				<h2 className="text-3xl font-semibold tracking-tight">
					Weekly Overview
				</h2>
				<div className="mt-4">
					<h3 className="text-2xl font-semibold tracking-tight">Monday</h3>
					<div className="mt-2">
						<h4 className="text-xl font-semibold tracking-tight">
							Morning Shift
						</h4>
						<p className="text-sm text-muted-foreground mt-1">
							8:00 AM - 4:00 PM
						</p>
					</div>
				</div>
			</section>
		</div>
	),
};
