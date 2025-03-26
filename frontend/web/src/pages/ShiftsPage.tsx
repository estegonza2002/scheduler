import * as React from "react";
import { useState } from "react";
import { Link } from "react-router-dom";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Calendar } from "../components/ui/calendar";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "../components/ui/popover";
import {
	Tabs,
	TabsContent,
	TabsList,
	TabsTrigger,
} from "../components/ui/tabs";
import { Input } from "../components/ui/input";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "../components/ui/table";
import { format, parseISO, isToday, isPast } from "date-fns";
import {
	Calendar as CalendarIcon,
	ChevronRight,
	Clock,
	Download,
	FileText,
	Filter,
	Search,
	Users,
} from "lucide-react";
import { cn } from "../lib/utils";
import { Badge } from "../components/ui/badge";

// Mock data for shifts - in a real app this would come from an API
const mockShifts = [
	{
		id: "shift-1",
		date: "2023-06-15",
		locationName: "Downtown Store",
		employeesScheduled: 8,
		employeesPresent: 8,
		status: "Completed",
		totalScheduledHours: 64,
		totalActualHours: 65.5,
		variance: 1.5,
	},
	{
		id: "shift-2",
		date: "2023-06-14",
		locationName: "Westside Location",
		employeesScheduled: 5,
		employeesPresent: 4,
		status: "Completed",
		totalScheduledHours: 40,
		totalActualHours: 32,
		variance: -8,
	},
	{
		id: "shift-3",
		date: "2023-06-13",
		locationName: "East Mall",
		employeesScheduled: 6,
		employeesPresent: 6,
		status: "Completed",
		totalScheduledHours: 48,
		totalActualHours: 49,
		variance: 1,
	},
	{
		id: "shift-4",
		date: "2023-06-12",
		locationName: "Downtown Store",
		employeesScheduled: 8,
		employeesPresent: 8,
		status: "Completed",
		totalScheduledHours: 64,
		totalActualHours: 64,
		variance: 0,
	},
	{
		id: "shift-5",
		date: "2023-06-11",
		locationName: "Westside Location",
		employeesScheduled: 4,
		employeesPresent: 3,
		status: "Completed",
		totalScheduledHours: 32,
		totalActualHours: 24,
		variance: -8,
	},
];

