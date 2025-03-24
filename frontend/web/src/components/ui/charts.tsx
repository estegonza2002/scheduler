import * as React from "react";
import { cn } from "@/lib/utils";

interface ChartProps extends React.HTMLAttributes<HTMLDivElement> {
	title?: string;
	description?: string;
	children: React.ReactNode;
}

export function Chart({
	title,
	description,
	children,
	className,
	...props
}: ChartProps) {
	return (
		<div
			className={cn("space-y-4", className)}
			{...props}>
			{(title || description) && (
				<div className="space-y-1">
					{title && <h3 className="text-lg font-medium">{title}</h3>}
					{description && (
						<p className="text-sm text-muted-foreground">{description}</p>
					)}
				</div>
			)}
			<div className="relative">{children}</div>
		</div>
	);
}

interface BarChartProps extends React.HTMLAttributes<HTMLDivElement> {
	data: {
		name: string;
		value: number;
	}[];
	maxValue?: number;
	barColor?: string;
	showLabels?: boolean;
}

export function BarChart({
	data,
	maxValue,
	barColor = "hsl(var(--primary))",
	showLabels = true,
	className,
	...props
}: BarChartProps) {
	const max = maxValue || Math.max(...data.map((d) => d.value));

	return (
		<div
			className={cn("space-y-2", className)}
			{...props}>
			<div className="flex items-end justify-between h-[200px]">
				{data.map((item, index) => (
					<div
						key={index}
						className="flex flex-col items-center space-y-1">
						<div
							className="w-8 rounded-t bg-primary/20 transition-all hover:bg-primary/40"
							style={{
								height: `${(item.value / max) * 100}%`,
								backgroundColor: barColor,
							}}
						/>
						{showLabels && (
							<span className="text-xs text-muted-foreground">{item.name}</span>
						)}
					</div>
				))}
			</div>
			{showLabels && (
				<div className="flex justify-between text-xs text-muted-foreground">
					<span>0</span>
					<span>{max}</span>
				</div>
			)}
		</div>
	);
}

interface LineChartProps extends React.HTMLAttributes<HTMLDivElement> {
	data: {
		name: string;
		value: number;
	}[];
	maxValue?: number;
	lineColor?: string;
	showLabels?: boolean;
}

export function LineChart({
	data,
	maxValue,
	lineColor = "hsl(var(--primary))",
	showLabels = true,
	className,
	...props
}: LineChartProps) {
	const max = maxValue || Math.max(...data.map((d) => d.value));
	const points = data.map((item, index) => ({
		x: (index / (data.length - 1)) * 100,
		y: 100 - (item.value / max) * 100,
	}));

	const path = points
		.map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`)
		.join(" ");

	return (
		<div
			className={cn("relative h-[200px]", className)}
			{...props}>
			<svg className="w-full h-full">
				<path
					d={path}
					fill="none"
					stroke={lineColor}
					strokeWidth="2"
					className="transition-all"
				/>
			</svg>
			{showLabels && (
				<div className="flex justify-between text-xs text-muted-foreground mt-2">
					<span>{data[0].name}</span>
					<span>{data[data.length - 1].name}</span>
				</div>
			)}
		</div>
	);
}

interface PieChartProps extends React.HTMLAttributes<HTMLDivElement> {
	data: {
		name: string;
		value: number;
	}[];
	colors?: string[];
	showLabels?: boolean;
}

export function PieChart({
	data,
	colors = [
		"hsl(var(--primary))",
		"hsl(var(--secondary))",
		"hsl(var(--accent))",
		"hsl(var(--destructive))",
		"hsl(var(--muted))",
	],
	showLabels = true,
	className,
	...props
}: PieChartProps) {
	const total = data.reduce((sum, item) => sum + item.value, 0);
	let currentAngle = 0;

	return (
		<div
			className={cn("relative h-[200px]", className)}
			{...props}>
			<svg className="w-full h-full">
				{data.map((item, index) => {
					const percentage = (item.value / total) * 100;
					const angle = (percentage / 100) * 360;
					const startAngle = currentAngle;
					currentAngle += angle;

					const start = polarToCartesian(50, 50, 45, startAngle);
					const end = polarToCartesian(50, 50, 45, startAngle + angle);
					const largeArcFlag = angle > 180 ? 1 : 0;

					const path = [
						"M",
						50,
						50,
						"L",
						start.x,
						start.y,
						"A",
						45,
						45,
						0,
						largeArcFlag,
						1,
						end.x,
						end.y,
						"Z",
					].join(" ");

					return (
						<path
							key={index}
							d={path}
							fill={colors[index % colors.length]}
							className="transition-all"
						/>
					);
				})}
			</svg>
			{showLabels && (
				<div className="flex flex-wrap gap-2 mt-4">
					{data.map((item, index) => (
						<div
							key={index}
							className="flex items-center gap-1">
							<div
								className="w-3 h-3 rounded-full"
								style={{ backgroundColor: colors[index % colors.length] }}
							/>
							<span className="text-xs text-muted-foreground">
								{item.name} ({((item.value / total) * 100).toFixed(0)}%)
							</span>
						</div>
					))}
				</div>
			)}
		</div>
	);
}

function polarToCartesian(
	centerX: number,
	centerY: number,
	radius: number,
	angleInDegrees: number
) {
	const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;

	return {
		x: centerX + radius * Math.cos(angleInRadians),
		y: centerY + radius * Math.sin(angleInRadians),
	};
}
