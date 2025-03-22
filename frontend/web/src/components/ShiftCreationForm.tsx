import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { CalendarIcon, MapPin } from "lucide-react";
import { useForm } from "react-hook-form";
import {
	ShiftsAPI,
	EmployeesAPI,
	Employee,
	LocationsAPI,
	Location,
} from "../api";
import { useEffect } from "react";
import { cn } from "../lib/utils";

// UI Components
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "./ui/form";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "./ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Calendar } from "./ui/calendar";

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
	const [loading, setLoading] = useState(false);
	const [employees, setEmployees] = useState<Employee[]>([]);
	const [locations, setLocations] = useState<Location[]>([]);
	const [loadingEmployees, setLoadingEmployees] = useState(false);
	const [loadingLocations, setLoadingLocations] = useState(false);

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
				toast.error("Failed to load locations");
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
				toast.error("Failed to load employees");
			} finally {
				setLoadingEmployees(false);
			}
		}

		fetchEmployees();
	}, [organizationId]);

	const onSubmit = async (data: ShiftFormValues) => {
		try {
			setLoading(true);

			// Combine date and time into ISO strings
			const startDateTime = `${format(data.date, "yyyy-MM-dd")}T${
				data.startTime
			}:00`;
			const endDateTime = `${format(data.date, "yyyy-MM-dd")}T${
				data.endTime
			}:00`;

			await ShiftsAPI.create({
				scheduleId,
				locationId: data.locationId,
				employeeId: data.employeeId,
				startTime: startDateTime,
				endTime: endDateTime,
				role: data.role,
				notes: data.notes,
			});

			toast.success("Shift created successfully");

			if (onShiftCreated) {
				onShiftCreated();
			}
		} catch (error) {
			console.error("Error creating shift:", error);
			toast.error("Failed to create shift");
		} finally {
			setLoading(false);
		}
	};

	return (
		<Form {...form}>
			<form
				onSubmit={form.handleSubmit(onSubmit)}
				className="space-y-4">
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					{/* Date Selection */}
					<FormField
						control={form.control}
						name="date"
						render={({ field }) => (
							<FormItem className="flex flex-col">
								<FormLabel>Date</FormLabel>
								<Popover>
									<PopoverTrigger asChild>
										<FormControl>
											<Button
												variant="outline"
												className={cn(
													"w-full pl-3 text-left font-normal",
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
									<PopoverContent
										className="w-auto p-0"
										align="start">
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

				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					{/* Start Time */}
					<FormField
						control={form.control}
						name="startTime"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Start Time</FormLabel>
								<FormControl>
									<Input
										type="time"
										{...field}
									/>
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
									<Input
										type="time"
										{...field}
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
				</div>

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
						<FormItem>
							<FormLabel>Role (Optional)</FormLabel>
							<FormControl>
								<Input
									placeholder="e.g., Shift Manager, Server"
									{...field}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				{/* Notes */}
				<FormField
					control={form.control}
					name="notes"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Notes (Optional)</FormLabel>
							<FormControl>
								<Textarea
									placeholder="Any special instructions or details about this shift"
									className="h-20"
									{...field}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<Button
					type="submit"
					disabled={loading}
					className="w-full">
					{loading ? "Creating Shift..." : "Create Shift"}
				</Button>
			</form>
		</Form>
	);
}
