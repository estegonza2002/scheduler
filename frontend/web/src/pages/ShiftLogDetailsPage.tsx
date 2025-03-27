import * as React from "react";
import { useState } from "react";
import {
	Tabs,
	TabsContent,
	TabsList,
	TabsTrigger,
} from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Calendar } from "@/components/ui/calendar";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Filter, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { ExportDropdown } from "@/components/ExportDropdown";
import { ContentContainer } from "@/components/ui/content-container";
import { PageHeader } from "@/components/ui/page-header";
import { ContentSection } from "@/components/ui/content-section";

// Mock data for shifts - in a real app this would come from an API
const mockShifts = [
	{
		id: "1",
		employee: "John Smith",
		date: "2023-06-10",
		startTime: "09:00",
		endTime: "17:00",
		location: "Downtown Store",
		status: "Completed",
		planned: 8,
		actual: 8,
	},
	{
		id: "2",
		employee: "Jane Doe",
		date: "2023-06-10",
		startTime: "10:00",
		endTime: "18:30",
		location: "Downtown Store",
		status: "Completed",
		planned: 8,
		actual: 8.5,
	},
	{
		id: "3",
		employee: "Mike Johnson",
		date: "2023-06-11",
		startTime: "08:00",
		endTime: "14:00",
		location: "Westside Location",
		status: "Completed",
		planned: 6,
		actual: 6,
	},
	{
		id: "4",
		employee: "Sarah Williams",
		date: "2023-06-12",
		startTime: "12:00",
		endTime: "20:00",
		location: "East Mall",
		status: "No Show",
		planned: 8,
		actual: 0,
	},
	{
		id: "5",
		employee: "Robert Brown",
		date: "2023-06-13",
		startTime: "09:00",
		endTime: "17:30",
		location: "Downtown Store",
		status: "Completed",
		planned: 8,
		actual: 8.5,
	},
];

