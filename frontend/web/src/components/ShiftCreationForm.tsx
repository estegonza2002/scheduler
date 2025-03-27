import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { CalendarIcon, Clock, ClipboardList, StickyNote } from "lucide-react";
import { useForm } from "react-hook-form";
import {
	ShiftsAPI,
	EmployeesAPI,
	Employee,
	LocationsAPI,
	Location,
} from "@/api";
import { useEffect } from "react";
import { cn } from "@/lib/utils";

// UI Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { ContentContainer } from "@/components/ui/content-container";
import { ContentSection } from "@/components/ui/content-section";
import { FormSection } from "@/components/ui/form-section";
import { LoadingState } from "@/components/ui/loading-state";

// Form schema
const shiftFormSchema = z.object({
	locationId: z.string().min(1, "Please select a location"),
	employeeId: z.string().min(1, "Please select an employee"),
	date: z.date({
		required_error: "Please select a date",
	}),
	startTime: z.string().min(1, "Please enter a start time"),
	endTime: z.string().min(1, "Please enter an end time"),
	role: z.string().optional(),
	notes: z.string().optional(),
});

type ShiftFormValues = z.infer<typeof shiftFormSchema>;

interface ShiftCreationFormProps {
	scheduleId: string;
	organizationId: string;
	initialDate?: Date;
	onShiftCreated?: () => void;
}

