import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
	CardDescription,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import {
	BarChart3,
	FileText,
	PieChart,
	TrendingUp,
	ArrowRight,
	Users,
	Calendar,
	FileCheck,
	DollarSign,
	AlertCircle,
} from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";

export default function ReportsPage() {
	const { user } = useAuth();
	const [activeTab, setActiveTab] = useState("overview");

	// Check if user is admin
	const isAdmin = user?.user_metadata?.role === "admin";

	if (!isAdmin) {
		return (
			<div className="container max-w-7xl mx-auto py-10">
				<div className="flex flex-col items-center justify-center h-[60vh]">
					<h1 className="text-2xl font-semibold mb-2">Access Restricted</h1>
					<p className="text-muted-foreground mb-4">
						You do not have permission to view reports.
					</p>
					<Button asChild>
						<Link to="/dashboard">Return to Dashboard</Link>
					</Button>
				</div>
			</div>
		);
	}

	return (
		<div className="container max-w-7xl mx-auto py-6 space-y-6">
			<PageHeader
				title="Reports"
				description="View and manage business performance reports"
				actions={<Button variant="outline">Export Reports</Button>}
			/>

			<Tabs
				defaultValue="overview"
				className="space-y-4"
				onValueChange={setActiveTab}>
				<TabsList>
					<TabsTrigger value="overview">Overview</TabsTrigger>
					<TabsTrigger value="analytics">Analytics</TabsTrigger>
					<TabsTrigger value="performance">Performance</TabsTrigger>
					<TabsTrigger value="attendance">Attendance</TabsTrigger>
					<TabsTrigger value="payroll">Payroll</TabsTrigger>
				</TabsList>

				<TabsContent
					value="overview"
					className="space-y-4">
					<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
						<Card>
							<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
								<CardTitle className="text-sm font-medium">
									Total Employees
								</CardTitle>
								<Users className="h-4 w-4 text-muted-foreground" />
							</CardHeader>
							<CardContent>
								<div className="text-2xl font-bold">45</div>
								<p className="text-xs text-muted-foreground">
									+12% from last month
								</p>
							</CardContent>
						</Card>
						<Card>
							<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
								<CardTitle className="text-sm font-medium">
									Total Shifts
								</CardTitle>
								<Calendar className="h-4 w-4 text-muted-foreground" />
							</CardHeader>
							<CardContent>
								<div className="text-2xl font-bold">251</div>
								<p className="text-xs text-muted-foreground">
									+4% from last month
								</p>
							</CardContent>
						</Card>
						<Card>
							<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
								<CardTitle className="text-sm font-medium">
									Attendance Rate
								</CardTitle>
								<FileCheck className="h-4 w-4 text-muted-foreground" />
							</CardHeader>
							<CardContent>
								<div className="text-2xl font-bold">94.2%</div>
								<p className="text-xs text-muted-foreground">
									+2.1% from last month
								</p>
							</CardContent>
						</Card>
						<Card>
							<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
								<CardTitle className="text-sm font-medium">
									Labor Cost
								</CardTitle>
								<DollarSign className="h-4 w-4 text-muted-foreground" />
							</CardHeader>
							<CardContent>
								<div className="text-2xl font-bold">$12,540</div>
								<p className="text-xs text-muted-foreground">
									+5.4% from last month
								</p>
							</CardContent>
						</Card>
					</div>

					<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
						<Card className="col-span-1 lg:col-span-2">
							<CardHeader>
								<CardTitle>Performance Overview</CardTitle>
								<CardDescription>
									Employee performance metrics for the last 30 days
								</CardDescription>
							</CardHeader>
							<CardContent className="h-80">
								<div className="h-full w-full flex items-center justify-center bg-muted/20 rounded-md">
									<div className="text-center">
										<BarChart3 className="mx-auto h-10 w-10 text-muted-foreground/70" />
										<p className="mt-2 text-sm text-muted-foreground">
											Performance chart will be displayed here
										</p>
									</div>
								</div>
							</CardContent>
						</Card>

						<Card>
							<CardHeader>
								<CardTitle>Report Shortcuts</CardTitle>
								<CardDescription>
									Quick access to important reports
								</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="space-y-2">
									<Link
										to="/reports/performance"
										className="flex items-center justify-between p-3 text-sm rounded-md hover:bg-muted group">
										<div className="flex items-center gap-3">
											<TrendingUp className="h-5 w-5 text-muted-foreground group-hover:text-primary" />
											<span>Performance Reports</span>
										</div>
										<ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
									</Link>

									<Link
										to="/reports/attendance"
										className="flex items-center justify-between p-3 text-sm rounded-md hover:bg-muted group">
										<div className="flex items-center gap-3">
											<FileText className="h-5 w-5 text-muted-foreground group-hover:text-primary" />
											<span>Attendance Reports</span>
										</div>
										<ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
									</Link>

									<Link
										to="/reports/payroll"
										className="flex items-center justify-between p-3 text-sm rounded-md hover:bg-muted group">
										<div className="flex items-center gap-3">
											<PieChart className="h-5 w-5 text-muted-foreground group-hover:text-primary" />
											<span>Payroll Reports</span>
										</div>
										<ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
									</Link>
								</div>
							</CardContent>
						</Card>
					</div>
				</TabsContent>

				<TabsContent value="analytics">
					<Card>
						<CardHeader>
							<CardTitle>Analytics Dashboard</CardTitle>
							<CardDescription>
								Detailed business analytics and performance metrics
							</CardDescription>
						</CardHeader>
						<CardContent>
							<Alert className="mb-6">
								<AlertCircle className="h-4 w-4" />
								<AlertTitle>Mock Data</AlertTitle>
								<AlertDescription>
									Analytics features are currently using mock data. Real
									analytics integration is planned - see
									issues/analytics-integration.md
								</AlertDescription>
							</Alert>

							<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
								{/* Revenue Card */}
								<Card>
									<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
										<CardTitle className="text-sm font-medium">
											Total Revenue (Mock)
										</CardTitle>
										<DollarSign className="h-4 w-4 text-muted-foreground" />
									</CardHeader>
									<CardContent>
										<div className="text-2xl font-bold">$11900</div>
										<p className="text-xs text-muted-foreground">
											+20% from last month (Mock)
										</p>
									</CardContent>
								</Card>

								{/* Active Employees Card */}
								<Card>
									<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
										<CardTitle className="text-sm font-medium">
											Active Employees
										</CardTitle>
										<Users className="h-4 w-4 text-muted-foreground" />
									</CardHeader>
									<CardContent>
										<div className="text-2xl font-bold">0</div>
										<p className="text-xs text-muted-foreground">1 locations</p>
									</CardContent>
								</Card>

								{/* Active Shifts Card */}
								<Card>
									<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
										<CardTitle className="text-sm font-medium">
											Active Shifts
										</CardTitle>
										<Calendar className="h-4 w-4 text-muted-foreground" />
									</CardHeader>
									<CardContent>
										<div className="text-2xl font-bold">0</div>
										<p className="text-xs text-muted-foreground">0 upcoming</p>
									</CardContent>
								</Card>

								{/* Employee Types Card */}
								<Card>
									<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
										<CardTitle className="text-sm font-medium">
											Employee Types (Mock)
										</CardTitle>
										<Users className="h-4 w-4 text-muted-foreground" />
									</CardHeader>
									<CardContent>
										<div className="text-2xl font-bold">36</div>
										<p className="text-xs text-muted-foreground">
											Across all types
										</p>
									</CardContent>
								</Card>
							</div>

							<div className="h-[300px] w-full flex items-center justify-center bg-muted/20 rounded-md mt-6">
								<div className="text-center">
									<BarChart3 className="mx-auto h-10 w-10 text-muted-foreground/70" />
									<p className="mt-2 text-sm text-muted-foreground">
										Detailed analytics charts will be displayed here
									</p>
									<Button
										variant="outline"
										className="mt-4">
										Generate Analytics Report
									</Button>
								</div>
							</div>
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent value="performance">
					<Card>
						<CardHeader>
							<CardTitle>Performance Reports</CardTitle>
							<CardDescription>
								Detailed employee performance analytics
							</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="h-[400px] w-full flex items-center justify-center bg-muted/20 rounded-md">
								<div className="text-center">
									<TrendingUp className="mx-auto h-10 w-10 text-muted-foreground/70" />
									<p className="mt-2 text-sm text-muted-foreground">
										Performance reports will be displayed here
									</p>
									<Button
										variant="outline"
										className="mt-4">
										Create Performance Report
									</Button>
								</div>
							</div>
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent value="attendance">
					<Card>
						<CardHeader>
							<CardTitle>Attendance Reports</CardTitle>
							<CardDescription>
								Track employee attendance patterns
							</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="h-[400px] w-full flex items-center justify-center bg-muted/20 rounded-md">
								<div className="text-center">
									<FileText className="mx-auto h-10 w-10 text-muted-foreground/70" />
									<p className="mt-2 text-sm text-muted-foreground">
										Attendance reports will be displayed here
									</p>
									<Button
										variant="outline"
										className="mt-4">
										Create Attendance Report
									</Button>
								</div>
							</div>
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent value="payroll">
					<Card>
						<CardHeader>
							<CardTitle>Payroll Reports</CardTitle>
							<CardDescription>View and export payroll data</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="h-[400px] w-full flex items-center justify-center bg-muted/20 rounded-md">
								<div className="text-center">
									<PieChart className="mx-auto h-10 w-10 text-muted-foreground/70" />
									<p className="mt-2 text-sm text-muted-foreground">
										Payroll reports will be displayed here
									</p>
									<Button
										variant="outline"
										className="mt-4">
										Create Payroll Report
									</Button>
								</div>
							</div>
						</CardContent>
					</Card>
				</TabsContent>
			</Tabs>
		</div>
	);
}
