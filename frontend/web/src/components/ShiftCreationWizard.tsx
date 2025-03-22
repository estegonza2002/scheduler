import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import {
	ShiftsAPI,
	EmployeesAPI,
	Employee,
	LocationsAPI,
	Location,
} from "../api";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "./ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Calendar } from "./ui/calendar";
import { format } from "date-fns";
import {
	CalendarIcon,
	MapPin,
	Clock,
	User,
	Search,
	ArrowLeft,
	ArrowRight,
	Check,
	Building2,
	X,
} from "lucide-react";
import { cn } from "../lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Input as SearchInput } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { ScrollArea } from "./ui/scroll-area";

interface ShiftCreationWizardProps {
	scheduleId: string;
	organizationId: string;
	initialDate?: Date;
	onComplete?: () => void;
	onCancel?: () => void;
}

type LocationData = {
	locationId: string;
};

type ShiftData = {
	date: string;
	startTime: string;
	endTime: string;
	notes?: string;
};

type EmployeeData = {
	employeeId: string;
};

// Define the wizard step type
type WizardStep = "select-location" | "shift-details" | "assign-employee";

export function ShiftCreationWizard({
	scheduleId,
	organizationId,
	initialDate,
	onComplete,
	onCancel,
}: ShiftCreationWizardProps) {
	// Current step in the wizard
	const [step, setStep] = useState<WizardStep>("select-location");

	// Store data from each step
	const [locationData, setLocationData] = useState<LocationData | null>(null);
	const [shiftData, setShiftData] = useState<ShiftData | null>(null);

	// State for data loading and filtering
	const [loading, setLoading] = useState(false);
	const [employees, setEmployees] = useState<Employee[]>([]);
	const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);
	const [locations, setLocations] = useState<Location[]>([]);
	const [filteredLocations, setFilteredLocations] = useState<Location[]>([]);
	const [loadingEmployees, setLoadingEmployees] = useState(false);
	const [loadingLocations, setLoadingLocations] = useState(false);
	const [selectedDate, setSelectedDate] = useState<Date | undefined>(
		initialDate || new Date()
	);

	// Search functionality
	const [searchTerm, setSearchTerm] = useState("");
	const [locationSearchTerm, setLocationSearchTerm] = useState("");
	const [searchFilter, setSearchFilter] = useState<"name" | "role" | "all">(
		"all"
	);

	// Forms for each step
	const locationForm = useForm<LocationData>({
		defaultValues: {
			locationId: "",
		},
	});

	const shiftForm = useForm<ShiftData>({
		defaultValues: {
			date: initialDate ? format(initialDate, "yyyy-MM-dd") : getCurrentDate(),
			startTime: "09:00",
			endTime: "17:00",
			notes: "",
		},
	});

	const employeeForm = useForm<EmployeeData>({
		defaultValues: {
			employeeId: "",
		},
	});

	// Update date when initialDate changes
	useEffect(() => {
		if (initialDate) {
			setSelectedDate(initialDate);
			shiftForm.setValue("date", format(initialDate, "yyyy-MM-dd"));
		}
	}, [initialDate, shiftForm]);

	// Fetch locations
	useEffect(() => {
		async function fetchLocations() {
			try {
				setLoadingLocations(true);
				const locationList = await LocationsAPI.getAll(organizationId);
				setLocations(locationList);
				setFilteredLocations(locationList);
			} catch (error) {
				console.error("Error fetching locations:", error);
				toast.error("Failed to load locations");
			} finally {
				setLoadingLocations(false);
			}
		}

		fetchLocations();
	}, [organizationId]);

	// Filter locations based on search term
	useEffect(() => {
		if (!locationSearchTerm.trim()) {
			setFilteredLocations(locations);
			return;
		}

		const lowerCaseSearch = locationSearchTerm.toLowerCase();
		const filtered = locations.filter((location) =>
			location.name.toLowerCase().includes(lowerCaseSearch)
		);

		setFilteredLocations(filtered);
	}, [locationSearchTerm, locations]);

	// Fetch employees
	useEffect(() => {
		async function fetchEmployees() {
			try {
				setLoadingEmployees(true);
				const employeeList = await EmployeesAPI.getAll(organizationId);
				setEmployees(employeeList);
				setFilteredEmployees(employeeList);
			} catch (error) {
				console.error("Error fetching employees:", error);
				toast.error("Failed to load employees");
			} finally {
				setLoadingEmployees(false);
			}
		}

		fetchEmployees();
	}, [organizationId]);

	// Filter employees based on search term
	useEffect(() => {
		if (!searchTerm.trim()) {
			setFilteredEmployees(employees);
			return;
		}

		const lowerCaseSearch = searchTerm.toLowerCase();
		const filtered = employees.filter((employee) => {
			if (searchFilter === "name" || searchFilter === "all") {
				if (employee.name.toLowerCase().includes(lowerCaseSearch)) {
					return true;
				}
			}

			if (searchFilter === "role" || searchFilter === "all") {
				if (employee.role?.toLowerCase().includes(lowerCaseSearch)) {
					return true;
				}
			}

			return false;
		});

		setFilteredEmployees(filtered);
	}, [searchTerm, searchFilter, employees]);

	// Handle the location step submission
	const handleLocationSelect = (data: LocationData) => {
		setLocationData(data);
		setStep("shift-details");
	};

	// Handle the shift details step submission
	const handleShiftDetailsSubmit = (data: ShiftData) => {
		setShiftData(data);
		setStep("assign-employee");
	};

	// Handle the full form submission (all steps)
	const handleEmployeeAssignSubmit = async (data: EmployeeData) => {
		if (!locationData || !shiftData) return;

		try {
			setLoading(true);

			// Combine date and time into ISO strings
			const startDateTime = `${shiftData.date}T${shiftData.startTime}:00`;
			const endDateTime = `${shiftData.date}T${shiftData.endTime}:00`;

			await ShiftsAPI.create({
				scheduleId,
				locationId: locationData.locationId,
				employeeId: data.employeeId,
				startTime: startDateTime,
				endTime: endDateTime,
				role: "", // Empty string as roles only apply to employees
				notes: shiftData.notes,
			});

			toast.success("Shift created successfully");

			if (onComplete) {
				onComplete();
			}
		} catch (error) {
			console.error("Error creating shift:", error);
			toast.error("Failed to create shift");
		} finally {
			setLoading(false);
		}
	};

	function getCurrentDate() {
		const today = new Date();
		return today.toISOString().split("T")[0];
	}

	// Get selected location name
	const getLocationName = (locationId: string) => {
		const location = locations.find((loc) => loc.id === locationId);
		return location ? location.name : "Unknown Location";
	};

	// Get location by ID
	const getLocationById = (locationId: string) => {
		return locations.find((loc) => loc.id === locationId);
	};

	// Clear location search
	const clearLocationSearch = () => {
		setLocationSearchTerm("");
	};

	return (
		<div className="flex flex-col h-full">
			{/* Header with steps progress */}
			<div>
				<h2 className="text-xl font-semibold">Create New Shift</h2>

				<div className="grid grid-cols-3 gap-2 my-4">
					<div
						className={cn(
							"px-4 py-2 rounded-md font-medium text-center",
							step === "select-location"
								? "bg-primary text-primary-foreground"
								: "bg-muted text-muted-foreground"
						)}>
						1. Select Location
					</div>
					<div
						className={cn(
							"px-4 py-2 rounded-md font-medium text-center",
							step === "shift-details"
								? "bg-primary text-primary-foreground"
								: "bg-muted text-muted-foreground"
						)}>
						2. Shift Details
					</div>
					<div
						className={cn(
							"px-4 py-2 rounded-md font-medium text-center",
							step === "assign-employee"
								? "bg-primary text-primary-foreground"
								: "bg-muted text-muted-foreground"
						)}>
						3. Assign Employee
					</div>
				</div>
			</div>

			{/* Step 1: Select Location */}
			{step === "select-location" && (
				<div className="flex-1 overflow-y-auto">
					<form
						onSubmit={locationForm.handleSubmit(handleLocationSelect)}
						className="space-y-4 h-full flex flex-col">
						<div className="flex-1">
							<div>
								<h3 className="text-lg font-medium">Select a Location</h3>
								<p className="text-muted-foreground">
									Choose the location where this shift will take place
								</p>
							</div>

							{/* Location search */}
							<div className="my-4">
								<div className="flex items-center border rounded-md px-3 py-2 focus-within:ring-1 focus-within:ring-ring">
									<Search className="h-4 w-4 mr-2 text-muted-foreground" />
									<input
										type="text"
										placeholder="Search locations..."
										className="flex-1 outline-none bg-transparent"
										value={locationSearchTerm}
										onChange={(e) => setLocationSearchTerm(e.target.value)}
									/>
									{locationSearchTerm && (
										<button
											type="button"
											onClick={clearLocationSearch}
											className="text-muted-foreground hover:text-foreground">
											<X className="h-4 w-4" />
											<span className="sr-only">Clear search</span>
										</button>
									)}
								</div>
							</div>

							{/* Location list */}
							{loadingLocations ? (
								<div className="flex items-center justify-center h-[300px] text-muted-foreground">
									Loading locations...
								</div>
							) : (
								<div className="space-y-2 mt-4">
									{filteredLocations.length === 0 ? (
										<div className="text-center p-4 text-muted-foreground border rounded-md">
											No locations found matching "{locationSearchTerm}"
										</div>
									) : (
										filteredLocations.map((location) => (
											<label
												key={location.id}
												htmlFor={`location-${location.id}`}
												className={cn(
													"block border rounded-md p-3 cursor-pointer",
													locationForm.watch("locationId") === location.id
														? "border-primary bg-primary/5"
														: "hover:bg-accent/5"
												)}>
												<input
													type="radio"
													id={`location-${location.id}`}
													value={location.id}
													className="hidden"
													{...locationForm.register("locationId", {
														required: "Please select a location",
													})}
												/>
												<div className="flex items-center justify-between">
													<div className="flex items-center">
														<div
															className={cn(
																"h-8 w-8 rounded-md flex items-center justify-center mr-3",
																locationForm.watch("locationId") === location.id
																	? "bg-primary text-primary-foreground"
																	: "bg-muted"
															)}>
															<Building2 className="h-4 w-4" />
														</div>
														<div>
															<p className="font-medium">{location.name}</p>
															{location.address && (
																<p className="text-sm text-muted-foreground flex items-center">
																	<MapPin className="h-3 w-3 mr-1" />
																	{location.address}
																</p>
															)}
														</div>
													</div>
													{locationForm.watch("locationId") === location.id && (
														<Check className="h-4 w-4 text-primary" />
													)}
												</div>
											</label>
										))
									)}
								</div>
							)}

							{locationForm.formState.errors.locationId && (
								<p className="text-sm text-red-500">
									{locationForm.formState.errors.locationId.message}
								</p>
							)}
						</div>

						{/* Navigation Buttons */}
						<div className="flex justify-between mt-4">
							<Button
								type="button"
								variant="outline"
								onClick={onCancel}>
								Cancel
							</Button>
							<Button
								type="submit"
								disabled={!locationForm.watch("locationId")}>
								Next Step <ArrowRight className="ml-2 h-4 w-4" />
							</Button>
						</div>
					</form>
				</div>
			)}

			{/* Step 2: Shift Details */}
			{step === "shift-details" && locationData && (
				<div className="flex-1 overflow-y-auto">
					<form
						onSubmit={shiftForm.handleSubmit(handleShiftDetailsSubmit)}
						className="space-y-4 h-full flex flex-col">
						<div className="flex-1 space-y-4">
							{/* Selected location display */}
							<div className="p-3 rounded-md bg-muted/30">
								<div className="flex items-center">
									<div className="h-8 w-8 rounded-md bg-primary/20 text-primary flex items-center justify-center mr-3">
										<Building2 className="h-4 w-4" />
									</div>
									<div>
										{locationData && (
											<>
												<p className="font-medium">
													{getLocationById(locationData.locationId)?.name}
												</p>
												{getLocationById(locationData.locationId)?.address && (
													<p className="text-xs text-muted-foreground flex items-center">
														<MapPin className="h-3 w-3 mr-1" />
														{getLocationById(locationData.locationId)?.address}
													</p>
												)}
											</>
										)}
									</div>
								</div>
							</div>

							{/* Date Selection */}
							<div className="space-y-2">
								<Label htmlFor="date">
									Date <span className="text-red-500">*</span>
								</Label>
								<input
									type="hidden"
									{...shiftForm.register("date", {
										required: "Date is required",
									})}
								/>
								<Popover>
									<PopoverTrigger asChild>
										<Button
											variant="outline"
											className={cn(
												"w-full justify-start text-left font-normal",
												!selectedDate && "text-muted-foreground"
											)}
											type="button">
											<CalendarIcon className="mr-2 h-4 w-4" />
											{selectedDate ? (
												format(selectedDate, "PPP")
											) : (
												<span>Pick a date</span>
											)}
										</Button>
									</PopoverTrigger>
									<PopoverContent
										className="w-auto p-0"
										align="start">
										<Calendar
											mode="single"
											selected={selectedDate}
											onSelect={(date) => {
												setSelectedDate(date);
												if (date) {
													shiftForm.setValue(
														"date",
														format(date, "yyyy-MM-dd")
													);
												}
											}}
											initialFocus
										/>
									</PopoverContent>
								</Popover>
								{shiftForm.formState.errors.date && (
									<p className="text-sm text-red-500">
										{shiftForm.formState.errors.date.message}
									</p>
								)}
							</div>

							{/* Time Selection */}
							<div className="grid grid-cols-2 gap-4">
								<div className="space-y-2">
									<Label htmlFor="startTime">
										Start Time <span className="text-red-500">*</span>
									</Label>
									<Input
										id="startTime"
										type="time"
										{...shiftForm.register("startTime", {
											required: "Start time is required",
										})}
									/>
									{shiftForm.formState.errors.startTime && (
										<p className="text-sm text-red-500">
											{shiftForm.formState.errors.startTime.message}
										</p>
									)}
								</div>

								<div className="space-y-2">
									<Label htmlFor="endTime">
										End Time <span className="text-red-500">*</span>
									</Label>
									<Input
										id="endTime"
										type="time"
										{...shiftForm.register("endTime", {
											required: "End time is required",
										})}
									/>
									{shiftForm.formState.errors.endTime && (
										<p className="text-sm text-red-500">
											{shiftForm.formState.errors.endTime.message}
										</p>
									)}
								</div>
							</div>

							{/* Notes */}
							<div className="space-y-2">
								<Label htmlFor="notes">Notes (Optional)</Label>
								<Textarea
									id="notes"
									placeholder="Any additional information..."
									{...shiftForm.register("notes")}
								/>
							</div>
						</div>

						{/* Navigation Buttons */}
						<div className="flex justify-between mt-4">
							<Button
								type="button"
								variant="outline"
								onClick={() => setStep("select-location")}>
								<ArrowLeft className="mr-2 h-4 w-4" /> Back
							</Button>
							<Button
								type="submit"
								disabled={
									!shiftForm.watch("date") ||
									!shiftForm.watch("startTime") ||
									!shiftForm.watch("endTime")
								}>
								Next Step <ArrowRight className="ml-2 h-4 w-4" />
							</Button>
						</div>
					</form>
				</div>
			)}

			{/* Step 3: Assign Employee */}
			{step === "assign-employee" && locationData && shiftData && (
				<div className="flex-1 overflow-hidden flex flex-col">
					{/* Shift summary */}
					<div className="p-3 rounded-md bg-muted/30 mb-4">
						<div className="flex flex-wrap gap-3 text-sm">
							<div className="flex items-center">
								<MapPin className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
								<span>{getLocationName(locationData.locationId)}</span>
							</div>
							<div className="flex items-center">
								<CalendarIcon className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
								<span>{format(new Date(shiftData.date), "MMM d, yyyy")}</span>
							</div>
							<div className="flex items-center">
								<Clock className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
								<span>
									{shiftData.startTime} - {shiftData.endTime}
								</span>
							</div>
						</div>
					</div>

					<form
						onSubmit={employeeForm.handleSubmit(handleEmployeeAssignSubmit)}
						className="flex-1 flex flex-col">
						{/* Search and filter controls */}
						<div className="flex gap-3 mb-4">
							<div className="flex-1">
								<div className="flex items-center border rounded-md px-3 py-2 focus-within:ring-1 focus-within:ring-ring">
									<Search className="h-4 w-4 mr-2 text-muted-foreground" />
									<input
										type="text"
										placeholder="Search employees..."
										className="flex-1 outline-none bg-transparent"
										value={searchTerm}
										onChange={(e) => setSearchTerm(e.target.value)}
									/>
								</div>
							</div>
							<Select
								value={searchFilter}
								onValueChange={(value) =>
									setSearchFilter(value as "name" | "role" | "all")
								}>
								<SelectTrigger className="w-[140px]">
									<SelectValue placeholder="Filter by" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="all">All Fields</SelectItem>
									<SelectItem value="name">Name</SelectItem>
									<SelectItem value="role">Role</SelectItem>
								</SelectContent>
							</Select>
						</div>

						{/* Employee list */}
						<div className="flex-1 overflow-y-auto">
							{loadingEmployees ? (
								<div className="p-4 text-center text-muted-foreground">
									Loading employees...
								</div>
							) : filteredEmployees.length === 0 ? (
								<div className="p-4 text-center text-muted-foreground border rounded-md">
									No employees match your search
								</div>
							) : (
								<div className="space-y-2">
									{filteredEmployees.map((employee) => (
										<label
											key={employee.id}
											htmlFor={`employee-${employee.id}`}
											className={cn(
												"block border rounded-md p-3 cursor-pointer",
												employeeForm.watch("employeeId") === employee.id
													? "border-primary bg-primary/5"
													: "hover:bg-accent/5"
											)}>
											<input
												type="radio"
												id={`employee-${employee.id}`}
												value={employee.id}
												className="hidden"
												{...employeeForm.register("employeeId")}
											/>
											<div className="flex items-center justify-between">
												<div className="flex items-center">
													<div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center mr-3 text-primary">
														{employee.name.charAt(0)}
													</div>
													<div>
														<p className="font-medium">{employee.name}</p>
														<p className="text-sm text-muted-foreground">
															{employee.role || "No role"}
														</p>
													</div>
												</div>
												{employeeForm.watch("employeeId") === employee.id && (
													<Check className="h-4 w-4 text-primary" />
												)}
											</div>
										</label>
									))}
								</div>
							)}
						</div>

						{/* Create shift without employee option */}
						<div className="mt-4 text-center">
							<Button
								type="button"
								variant="ghost"
								size="sm"
								onClick={() => employeeForm.setValue("employeeId", "")}>
								Create shift without assigning an employee
							</Button>
						</div>

						{/* Error message */}
						{employeeForm.formState.errors.employeeId && (
							<p className="text-sm text-red-500">
								{employeeForm.formState.errors.employeeId.message}
							</p>
						)}

						{/* Navigation buttons */}
						<div className="flex justify-between mt-4">
							<Button
								type="button"
								variant="outline"
								onClick={() => setStep("shift-details")}>
								<ArrowLeft className="mr-2 h-4 w-4" /> Back
							</Button>
							<Button
								type="submit"
								disabled={loading}>
								{loading ? "Creating..." : "Create Shift"}
							</Button>
						</div>
					</form>
				</div>
			)}
		</div>
	);
}