export function ShiftLogDetailsPage() {
	const [searchQuery, setSearchQuery] = useState("");
	const [dateRange, setDateRange] = useState<{
		from: Date | undefined;
		to: Date | undefined;
	}>({
		from: undefined,
		to: undefined,
	});
	const [locationFilter, setLocationFilter] = useState("all");
	const [statusFilter, setStatusFilter] = useState("all");
	const [currentTab, setCurrentTab] = useState("all");

	// Filter shifts based on search, date range, location, and status
	const filteredShifts = mockShifts.filter((shift) => {
		// Filter by search query (employee name or location)
		const matchesSearch =
			searchQuery === "" ||
			shift.employee.toLowerCase().includes(searchQuery.toLowerCase()) ||
			shift.location.toLowerCase().includes(searchQuery.toLowerCase());

		// Filter by date range
		const shiftDate = new Date(shift.date);
		const matchesDateRange =
			(!dateRange.from || shiftDate >= dateRange.from) &&
			(!dateRange.to || shiftDate <= dateRange.to);

		// Filter by location
		const matchesLocation =
			locationFilter === "all" || shift.location === locationFilter;

		// Filter by status
		const matchesStatus =
			statusFilter === "all" || shift.status === statusFilter;

		// Filter by tab
		const matchesTab =
			currentTab === "all" ||
			(currentTab === "variance" && shift.planned !== shift.actual);

		return (
			matchesSearch &&
			matchesDateRange &&
			matchesLocation &&
			matchesStatus &&
			matchesTab
		);
	});

	const locations = [...new Set(mockShifts.map((shift) => shift.location))];
	const statuses = [...new Set(mockShifts.map((shift) => shift.status))];

	// Action for the page header
	const headerActions = (
		<ExportDropdown
			data={filteredShifts}
			filename="shift-details-export"
			headers={[
				"employee",
				"date",
				"startTime",
				"endTime",
				"location",
				"status",
				"planned",
				"actual",
			]}
		/>
	);

	return (
		<>
			<PageHeader
				title="Shift Log Details"
				description="View and analyze detailed shift history records"
				actions={headerActions}
				showBackButton={true}
			/>

			<ContentContainer>
				<ContentSection
					title="Shift History Details"
					description="View and analyze past shifts, including planned vs. actual hours worked.">
					<Tabs
						value={currentTab}
						onValueChange={setCurrentTab}
						className="space-y-4">
						<div className="flex flex-col md:flex-row justify-between space-y-2 md:space-y-0">
							<TabsList>
								<TabsTrigger value="all">All Shifts</TabsTrigger>
								<TabsTrigger value="variance">Hours Variance</TabsTrigger>
							</TabsList>

							<div className="flex items-center space-x-2">
								<div className="relative md:w-64">
									<Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
									<Input
										placeholder="Search by employee or location..."
										value={searchQuery}
										onChange={(e) => setSearchQuery(e.target.value)}
										className="pl-8"
									/>
								</div>
								<Button
									variant="outline"
									size="icon">
									<Filter className="h-4 w-4" />
								</Button>
							</div>
						</div>

						<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
							<Popover>
								<PopoverTrigger asChild>
									<Button
										variant="outline"
										className={cn(
											"w-full justify-start text-left font-normal",
											!dateRange.from && "text-muted-foreground"
										)}>
										<CalendarIcon className="mr-2 h-4 w-4" />
										{dateRange.from
											? format(dateRange.from, "PPP")
											: "Start Date"}
									</Button>
								</PopoverTrigger>
								<PopoverContent className="w-auto p-0">
									<Calendar
										mode="single"
										selected={dateRange.from}
										onSelect={(date) =>
											setDateRange((prev) => ({ ...prev, from: date }))
										}
										initialFocus
									/>
								</PopoverContent>
							</Popover>

							<Popover>
								<PopoverTrigger asChild>
									<Button
										variant="outline"
										className={cn(
											"w-full justify-start text-left font-normal",
											!dateRange.to && "text-muted-foreground"
										)}>
										<CalendarIcon className="mr-2 h-4 w-4" />
										{dateRange.to ? format(dateRange.to, "PPP") : "End Date"}
									</Button>
								</PopoverTrigger>
								<PopoverContent className="w-auto p-0">
									<Calendar
										mode="single"
										selected={dateRange.to}
										onSelect={(date) =>
											setDateRange((prev) => ({ ...prev, to: date }))
										}
										initialFocus
									/>
								</PopoverContent>
							</Popover>

							<Select
								value={locationFilter}
								onValueChange={setLocationFilter}>
								<SelectTrigger>
									<SelectValue placeholder="All Locations" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="all">All Locations</SelectItem>
									{locations.map((location) => (
										<SelectItem
											key={location}
											value={location}>
											{location}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
							<Select
								value={statusFilter}
								onValueChange={setStatusFilter}>
								<SelectTrigger>
									<SelectValue placeholder="All Statuses" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="all">All Statuses</SelectItem>
									{statuses.map((status) => (
										<SelectItem
											key={status}
											value={status}>
											{status}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>

						<TabsContent
							value="all"
							className="space-y-4">
							<div className="rounded-md border">
								<Table>
									<TableHeader>
										<TableRow>
											<TableHead>Employee</TableHead>
											<TableHead>Date</TableHead>
											<TableHead>Time</TableHead>
											<TableHead>Location</TableHead>
											<TableHead>Status</TableHead>
											<TableHead>Planned Hours</TableHead>
											<TableHead>Actual Hours</TableHead>
											<TableHead>Variance</TableHead>
										</TableRow>
									</TableHeader>
									<TableBody>
										{filteredShifts.length > 0 ? (
											filteredShifts.map((shift) => (
												<TableRow key={shift.id}>
													<TableCell className="font-medium">
														{shift.employee}
													</TableCell>
													<TableCell>{shift.date}</TableCell>
													<TableCell>{`${shift.startTime} - ${shift.endTime}`}</TableCell>
													<TableCell>{shift.location}</TableCell>
													<TableCell>
														<span
															className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
																shift.status === "Completed"
																	? "bg-green-100 text-green-800"
																	: "bg-red-100 text-red-800"
															}`}>
															{shift.status}
														</span>
													</TableCell>
													<TableCell>{shift.planned}</TableCell>
													<TableCell>{shift.actual}</TableCell>
													<TableCell
														className={
															shift.actual > shift.planned
																? "text-red-600"
																: shift.actual < shift.planned
																? "text-orange-600"
																: ""
														}>
														{(shift.actual - shift.planned).toFixed(1)}
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
											<TableHead>Employee</TableHead>
											<TableHead>Date</TableHead>
											<TableHead>Time</TableHead>
											<TableHead>Location</TableHead>
											<TableHead>Status</TableHead>
											<TableHead>Planned Hours</TableHead>
											<TableHead>Actual Hours</TableHead>
											<TableHead>Variance</TableHead>
										</TableRow>
									</TableHeader>
									<TableBody>
										{filteredShifts.filter((s) => s.planned !== s.actual)
											.length > 0 ? (
											filteredShifts
												.filter((s) => s.planned !== s.actual)
												.map((shift) => (
													<TableRow key={shift.id}>
														<TableCell className="font-medium">
															{shift.employee}
														</TableCell>
														<TableCell>{shift.date}</TableCell>
														<TableCell>{`${shift.startTime} - ${shift.endTime}`}</TableCell>
														<TableCell>{shift.location}</TableCell>
														<TableCell>
															<span
																className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
																	shift.status === "Completed"
																		? "bg-green-100 text-green-800"
																		: "bg-red-100 text-red-800"
																}`}>
																{shift.status}
															</span>
														</TableCell>
														<TableCell>{shift.planned}</TableCell>
														<TableCell>{shift.actual}</TableCell>
														<TableCell
															className={
																shift.actual > shift.planned
																	? "text-red-600"
																	: "text-orange-600"
															}>
															{(shift.actual - shift.planned).toFixed(1)}
														</TableCell>
													</TableRow>
												))
										) : (
											<TableRow>
												<TableCell
													colSpan={8}
													className="text-center py-6 text-muted-foreground">
													No shifts with hour variance found
												</TableCell>
											</TableRow>
										)}
									</TableBody>
								</Table>
							</div>
						</TabsContent>
					</Tabs>
				</ContentSection>
			</ContentContainer>
		</>
	);
}
