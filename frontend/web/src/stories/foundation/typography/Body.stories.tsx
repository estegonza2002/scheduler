import type { Meta, StoryObj } from "@storybook/react";

const meta: Meta = {
	title: "Foundation/Typography/Body",
	parameters: {
		layout: "padded",
		docs: {
			description: {
				component:
					"Our body text system provides a clear hierarchy for different types of content. We use different sizes and weights to create visual distinction while maintaining readability.",
			},
		},
	},
	tags: ["autodocs"],
};

export default meta;
type Story = StoryObj;

export const AllBodyText: Story = {
	render: () => (
		<div className="space-y-8">
			<div>
				<p className="text-lg">Large Body Text</p>
				<p className="text-base">Regular Body Text</p>
				<p className="text-sm">Small Body Text</p>
				<p className="text-xs">Extra Small Body Text</p>
			</div>

			<div>
				<p className="text-lg font-medium">Large Body Text (Medium)</p>
				<p className="text-base font-medium">Regular Body Text (Medium)</p>
				<p className="text-sm font-medium">Small Body Text (Medium)</p>
			</div>

			<div>
				<p className="text-lg font-light">Large Body Text (Light)</p>
				<p className="text-base font-light">Regular Body Text (Light)</p>
				<p className="text-sm font-light">Small Body Text (Light)</p>
			</div>
		</div>
	),
};

export const UsageExample: Story = {
	render: () => (
		<div className="space-y-4">
			<h2 className="text-2xl font-semibold">Employee Profile</h2>

			<div className="space-y-2">
				<p className="text-lg">
					John Doe is a senior software engineer with 5 years of experience in
					our company.
				</p>

				<p className="text-base">
					He specializes in frontend development and has been instrumental in
					building our new scheduling system. His expertise includes React,
					TypeScript, and modern CSS techniques.
				</p>

				<p className="text-sm text-muted-foreground">
					Last updated: March 24, 2024
				</p>
			</div>
		</div>
	),
};
