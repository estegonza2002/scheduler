import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Employee, employeeSchema } from "@/lib/validations/employee";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { FormPhoneInput } from "@/components/ui/form-phone-input";
import { FormSection } from "@/components/ui/form-section";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
	DialogDescription as UiDialogDescription,
	DialogFooter as UiDialogFooter,
	DialogHeader as UiDialogHeader,
	DialogTrigger,
} from "@/components/ui/dialog";

// Define available positions
const POSITIONS = ["Manager", "Staff"];

interface EmployeeDialogProps {
	employee?: Employee;
	open?: boolean;
	onOpenChange?: (open: boolean) => void;
	onSubmit: (data: Employee) => Promise<void>;
}

export function EmployeeDialog({
	open,
	onOpenChange,
	employee,
	onSubmit,
}: EmployeeDialogProps) {
	const [isSubmitting, setIsSubmitting] = useState(false);

	const form = useForm<Employee>({
		resolver: zodResolver(employeeSchema),
		defaultValues: {
			id: employee?.id,
			organizationId: employee?.organizationId,
			name: employee?.name || "",
			email: employee?.email || "",
			phone: employee?.phone || "",
			address: employee?.address || "",
			position: employee?.position || "",
			hourlyRate: employee?.hourlyRate ?? 0,
			hireDate: employee?.hireDate || "",
			emergencyContact: employee?.emergencyContact || "",
			notes: employee?.notes || "",
			avatar: employee?.avatar,
			status: employee?.status || "invited",
			isOnline: employee?.isOnline,
			lastActive: employee?.lastActive,
			custom_properties: employee?.custom_properties,
		},
	});

	const handleSubmit = async (data: Employee) => {
		console.log("Form submission with data:", data);

		// Sanitize the data to prevent empty string date fields
		const sanitizedData = {
			...data,
			hireDate:
				data.hireDate && data.hireDate.trim() !== ""
					? data.hireDate
					: undefined,
			// Ensure new employees have invited status
			status: employee ? data.status : "invited",
		};

		setIsSubmitting(true);
		try {
			await onSubmit(sanitizedData);
			onOpenChange?.(false);
		} catch (error) {
			console.error("Error submitting form:", error);
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<Dialog
			open={open}
			onOpenChange={onOpenChange}>
			<DialogTrigger asChild>{/* Trigger content */}</DialogTrigger>
			<DialogContent className="max-h-[90vh] overflow-y-auto">
				<Form {...form}>
					<form onSubmit={form.handleSubmit(handleSubmit)}>
						<DialogHeader>
							<DialogTitle>
								{employee ? "Edit Employee" : "Add New Employee"}
							</DialogTitle>
						</DialogHeader>

						{/* Basic Information */}
						<FormSection className="mt-6 mb-4">
							<FormField
								control={form.control}
								name="name"
								render={({ field }) => (
									<FormItem>
										<FormLabel>
											Full Name <span className="text-destructive">*</span>
										</FormLabel>
										<FormControl>
											<Input
												placeholder="John Doe"
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="email"
								render={({ field }) => (
									<FormItem>
										<FormLabel>
											Email <span className="text-destructive">*</span>
										</FormLabel>
										<FormControl>
											<Input
												type="email"
												placeholder="john@example.com"
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</FormSection>

						{/* Contact Information */}
						<FormSection className="mb-4">
							<FormField
								control={form.control}
								name="phone"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Phone Number</FormLabel>
										<FormControl>
											<FormPhoneInput
												placeholder="Enter phone number"
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="address"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Address</FormLabel>
										<FormControl>
											<Input
												placeholder="123 Main St, City, State"
												autoComplete="new-address"
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</FormSection>

						{/* Employment Details */}
						<FormSection className="mb-4">
							<FormField
								control={form.control}
								name="position"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Position</FormLabel>
										<FormControl>
											<Select
												onValueChange={field.onChange}
												value={field.value || ""}>
												<SelectTrigger className="w-full">
													<SelectValue placeholder="Select a position" />
												</SelectTrigger>
												<SelectContent>
													{POSITIONS.map((position) => (
														<SelectItem
															key={position}
															value={position}>
															{position}
														</SelectItem>
													))}
												</SelectContent>
											</Select>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="hourlyRate"
								render={({ field: { onChange, value, ...fieldProps } }) => (
									<FormItem>
										<FormLabel>Hourly Rate ($)</FormLabel>
										<FormControl>
											<Input
												type="number"
												step="0.01"
												min="0"
												placeholder="15.50"
												onChange={(e) => {
													const val = e.target.value;
													onChange(val === "" ? 0 : parseFloat(val));
												}}
												value={value === 0 ? "" : value}
												{...fieldProps}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="hireDate"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Hire Date</FormLabel>
										<FormControl>
											<Input
												type="date"
												{...field}
												value={field.value || ""}
											/>
										</FormControl>
										<FormDescription className="text-xs">
											Leave blank if not applicable.
										</FormDescription>
										<FormMessage />
									</FormItem>
								)}
							/>
						</FormSection>

						{/* Additional Information */}
						<FormSection className="mb-4">
							<FormField
								control={form.control}
								name="emergencyContact"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Emergency Contact</FormLabel>

										<FormControl>
											<Input
												placeholder="Jane Doe (Spouse) - 555-789-1234"
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="notes"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Notes</FormLabel>

										<FormControl>
											<Textarea
												placeholder="Additional information about this employee..."
												className="h-24"
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</FormSection>

						<UiDialogFooter className="mt-6">
							<Button
								type="submit"
								disabled={isSubmitting}>
								{isSubmitting && (
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
								)}
								{employee ? "Save Changes" : "Add Employee"}
							</Button>
						</UiDialogFooter>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}