export function ShiftsPage() {
	const [searchQuery, setSearchQuery] = useState("");
	const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
	const [currentTab, setCurrentTab] = useState("all");

	// Filter shifts based on search, date, and tab
	const filteredShifts = mockShifts.filter((shift) => {
		// Filter by search query (location)
		const matchesSearch =
			searchQuery === "" ||
			shift.locationName.toLowerCase().includes(searchQuery.toLowerCase());

		// Filter by date
		const matchesDate =
			!selectedDate || shift.date === format(selectedDate, "yyyy-MM-dd");

		// Filter by tab
		const matchesTab =
			currentTab === "all" ||
			(currentTab === "variance" && shift.variance !== 0);

		return matchesSearch && matchesDate && matchesTab;
	});

	return (
		<div className="container mx-auto py-6 space-y-6">
			<div className="flex items-center justify-between">
				<h1 className="text-2xl font-bold tracking-tight">Shifts</h1>
				<Button>
					<Download className="mr-2 h-4 w-4" />
					Export
				</Button>
			</div>

			<div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
				<Card>
					<CardHeader className="pb-2">
						<CardTitle className="text-base font-medium">
							Total Shifts
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{mockShifts.length}</div>
						<p className="text-xs text-muted-foreground">Last 30 days</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="pb-2">
						<CardTitle className="text-base font-medium">
							Average Hours Variance
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">
							{(
								mockShifts.reduce((sum, shift) => sum + shift.variance, 0) /
								mockShifts.length
							).toFixed(1)}
						</div>
						<p className="text-xs text-muted-foreground">
							Hours variance per shift
						</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="pb-2">
						<CardTitle className="text-base font-medium">
							Attendance Rate
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">
							{Math.round(
								(mockShifts.reduce(
									(sum, shift) => sum + shift.employeesPresent,
									0
								) /
									mockShifts.reduce(
										(sum, shift) => sum + shift.employeesScheduled,
										0
									)) *
									100
							)}
							%
						</div>
						<p className="text-xs text-muted-foreground">
							Employees present vs. scheduled
						</p>
					</CardContent>
				</Card>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>Shift History</CardTitle>
					<CardDescription>
						View past shifts and access detailed information about each shift.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<Tabs
						value={currentTab}
						onValueChange={setCurrentTab}
						className="space-y-4">
						<div className="flex flex-col md:flex-row justify-between space-y-2 md:space-y-0">
							<TabsList>
								<TabsTrigger value="all">All Shifts</TabsTrigger>
								<TabsTrigger value="variance">With Variance</TabsTrigger>
							</TabsList>

							<div className="flex items-center space-x-2">
								<div className="relative md:w-64">
									<Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
									<Input
										placeholder="Search by location..."
										value={searchQuery}
										onChange={(e) => setSearchQuery(e.target.value)}
										className="pl-8"
									/>
								</div>

								<Popover>
									<PopoverTrigger asChild>
										<Button
											variant="outline"
											className={cn(
												"justify-start text-left font-normal md:w-48",
												!selectedDate && "text-muted-foreground"
											)}>
											<CalendarIcon className="mr-2 h-4 w-4" />
											{selectedDate
												? format(selectedDate, "PPP")
												: "Filter by date"}
										</Button>
									</PopoverTrigger>
									<PopoverContent className="w-auto p-0">
										<Calendar
											mode="single"
											selected={selectedDate}
											onSelect={setSelectedDate}
											initialFocus
										/>
										{selectedDate && (
											<div className="p-3 border-t border-border">
												<Button
													variant="outline"
													className="w-full"
													onClick={() => setSelectedDate(undefined)}>
													Clear
												</Button>
											</div>
										)}
									</PopoverContent>
								</Popover>
							</div>
						</div>

						<TabsContent
							value="all"
							className="space-y-4">
							<div className="rounded-md border">
								<Table>
									<TableHeader>
										<TableRow>
											<TableHead>Date</TableHead>
											<TableHead>Location</TableHead>
											<TableHead>Employees</TableHead>
											<TableHead>Scheduled Hours</TableHead>
											<TableHead>Actual Hours</TableHead>
											<TableHead>Variance</TableHead>
											<TableHead>Status</TableHead>
											<TableHead className="text-right">Details</TableHead>
										</TableRow>
									</TableHeader>
									<TableBody>
										{filteredShifts.length > 0 ? (
											filteredShifts.map((shift) => (
												<TableRow key={shift.id}>
													<TableCell>
														<div className="font-medium">
															{format(parseISO(shift.date), "MMM d, yyyy")}
														</div>
														<div className="text-sm text-muted-foreground">
															{isToday(parseISO(shift.date))
																? "Today"
																: isPast(parseISO(shift.date))
																? "Past"
																: "Upcoming"}
														</div>
													</TableCell>
													<TableCell>{shift.locationName}</TableCell>
													<TableCell>
														<div className="flex items-center">
															<Users className="h-4 w-4 mr-1 text-muted-foreground" />
															<span>
																{shift.employeesPresent}/
																{shift.employeesScheduled}
															</span>
														</div>
													</TableCell>
													<TableCell>{shift.totalScheduledHours}</TableCell>
													<TableCell>{shift.totalActualHours}</TableCell>
													<TableCell
														className={
															shift.variance > 0
																? "text-red-600"
																: shift.variance < 0
																? "text-orange-600"
																: ""
														}>
														{shift.variance > 0 ? "+" : ""}
														{shift.variance}
													</TableCell>
													<TableCell>
														<Badge
															variant={
																shift.status === "Completed"
																	? "secondary"
																	: "outline"
															}>
															{shift.status}
														</Badge>
													</TableCell>
													<TableCell className="text-right">
														<Link to={`/shifts/${shift.id}`}>
															<Button
																variant="ghost"
																size="icon">
																<ChevronRight className="h-4 w-4" />
															</Button>
														</Link>
													</TableCell>
												</TableRow>
											))
										) : (
											<TableRow>
												<TableCell
													colSpan={8}
													className="text-center py-6 text-muted-foreground">
													No shifts found matching your filters
												</TableCell>
											</TableRow>
										)}
									</TableBody>
								</Table>
							</div>
						</TabsContent>

						<TabsContent
							value="variance"
							className="space-y-4">
							<div className="rounded-md border">
								<Table>
									<TableHeader>
										<TableRow>
											<TableHead>Date</TableHead>
											<TableHead>Location</TableHead>
											<TableHead>Employees</TableHead>
											<TableHead>Scheduled Hours</TableHead>
											<TableHead>Actual Hours</TableHead>
											<TableHead>Variance</TableHead>
											<TableHead>Status</TableHead>
											<TableHead className="text-right">Details</TableHead>
										</TableRow>
									</TableHeader>
									<TableBody>
										{filteredShifts.length > 0 ? (
											filteredShifts.map((shift) => (
												<TableRow key={shift.id}>
													<TableCell>
														<div className="font-medium">
															{format(parseISO(shift.date), "MMM d, yyyy")}
														</div>
														<div className="text-sm text-muted-foreground">
															{isToday(parseISO(shift.date))
																? "Today"
																: isPast(parseISO(shift.date))
																? "Past"
																: "Upcoming"}
														</div>
													</TableCell>
													<TableCell>{shift.locationName}</TableCell>
													<TableCell>
														<div className="flex items-center">
															<Users className="h-4 w-4 mr-1 text-muted-foreground" />
															<span>
																{shift.employeesPresent}/
																{shift.employeesScheduled}
															</span>
														</div>
													</TableCell>
													<TableCell>{shift.totalScheduledHours}</TableCell>
													<TableCell>{shift.totalActualHours}</TableCell>
													<TableCell
														className={
															shift.variance > 0
																? "text-red-600"
																: shift.variance < 0
																? "text-orange-600"
																: ""
														}>
														{shift.variance > 0 ? "+" : ""}
														{shift.variance}
													</TableCell>
													<TableCell>
														<Badge
															variant={
																shift.status === "Completed"
																	? "secondary"
																	: "outline"
															}>
															{shift.status}
														</Badge>
													</TableCell>
													<TableCell className="text-right">
														<Link to={`/shifts/${shift.id}`}>
															<Button
																variant="ghost"
																size="icon">
																<ChevronRight className="h-4 w-4" />
															</Button>
														</Link>
													</TableCell>
												</TableRow>
											))
										) : (
											<TableRow>
												<TableCell
													colSpan={8}
													className="text-center py-6 text-muted-foreground">
													No shifts with variance found
												</TableCell>
											</TableRow>
										)}
									</TableBody>
								</Table>
							</div>
						</TabsContent>
					</Tabs>
				</CardContent>
			</Card>
		</div>
	);
}
