import type { Meta, StoryObj } from "@storybook/react";
import { Chart, BarChart, LineChart, PieChart } from "./charts";

const meta: Meta<typeof Chart> = {
	title: "UI/Charts",
	component: Chart,
	parameters: {
		layout: "centered",
	},
	tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Chart>;

// Sample data
const weeklyData = [
	{ name: "Mon", value: 400 },
	{ name: "Tue", value: 300 },
	{ name: "Wed", value: 200 },
	{ name: "Thu", value: 278 },
	{ name: "Fri", value: 189 },
	{ name: "Sat", value: 239 },
	{ name: "Sun", value: 349 },
];

const monthlyData = [
	{ name: "Jan", value: 400 },
	{ name: "Feb", value: 300 },
	{ name: "Mar", value: 200 },
	{ name: "Apr", value: 278 },
	{ name: "May", value: 189 },
	{ name: "Jun", value: 239 },
];

const distributionData = [
	{ name: "Group A", value: 400 },
	{ name: "Group B", value: 300 },
	{ name: "Group C", value: 300 },
	{ name: "Group D", value: 200 },
];

export const BarChartExample: Story = {
	render: () => (
		<Chart
			title="Weekly Sales"
			description="Sales data for the past week">
			<BarChart data={weeklyData} />
		</Chart>
	),
};

export const LineChartExample: Story = {
	render: () => (
		<Chart
			title="Monthly Trends"
			description="Monthly performance over time">
			<LineChart data={monthlyData} />
		</Chart>
	),
};

export const PieChartExample: Story = {
	render: () => (
		<Chart
			title="Distribution"
			description="Data distribution across groups">
			<PieChart data={distributionData} />
		</Chart>
	),
};

export const BarChartWithoutLabels: Story = {
	render: () => (
		<Chart title="Minimal Bar Chart">
			<BarChart
				data={weeklyData}
				showLabels={false}
			/>
		</Chart>
	),
};

export const LineChartWithCustomColor: Story = {
	render: () => (
		<Chart title="Custom Colored Line Chart">
			<LineChart
				data={monthlyData}
				lineColor="hsl(var(--destructive))"
			/>
		</Chart>
	),
};

export const PieChartWithCustomColors: Story = {
	render: () => (
		<Chart title="Custom Colored Pie Chart">
			<PieChart
				data={distributionData}
				colors={[
					"hsl(var(--primary))",
					"hsl(var(--secondary))",
					"hsl(var(--accent))",
					"hsl(var(--destructive))",
				]}
			/>
		</Chart>
	),
};
