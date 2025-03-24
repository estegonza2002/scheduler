import type { Meta, StoryObj } from "@storybook/react";
import { Progress } from "./progress";
import { useState, useEffect } from "react";

const meta: Meta<typeof Progress> = {
	title: "UI/Progress",
	component: Progress,
	parameters: {
		layout: "centered",
	},
	tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Progress>;

export const Default: Story = {
	args: {
		value: 40,
	},
};

export const Complete: Story = {
	args: {
		value: 100,
	},
};

export const Empty: Story = {
	args: {
		value: 0,
	},
};

// Interactive progress example with animation
const AnimatedProgressExample = () => {
	const [progress, setProgress] = useState(0);

	useEffect(() => {
		const timer = setInterval(() => {
			setProgress((prevProgress) => {
				if (prevProgress === 100) {
					return 0;
				}
				return prevProgress + 10;
			});
		}, 1000);

		return () => clearInterval(timer);
	}, []);

	return <Progress value={progress} />;
};

export const Animated: Story = {
	render: () => <AnimatedProgressExample />,
};

// Custom styled progress example
export const CustomStyled: Story = {
	render: () => (
		<div className="space-y-4">
			<Progress
				value={60}
				className="h-2 w-[300px] [&>div]:bg-primary"
			/>
			<Progress
				value={60}
				className="h-2 w-[300px] [&>div]:bg-secondary"
			/>
			<Progress
				value={60}
				className="h-2 w-[300px] [&>div]:bg-destructive"
			/>
			<Progress
				value={60}
				className="h-2 w-[300px] [&>div]:bg-warning"
			/>
		</div>
	),
};

// Different sizes
export const Sizes: Story = {
	render: () => (
		<div className="space-y-4">
			<Progress
				value={60}
				className="h-1 w-[300px]"
			/>
			<Progress
				value={60}
				className="h-2 w-[300px]"
			/>
			<Progress
				value={60}
				className="h-3 w-[300px]"
			/>
			<Progress
				value={60}
				className="h-4 w-[300px]"
			/>
		</div>
	),
};

// With label
export const WithLabel: Story = {
	render: () => (
		<div className="space-y-2">
			<div className="flex justify-between text-sm text-muted-foreground">
				<span>Progress</span>
				<span>60%</span>
			</div>
			<Progress
				value={60}
				className="w-[300px]"
			/>
		</div>
	),
};
