import type { Meta, StoryObj } from "@storybook/react";
import { Loading } from "../../components/ui/loading";

const meta: Meta<typeof Loading> = {
	title: "Components/Loading",
	component: Loading,
	parameters: {
		layout: "padded",
		docs: {
			description: {
				component:
					"A versatile loading component that supports multiple variants and sizes for different loading states.",
			},
		},
	},
	tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Loading>;

export const Default: Story = {
	render: () => <Loading />,
};

export const Spinner: Story = {
	render: () => <Loading variant="spinner" />,
};

export const Dots: Story = {
	render: () => <Loading variant="dots" />,
};

export const Skeleton: Story = {
	render: () => <Loading variant="skeleton" />,
};

export const Pulse: Story = {
	render: () => <Loading variant="pulse" />,
};

export const Sizes: Story = {
	render: () => (
		<div className="flex items-center gap-8">
			<Loading size="sm" />
			<Loading size="default" />
			<Loading size="lg" />
		</div>
	),
};

export const AllVariants: Story = {
	render: () => (
		<div className="flex items-center gap-8">
			<Loading variant="spinner" />
			<Loading variant="dots" />
			<Loading variant="skeleton" />
			<Loading variant="pulse" />
		</div>
	),
};

export const WithBackground: Story = {
	render: () => (
		<div className="flex h-32 items-center justify-center rounded-lg border bg-card p-4">
			<Loading />
		</div>
	),
};

export const FullScreen: Story = {
	render: () => (
		<div className="relative h-32 rounded-lg border bg-card p-4">
			<Loading fullScreen />
			<div className="flex h-full items-center justify-center">
				<p>Content behind the loading overlay</p>
			</div>
		</div>
	),
};

export const CustomColors: Story = {
	render: () => (
		<div className="flex items-center gap-8">
			<Loading className="text-primary" />
			<Loading className="text-blue-500" />
			<Loading className="text-green-500" />
		</div>
	),
};

export const WithText: Story = {
	render: () => (
		<div className="flex items-center gap-2">
			<Loading size="sm" />
			<span>Loading...</span>
		</div>
	),
};
