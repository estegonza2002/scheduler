import type { Meta, StoryObj } from "@storybook/react";

const meta: Meta = {
	title: "Foundation/Colors/ColorPalette",
	parameters: {
		layout: "padded",
		docs: {
			description: {
				component:
					"Our color system provides a consistent and accessible palette for the entire application. Colors are organized by purpose and include proper contrast ratios for accessibility.",
			},
		},
	},
	tags: ["autodocs"],
};

export default meta;
type Story = StoryObj;

const ColorSwatch = ({
	name,
	color,
	description,
}: {
	name: string;
	color: string;
	description: string;
}) => (
	<div className="flex items-center space-x-4 p-4 border rounded-lg">
		<div className={`w-16 h-16 rounded-md ${color}`} />
		<div>
			<h3 className="font-medium">{name}</h3>
			<p className="text-sm text-muted-foreground">{description}</p>
		</div>
	</div>
);

export const PrimaryColors: Story = {
	render: () => (
		<div className="space-y-4">
			<h2 className="text-2xl font-semibold">Primary Colors</h2>
			<div className="space-y-2">
				<ColorSwatch
					name="Primary"
					color="bg-primary"
					description="Main brand color, used for primary actions and key UI elements"
				/>
				<ColorSwatch
					name="Primary Foreground"
					color="bg-primary-foreground"
					description="Text and icons on primary color backgrounds"
				/>
				<ColorSwatch
					name="Primary Muted"
					color="bg-primary/10"
					description="Subtle primary color for backgrounds and accents"
				/>
			</div>
		</div>
	),
};

export const SecondaryColors: Story = {
	render: () => (
		<div className="space-y-4">
			<h2 className="text-2xl font-semibold">Secondary Colors</h2>
			<div className="space-y-2">
				<ColorSwatch
					name="Secondary"
					color="bg-secondary"
					description="Supporting color for secondary actions and UI elements"
				/>
				<ColorSwatch
					name="Secondary Foreground"
					color="bg-secondary-foreground"
					description="Text and icons on secondary color backgrounds"
				/>
				<ColorSwatch
					name="Secondary Muted"
					color="bg-secondary/10"
					description="Subtle secondary color for backgrounds and accents"
				/>
			</div>
		</div>
	),
};

export const AccentColors: Story = {
	render: () => (
		<div className="space-y-4">
			<h2 className="text-2xl font-semibold">Accent Colors</h2>
			<div className="space-y-2">
				<ColorSwatch
					name="Accent"
					color="bg-accent"
					description="Highlight color for important UI elements"
				/>
				<ColorSwatch
					name="Accent Foreground"
					color="bg-accent-foreground"
					description="Text and icons on accent color backgrounds"
				/>
				<ColorSwatch
					name="Accent Muted"
					color="bg-accent/10"
					description="Subtle accent color for backgrounds and highlights"
				/>
			</div>
		</div>
	),
};

export const StatusColors: Story = {
	render: () => (
		<div className="space-y-4">
			<h2 className="text-2xl font-semibold">Status Colors</h2>
			<div className="space-y-2">
				<ColorSwatch
					name="Success"
					color="bg-green-500"
					description="Used for success states and positive actions"
				/>
				<ColorSwatch
					name="Warning"
					color="bg-yellow-500"
					description="Used for warning states and cautionary messages"
				/>
				<ColorSwatch
					name="Error"
					color="bg-red-500"
					description="Used for error states and critical messages"
				/>
				<ColorSwatch
					name="Info"
					color="bg-blue-500"
					description="Used for informational messages and neutral states"
				/>
			</div>
		</div>
	),
};

export const NeutralColors: Story = {
	render: () => (
		<div className="space-y-4">
			<h2 className="text-2xl font-semibold">Neutral Colors</h2>
			<div className="space-y-2">
				<ColorSwatch
					name="Background"
					color="bg-background"
					description="Main background color for the application"
				/>
				<ColorSwatch
					name="Foreground"
					color="bg-foreground"
					description="Primary text color"
				/>
				<ColorSwatch
					name="Muted"
					color="bg-muted"
					description="Subtle background color for secondary elements"
				/>
				<ColorSwatch
					name="Muted Foreground"
					color="bg-muted-foreground"
					description="Secondary text color for less important content"
				/>
				<ColorSwatch
					name="Border"
					color="bg-border"
					description="Color for borders and dividers"
				/>
			</div>
		</div>
	),
};

export const UsageExample: Story = {
	render: () => (
		<div className="space-y-6">
			<h2 className="text-2xl font-semibold">Color Usage Example</h2>

			<div className="p-6 bg-primary rounded-lg">
				<h3 className="text-primary-foreground text-xl font-semibold">
					Primary Action
				</h3>
				<p className="text-primary-foreground/80 mt-2">
					This is an example of using primary colors for important UI elements.
				</p>
			</div>

			<div className="p-6 bg-secondary rounded-lg">
				<h3 className="text-secondary-foreground text-xl font-semibold">
					Secondary Action
				</h3>
				<p className="text-secondary-foreground/80 mt-2">
					This is an example of using secondary colors for supporting UI
					elements.
				</p>
			</div>

			<div className="p-6 bg-accent rounded-lg">
				<h3 className="text-accent-foreground text-xl font-semibold">
					Accent Element
				</h3>
				<p className="text-accent-foreground/80 mt-2">
					This is an example of using accent colors for highlighting important
					information.
				</p>
			</div>
		</div>
	),
};
