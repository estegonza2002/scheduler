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
const POSITIONS = [
	"Manager",
	"Supervisor",
	"Team Lead",
	"Developer",
	"Designer",
	"Analyst",
	"Other",
];

type WizardStep =
	| "basic-information"
	| "contact-information"
	| "employment-details"
	| "additional-information";

const STEPS = [
	{ title: "Basic Information", step: "basic-information" as const },
	{ title: "Contact Information", step: "contact-information" as const },
	{ title: "Employment Details", step: "employment-details" as const },
	{ title: "Additional Information", step: "additional-information" as const },
] as const;

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
	const [step, setStep] = useState<WizardStep>("basic-information");
	const [isSubmitting, setIsSubmitting] = useState(false);
	const currentStepIndex = STEPS.findIndex((s) => s.step === step);
	const isFirstStep = currentStepIndex === 0;
	const isLastStep = currentStepIndex === STEPS.length - 1;

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
			hourlyRate: employee?.hourlyRate || 0,
			hireDate: employee?.hireDate || "",
			emergencyContact: employee?.emergencyContact || "",
			notes: employee?.notes || "",
			avatar: employee?.avatar,
			status: employee?.status,
			isOnline: employee?.isOnline,
			lastActive: employee?.lastActive,
			custom_properties: employee?.custom_properties,
		},
	});

	const handleSubmit = async (data: Employee) => {
		// Sanitize the data to prevent empty string date fields
		const sanitizedData = {
			...data,
			hireDate:
				data.hireDate && data.hireDate.trim() !== ""
					? data.hireDate
					: undefined,
		};

		if (isLastStep) {
			setIsSubmitting(true);
			try {
				await onSubmit(sanitizedData);
				onOpenChange?.(false);
			} finally {
				setIsSubmitting(false);
			}
		} else {
			// Validate required fields for the current step
			const errors = await form.trigger();
			if (errors) {
				setStep(STEPS[currentStepIndex + 1].step);
			}
			// If validation fails, the form will show error messages
		}
	};

	const renderStepContent = () => {
		switch (step) {
			case "basic-information":
				return (
					<FormSection>
						<div className="grid grid-cols-1 gap-6">
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
						</div>
					</FormSection>
				);

			case "contact-information":
				return (
					<FormSection>
						<div className="grid grid-cols-1 gap-6">
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
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>
					</FormSection>
				);

			case "employment-details":
				return (
					<FormSection>
						<div className="grid grid-cols-1 gap-6">
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
								render={({ field }) => (
									<FormItem>
										<FormLabel>Hourly Rate ($)</FormLabel>
										<FormControl>
											<Input
												type="number"
												step="0.01"
												min="0"
												placeholder="15.50"
												{...field}
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
						</div>
					</FormSection>
				);

			case "additional-information":
				return (
					<FormSection>
						<div className="grid grid-cols-1 gap-6">
							<FormField
								control={form.control}
								name="emergencyContact"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Emergency Contact</FormLabel>
										<FormDescription>
											Name, relationship, and phone number of emergency contact
										</FormDescription>
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
										<FormDescription>
											Any additional information about this employee
										</FormDescription>
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
						</div>
					</FormSection>
				);
		}
	};

	return (
		<Dialog
			open={open}
			onOpenChange={onOpenChange}>
			<DialogTrigger asChild>{/* Trigger content */}</DialogTrigger>
			<DialogContent className={cn("sm:max-w-[600px]")}>
				<Form {...form}>
					<form onSubmit={form.handleSubmit(handleSubmit)}>
						<DialogHeader>
							<DialogTitle>
								{employee ? "Edit Employee" : "Add New Employee"}
							</DialogTitle>
							<UiDialogDescription>
								{STEPS[currentStepIndex].title} - Step {currentStepIndex + 1} of{" "}
								{STEPS.length}
							</UiDialogDescription>
						</DialogHeader>

						{renderStepContent()}

						<UiDialogFooter>
							<div className="flex w-full justify-between">
								<Button
									type="button"
									variant="outline"
									onClick={() => {
										if (!isFirstStep) {
											setStep(STEPS[currentStepIndex - 1].step);
										}
									}}
									disabled={isFirstStep}>
									Back
								</Button>
								<div className="flex space-x-2">
									{!isLastStep ? (
										<Button type="submit">Next</Button>
									) : (
										<Button
											type="submit"
											disabled={isSubmitting}>
											{isSubmitting && (
												<Loader2 className="mr-2 h-4 w-4 animate-spin" />
											)}
											{employee ? "Save Changes" : "Add Employee"}
										</Button>
									)}
								</div>
							</div>
						</UiDialogFooter>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}
