import { AlertCircle, ArrowRight, Check, Download, Zap } from "lucide-react";
import { Button } from "../../components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "../../components/ui/card";
import {
	Tabs,
	TabsContent,
	TabsList,
	TabsTrigger,
} from "../../components/ui/tabs";
import { Badge } from "../../components/ui/badge";

// Define category type
type IntegrationCategory =
	| "popular"
	| "productivity"
	| "hrAndPayroll"
	| "communication";

// Define integration type
interface Integration {
	id: string;
	name: string;
	description: string;
	category: IntegrationCategory[];
	image: string;
	comingSoon: boolean;
}

// Integration category icons
const IntegrationIcons = {
	popular: <Zap className="h-4 w-4" />,
	productivity: <Check className="h-4 w-4" />,
	hrAndPayroll: <Download className="h-4 w-4" />,
	communication: <AlertCircle className="h-4 w-4" />,
};

// Integration data structure
const integrations: Integration[] = [
	{
		id: "slack",
		name: "Slack",
		description:
			"Send automated schedule notifications and updates to your Slack channels.",
		category: ["popular", "communication"],
		image:
			"https://upload.wikimedia.org/wikipedia/commons/d/d5/Slack_icon_2019.svg",
		comingSoon: false,
	},
	{
		id: "google-calendar",
		name: "Google Calendar",
		description:
			"Sync your employee schedules with Google Calendar for seamless schedule management.",
		category: ["popular", "productivity"],
		image:
			"https://upload.wikimedia.org/wikipedia/commons/a/a5/Google_Calendar_icon_%282020%29.svg",
		comingSoon: false,
	},
	{
		id: "microsoft-teams",
		name: "Microsoft Teams",
		description:
			"Integrate with Teams for schedule notifications and team communications.",
		category: ["communication"],
		image:
			"https://upload.wikimedia.org/wikipedia/commons/c/c9/Microsoft_Office_Teams_%282018%E2%80%93present%29.svg",
		comingSoon: false,
	},
	{
		id: "outlook",
		name: "Outlook Calendar",
		description:
			"Sync your schedule with Outlook Calendar for your Microsoft ecosystem.",
		category: ["productivity"],
		image:
			"https://upload.wikimedia.org/wikipedia/commons/d/df/Microsoft_Office_Outlook_%282018%E2%80%93present%29.svg",
		comingSoon: false,
	},
	{
		id: "quickbooks",
		name: "QuickBooks",
		description:
			"Automatically export timesheet data to QuickBooks for payroll processing.",
		category: ["hrAndPayroll"],
		image:
			"https://upload.wikimedia.org/wikipedia/commons/9/9d/Intuit_QuickBooks_logo.svg",
		comingSoon: false,
	},
	{
		id: "zapier",
		name: "Zapier",
		description:
			"Connect your scheduler to over 5,000 apps through custom Zapier workflows.",
		category: ["popular", "productivity"],
		image: "https://cdn.zapier.com/zapier/images/logos/zapier-logo.svg",
		comingSoon: false,
	},
	{
		id: "adp",
		name: "ADP",
		description:
			"Streamline payroll processing with direct timesheet exports to ADP.",
		category: ["hrAndPayroll"],
		image: "https://upload.wikimedia.org/wikipedia/commons/1/17/ADP_Logo.svg",
		comingSoon: true,
	},
	{
		id: "xero",
		name: "Xero",
		description:
			"Export timesheet data to Xero for accurate payroll and accounting.",
		category: ["hrAndPayroll"],
		image:
			"https://upload.wikimedia.org/wikipedia/en/8/8d/Xero_software_logo.svg",
		comingSoon: true,
	},
	{
		id: "discord",
		name: "Discord",
		description:
			"Send schedule notifications and updates to your Discord server.",
		category: ["communication"],
		image:
			"https://assets-global.website-files.com/6257adef93867e50d84d30e2/636e0a6a49cf127bf92de1e2_icon_clyde_blurple_RGB.png",
		comingSoon: true,
	},
	{
		id: "zoom",
		name: "Zoom",
		description:
			"Schedule team meetings and automatically add Zoom links to scheduled events.",
		category: ["communication", "productivity"],
		image:
			"https://upload.wikimedia.org/wikipedia/commons/thumb/9/9d/Zoom_logo.svg/2048px-Zoom_logo.svg.png",
		comingSoon: false,
	},
];