export function ShiftCreationForm({
	scheduleId,
	organizationId,
	initialDate,
	onShiftCreated,
}: ShiftCreationFormProps) {
	const [employees, setEmployees] = useState<Employee[]>([]);
	const [locations, setLocations] = useState<Location[]>([]);
	const [loadingEmployees, setLoadingEmployees] = useState(false);
	const [loadingLocations, setLoadingLocations] = useState(false);
	const [submitting, setSubmitting] = useState(false);

	// Initialize form
	const form = useForm<ShiftFormValues>({
		resolver: zodResolver(shiftFormSchema),
		defaultValues: {
			locationId: "",
			employeeId: "",
			date: initialDate || new Date(),
			startTime: "09:00",
			endTime: "17:00",
			role: "",
			notes: "",
		},
	});

	// Update form when initialDate changes
	useEffect(() => {
		if (initialDate) {
			form.setValue("date", initialDate);
		}
	}, [initialDate, form]);

	// Fetch locations
	useEffect(() => {
		async function fetchLocations() {
			try {
				setLoadingLocations(true);
				const locationList = await LocationsAPI.getAll(organizationId);
				setLocations(locationList);
			} catch (error) {
				console.error("Error fetching locations:", error);
				// Don't show toast for empty locations - expected for new users
			} finally {
				setLoadingLocations(false);
			}
		}

		fetchLocations();
	}, [organizationId]);

	// Fetch employees
	useEffect(() => {
		async function fetchEmployees() {
			try {
				setLoadingEmployees(true);
				const employeeList = await EmployeesAPI.getAll(organizationId);
				setEmployees(employeeList);
			} catch (error) {
				console.error("Error fetching employees:", error);
				// Don't show toast for empty employees - expected for new users
			} finally {
				setLoadingEmployees(false);
			}
		}

		fetchEmployees();
	}, [organizationId]);

	const onSubmit = async (data: ShiftFormValues) => {
		try {
			setSubmitting(true);

			// Combine date and time into ISO strings
			const startDateTime = `${format(data.date, "yyyy-MM-dd")}T${
				data.startTime
			}:00`;
			const endDateTime = `${format(data.date, "yyyy-MM-dd")}T${
				data.endTime
			}:00`;

			await ShiftsAPI.createShift({
				parent_shift_id: scheduleId,
				is_schedule: false,
				organization_id: organizationId,
				location_id: data.locationId,
				user_id: data.employeeId,
				start_time: startDateTime,
				end_time: endDateTime,
				position: data.role,
				description: data.notes,
			});

			toast.success("Shift created successfully");

			if (onShiftCreated) {
				onShiftCreated();
			}
		} catch (error) {
			console.error("Error creating shift:", error);
			toast.error("Failed to create shift");
		} finally {
			setSubmitting(false);
		}
	};

	// Check if we're loading initial data
	const isLoading = loadingEmployees || loadingLocations;

	if (isLoading) {
		return (
			<LoadingState
				message="Loading form data..."
				type="spinner"
			/>
		);
	}

	return (
		<ContentContainer>
			<ContentSection
				title="Create New Shift"
				description="Schedule a new shift for an employee">
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)}>
						<FormSection
							title="Shift Date & Location"
							description="Select when and where the shift will take place">
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								{/* Date Selection */}
								<FormField
									control={form.control}
									name="date"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Date</FormLabel>
											<Popover>
												<PopoverTrigger asChild>
													<FormControl>
														<Button
															variant="outline"
															className={cn(
																!field.value && "text-muted-foreground"
															)}>
															{field.value ? (
																format(field.value, "PPP")
															) : (
																<span>Pick a date</span>
															)}
															<CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
														</Button>
													</FormControl>
												</PopoverTrigger>
												<PopoverContent align="start">
													<Calendar
														mode="single"
														selected={field.value}
														onSelect={field.onChange}
														disabled={(date) =>
															date < new Date(new Date().setHours(0, 0, 0, 0))
														}
														initialFocus
													/>
												</PopoverContent>
											</Popover>
											<FormMessage />
										</FormItem>
									)}
								/>

								{/* Location Selection */}
								<FormField
									control={form.control}
									name="locationId"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Location</FormLabel>
											<Select
												onValueChange={field.onChange}
												defaultValue={field.value}>
												<FormControl>
													<SelectTrigger>
														<SelectValue placeholder="Select a location" />
													</SelectTrigger>
												</FormControl>
												<SelectContent>
													{locations.map((location) => (
														<SelectItem
															key={location.id}
															value={location.id}>
															{location.name}
														</SelectItem>
													))}
												</SelectContent>
											</Select>
											<FormMessage />
										</FormItem>
									)}
								/>
							</div>
						</FormSection>

						<FormSection
							title="Shift Time"
							description="Set the start and end times for this shift">
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								{/* Start Time */}
								<FormField
									control={form.control}
									name="startTime"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Start Time</FormLabel>
											<FormControl>
												<div className="flex items-center">
													<Clock className="mr-2 h-4 w-4 text-muted-foreground" />
													<Input
														type="time"
														{...field}
													/>
												</div>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								{/* End Time */}
								<FormField
									control={form.control}
									name="endTime"
									render={({ field }) => (
										<FormItem>
											<FormLabel>End Time</FormLabel>
											<FormControl>
												<div className="flex items-center">
													<Clock className="mr-2 h-4 w-4 text-muted-foreground" />
													<Input
														type="time"
														{...field}
													/>
												</div>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							</div>
						</FormSection>

						<FormSection
							title="Employee Assignment"
							description="Assign an employee to this shift">
							{/* Employee Selection */}
							<FormField
								control={form.control}
								name="employeeId"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Employee</FormLabel>
										<Select
											onValueChange={field.onChange}
											defaultValue={field.value}>
											<FormControl>
												<SelectTrigger>
													<SelectValue placeholder="Select an employee" />
												</SelectTrigger>
											</FormControl>
											<SelectContent>
												{employees.map((employee) => (
													<SelectItem
														key={employee.id}
														value={employee.id}>
														{employee.name}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
										<FormMessage />
									</FormItem>
								)}
							/>

							{/* Role */}
							<FormField
								control={form.control}
								name="role"
								render={({ field }) => (
									<FormItem className="mt-4">
										<FormLabel>Role (Optional)</FormLabel>
										<FormControl>
											<div className="flex items-center">
												<ClipboardList className="mr-2 h-4 w-4 text-muted-foreground" />
												<Input
													placeholder="e.g., Shift Manager, Server"
													{...field}
												/>
											</div>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</FormSection>

						<FormSection
							title="Additional Information"
							description="Add any notes or special instructions for this shift">
							{/* Notes */}
							<FormField
								control={form.control}
								name="notes"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Notes (Optional)</FormLabel>
										<FormControl>
											<div className="flex items-start">
												<StickyNote className="mr-2 h-4 w-4 mt-2 text-muted-foreground" />
												<Textarea
													placeholder="Any special instructions or details about this shift"
													{...field}
												/>
											</div>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</FormSection>

						<div className="mt-6">
							<Button
								type="submit"
								disabled={submitting}
								className="w-full">
								{submitting ? "Creating Shift..." : "Create Shift"}
							</Button>
						</div>
					</form>
				</Form>
			</ContentSection>
		</ContentContainer>
	);
}