export default function IntegrationsPage() {
	return (
		<div className="container mx-auto px-4 py-12">
			<div className="text-center mb-16">
				<h1 className="text-4xl font-bold tracking-tight mb-4">Integrations</h1>
				<p className="text-xl text-muted-foreground max-w-3xl mx-auto">
					Connect your favorite tools and services to streamline your workflow
					and increase productivity.
				</p>
			</div>

			<Tabs
				defaultValue="all"
				className="w-full mb-16">
				<div className="flex justify-center mb-8">
					<TabsList>
						<TabsTrigger value="all">All</TabsTrigger>
						<TabsTrigger value="popular">
							<div className="flex items-center gap-1">
								{IntegrationIcons.popular}
								<span>Popular</span>
							</div>
						</TabsTrigger>
						<TabsTrigger value="productivity">
							<div className="flex items-center gap-1">
								{IntegrationIcons.productivity}
								<span>Productivity</span>
							</div>
						</TabsTrigger>
						<TabsTrigger value="hrAndPayroll">
							<div className="flex items-center gap-1">
								{IntegrationIcons.hrAndPayroll}
								<span>HR & Payroll</span>
							</div>
						</TabsTrigger>
						<TabsTrigger value="communication">
							<div className="flex items-center gap-1">
								{IntegrationIcons.communication}
								<span>Communication</span>
							</div>
						</TabsTrigger>
					</TabsList>
				</div>

				<TabsContent
					value="all"
					className="mt-0">
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
						{integrations.map((integration) => (
							<IntegrationCard
								key={integration.id}
								integration={integration}
							/>
						))}
					</div>
				</TabsContent>

				<TabsContent
					value="popular"
					className="mt-0">
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
						{integrations
							.filter((integration) => integration.category.includes("popular"))
							.map((integration) => (
								<IntegrationCard
									key={integration.id}
									integration={integration}
								/>
							))}
					</div>
				</TabsContent>

				<TabsContent
					value="productivity"
					className="mt-0">
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
						{integrations
							.filter((integration) =>
								integration.category.includes("productivity")
							)
							.map((integration) => (
								<IntegrationCard
									key={integration.id}
									integration={integration}
								/>
							))}
					</div>
				</TabsContent>

				<TabsContent
					value="hrAndPayroll"
					className="mt-0">
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
						{integrations
							.filter((integration) =>
								integration.category.includes("hrAndPayroll")
							)
							.map((integration) => (
								<IntegrationCard
									key={integration.id}
									integration={integration}
								/>
							))}
					</div>
				</TabsContent>

				<TabsContent
					value="communication"
					className="mt-0">
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
						{integrations
							.filter((integration) =>
								integration.category.includes("communication")
							)
							.map((integration) => (
								<IntegrationCard
									key={integration.id}
									integration={integration}
								/>
							))}
					</div>
				</TabsContent>
			</Tabs>

			<div className="bg-muted rounded-xl p-8 max-w-5xl mx-auto">
				<div className="text-center mb-8">
					<h2 className="text-2xl font-bold mb-4">
						Need a custom integration?
					</h2>
					<p className="text-muted-foreground max-w-2xl mx-auto">
						Don't see what you're looking for? We can build custom integrations
						to fit your specific business needs.
					</p>
				</div>
				<div className="flex justify-center">
					<Button
						size="lg"
						className="gap-2">
						Contact our team
						<ArrowRight className="h-4 w-4" />
					</Button>
				</div>
			</div>
		</div>
	);
}

// Integration card component
function IntegrationCard({ integration }: { integration: Integration }) {
	return (
		<Card className="overflow-hidden border border-border h-full flex flex-col">
			<CardHeader className="flex flex-row items-center gap-4 pb-2">
				<div className="w-12 h-12 overflow-hidden rounded">
					<img
						src={integration.image}
						alt={integration.name}
						className="w-full h-full object-contain"
					/>
				</div>
				<div>
					<CardTitle className="text-xl flex items-center gap-2">
						{integration.name}
						{integration.comingSoon && (
							<Badge
								variant="outline"
								className="ml-2 text-xs">
								Coming Soon
							</Badge>
						)}
					</CardTitle>
					<div className="flex gap-1 mt-1">
						{integration.category.map((cat: IntegrationCategory) => (
							<div
								key={cat}
								className="flex items-center text-xs text-muted-foreground">
								{IntegrationIcons[cat]}
								<span className="ml-1 capitalize">
									{cat === "hrAndPayroll" ? "HR & Payroll" : cat}
								</span>
							</div>
						))}
					</div>
				</div>
			</CardHeader>
			<CardContent className="py-4 flex-grow">
				<CardDescription className="text-sm">
					{integration.description}
				</CardDescription>
			</CardContent>
			<CardFooter className="pt-0">
				<Button
					variant={integration.comingSoon ? "outline" : "default"}
					className="w-full"
					disabled={integration.comingSoon}>
					{integration.comingSoon ? "Notify me when available" : "Connect"}
				</Button>
			</CardFooter>
		</Card>
	);
}
