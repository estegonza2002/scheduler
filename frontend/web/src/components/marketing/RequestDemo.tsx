import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from "@/components/ui/sheet";
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
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Check, Loader2, CalendarIcon } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useOrganization } from "@/lib/organization";
import { DatePicker } from "@/components/ui/date-picker";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { addDays, format, isWeekend, isAfter } from "date-fns";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// Add CSS class for required fields
const requiredFieldClass =
	"after:content-['*'] after:ml-0.5 after:text-red-500";

// Form validation schema
const demoFormSchema = z.object({
	name: z
		.string()
		.min(2, "Name must be at least 2 characters")
		.nonempty("Name is required"),
	email: z
		.string()
		.email("Invalid email address")
		.nonempty("Email is required"),
	company: z
		.string()
		.min(1, "Company name is required")
		.nonempty("Company is required"),
	phone: z.string().optional(),
	employees: z.string().min(1, "Please select the number of employees"),
	message: z.string().optional(),
	demoDate: z.date({
		required_error: "Please select a date for your demo",
	}),
	demoTime: z.string({
		required_error: "Please select a time for your demo",
	}),
});

type DemoFormValues = z.infer<typeof demoFormSchema>;

type RequestDemoProps = {
	children: React.ReactNode;
	variant?: "default" | "outline";
	size?: "default" | "sm" | "lg";
};

export function RequestDemo({
	children,
	variant = "default",
	size = "default",
}: RequestDemoProps) {
	const { user } = useAuth();
	const { organization } = useOrganization();
	const [open, setOpen] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [isSubmitted, setIsSubmitted] = useState(false);
	const [availableTimes, setAvailableTimes] = useState<string[]>([]);

	// We're defining business hours from 9AM to 5PM EST
	const businessHours = [
		"9:00 AM",
		"10:00 AM",
		"11:00 AM",
		"12:00 PM",
		"1:00 PM",
		"2:00 PM",
		"3:00 PM",
		"4:00 PM",
		"5:00 PM",
	];

	const form = useForm<DemoFormValues>({
		resolver: zodResolver(demoFormSchema),
		defaultValues: {
			name: "",
			email: "",
			company: "",
			phone: "",
			employees: "",
			message: "",
			demoDate: undefined,
			demoTime: "",
		},
		mode: "onChange", // Validate on change for immediate feedback
	});

	// Prefill form with user data if logged in
	useEffect(() => {
		if (user) {
			const firstName = user.user_metadata?.firstName || "";
			const lastName = user.user_metadata?.lastName || "";
			const fullName =
				`${firstName} ${lastName}`.trim() ||
				user.user_metadata?.full_name ||
				"";

			form.setValue("name", fullName);
			if (user.email) form.setValue("email", user.email);
			if (user.user_metadata?.phone)
				form.setValue("phone", user.user_metadata.phone);

			// Use organization name if available, otherwise fall back to user metadata
			if (organization?.name) {
				form.setValue("company", organization.name);
			} else if (user.user_metadata?.company) {
				form.setValue("company", user.user_metadata.company);
			} else if (user.user_metadata?.organization_name) {
				form.setValue("company", user.user_metadata.organization_name);
			}

			// Make sure message field is always empty
			form.setValue("message", "");
		}
	}, [user, organization, form]);

	// Update available times when date changes
	useEffect(() => {
		const selectedDate = form.watch("demoDate");

		if (!selectedDate) {
			setAvailableTimes([]);
			return;
		}

		// Check if it's a weekend
		if (isWeekend(selectedDate)) {
			setAvailableTimes([]);
			form.setValue("demoTime", "");
			return;
		}

		// Check if it's today and apply buffer
		const now = new Date();
		const isToday =
			selectedDate.getDate() === now.getDate() &&
			selectedDate.getMonth() === now.getMonth() &&
			selectedDate.getFullYear() === now.getFullYear();

		// Start with all business hours
		let times = [...businessHours];

		if (isToday) {
			const currentHour = now.getHours();
			const bufferHour = currentHour + 5; // 5-hour buffer

			// Filter out times that are within the buffer
			times = times.filter((timeStr) => {
				// Parse hour from time string
				let hour = 0;
				if (timeStr.includes("AM")) {
					hour = parseInt(timeStr.split(":")[0]);
					if (hour === 12) hour = 0; // 12 AM is hour 0
				} else {
					hour = parseInt(timeStr.split(":")[0]);
					if (hour !== 12) hour += 12; // Convert to 24-hour format (except 12 PM)
				}

				return hour >= bufferHour;
			});
		}

		setAvailableTimes(times);

		// Clear time selection if no available times
		if (times.length === 0 && form.getValues("demoTime")) {
			form.setValue("demoTime", "");
		}
	}, [form.watch("demoDate")]);

	const onSubmit = async (data: DemoFormValues) => {
		setIsSubmitting(true);

		try {
			// Here you would typically send the data to your API
			console.log("Form data submitted:", data);

			// Simulate API call
			await new Promise((resolve) => setTimeout(resolve, 1500));

			setIsSubmitted(true);

			// Reset form after successful submission
			setTimeout(() => {
				form.reset();
				setIsSubmitted(false);
				setOpen(false);
			}, 2000);
		} catch (error) {
			console.error("Error submitting form:", error);
			// Show error message to user
			toast?.error?.("Failed to schedule your demo. Please try again.");
		} finally {
			setIsSubmitting(false);
		}
	};

	// Simple function to disable weekends and past dates
	const isDateDisabled = (date: Date) => {
		const now = new Date();

		// Check if it's a weekend
		if (isWeekend(date)) return true;

		// Check if it's in the past
		if (date < now) return true;

		// Check if it's today but all available hours are in the past
		const isToday =
			date.getDate() === now.getDate() &&
			date.getMonth() === now.getMonth() &&
			date.getFullYear() === now.getFullYear();

		if (isToday) {
			const currentHour = now.getHours();
			// If current hour + 5 hour buffer is after or equal to 5 PM (17), disable today
			if (currentHour + 5 >= 17) return true;
		}

		return false;
	};

	return (
		<Sheet
			open={open}
			onOpenChange={setOpen}>
			<SheetTrigger asChild>{children}</SheetTrigger>
			<SheetContent className="w-full sm:max-w-md md:max-w-lg overflow-y-auto">
				<SheetHeader className="mb-6">
					<SheetTitle>Request a Demo</SheetTitle>
					<SheetDescription>
						See how our scheduling platform can streamline your operations and
						save you time. One of our experts will show you all the key features
						tailored to your business needs.
					</SheetDescription>
				</SheetHeader>

				{isSubmitted ? (
					<div className="flex flex-col items-center justify-center h-[60vh]">
						<div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center mb-4">
							<Check className="h-6 w-6 text-green-600" />
						</div>
						<h3 className="text-xl font-semibold mb-2">Thank You!</h3>
						<p className="text-center text-muted-foreground">
							Your demo has been scheduled. We look forward to speaking with
							you!
						</p>
					</div>
				) : (
					<Form {...form}>
						<form
							onSubmit={form.handleSubmit(onSubmit, (errors) => {
								console.error("Form validation errors:", errors);
								// Scroll to the first error
								const firstError = Object.keys(errors)[0];
								if (firstError) {
									const element = document.querySelector(
										`[name="${firstError}"]`
									);
									if (element) {
										element.scrollIntoView({
											behavior: "smooth",
											block: "center",
										});
									}
								}
							})}
							className="space-y-6">
							{/* Demo Scheduling Section */}
							<div className="bg-muted/50 p-4 rounded-lg space-y-4 mb-2">
								<h3 className="font-medium">Schedule Your Demo</h3>
								<div className="space-y-4">
									<FormField
										control={form.control}
										name="demoDate"
										render={({ field }) => (
											<FormItem className="flex flex-col">
												<FormLabel className={cn(requiredFieldClass)}>
													Date
												</FormLabel>
												<DatePicker
													value={field.value}
													onChange={field.onChange}
													placeholder="Select date"
													calendarProps={{
														disabled: [isDateDisabled],
														fromMonth: new Date(),
													}}
												/>
												<FormDescription></FormDescription>
												<FormMessage />
											</FormItem>
										)}
									/>

									<FormField
										control={form.control}
										name="demoTime"
										render={({ field }) => (
											<FormItem>
												<FormLabel className={cn(requiredFieldClass)}>
													Time (EST)
												</FormLabel>
												<Select
													disabled={
														!form.watch("demoDate") ||
														availableTimes.length === 0
													}
													onValueChange={field.onChange}
													value={field.value}>
													<FormControl>
														<SelectTrigger>
															<SelectValue placeholder="Select time" />
														</SelectTrigger>
													</FormControl>
													<SelectContent>
														{availableTimes.length > 0 ? (
															availableTimes.map((time) => (
																<SelectItem
																	key={time}
																	value={time}>
																	{time}
																</SelectItem>
															))
														) : form.watch("demoDate") ? (
															<SelectItem
																disabled
																value="no-times">
																No times available
															</SelectItem>
														) : (
															<SelectItem
																disabled
																value="select-date">
																Select a date first
															</SelectItem>
														)}
													</SelectContent>
												</Select>
												<FormDescription></FormDescription>
												<FormMessage />
											</FormItem>
										)}
									/>
								</div>
							</div>

							{/* Contact Information Section */}
							<div className="space-y-4">
								<h3 className="font-medium">Your Information</h3>

								{user && (
									<div className="bg-muted/30 rounded-lg p-4 mb-2">
										<div className="grid gap-2 text-sm">
											<div className="flex justify-between">
												<span className="text-muted-foreground">Name:</span>
												<span className="font-medium">
													{form.getValues("name")}
												</span>
											</div>
											<div className="flex justify-between">
												<span className="text-muted-foreground">Email:</span>
												<span className="font-medium">
													{form.getValues("email")}
												</span>
											</div>
											<div className="flex justify-between">
												<span className="text-muted-foreground">Company:</span>
												<span className="font-medium">
													{form.getValues("company")}
												</span>
											</div>
											{form.getValues("phone") && (
												<div className="flex justify-between">
													<span className="text-muted-foreground">Phone:</span>
													<span className="font-medium">
														{form.getValues("phone")}
													</span>
												</div>
											)}
										</div>
									</div>
								)}

								{!user ? (
									<>
										<FormField
											control={form.control}
											name="name"
											render={({ field }) => (
												<FormItem>
													<FormLabel className={cn(requiredFieldClass)}>
														Name
													</FormLabel>
													<FormControl>
														<Input
															placeholder="Your full name"
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
													<FormLabel className={cn(requiredFieldClass)}>
														Email
													</FormLabel>
													<FormControl>
														<Input
															placeholder="you@company.com"
															type="email"
															{...field}
														/>
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>

										<FormField
											control={form.control}
											name="company"
											render={({ field }) => (
												<FormItem>
													<FormLabel className={cn(requiredFieldClass)}>
														Company
													</FormLabel>
													<FormControl>
														<Input
															placeholder="Your company name"
															{...field}
														/>
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>

										<FormField
											control={form.control}
											name="phone"
											render={({ field }) => (
												<FormItem>
													<FormLabel>Phone (optional)</FormLabel>
													<FormControl>
														<Input
															placeholder="(123) 456-7890"
															{...field}
														/>
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>
									</>
								) : (
									<>
										<input
											type="hidden"
											name="name"
											value={form.getValues("name")}
										/>
										<input
											type="hidden"
											name="email"
											value={form.getValues("email")}
										/>
										<input
											type="hidden"
											name="company"
											value={form.getValues("company")}
										/>
										<input
											type="hidden"
											name="phone"
											value={form.getValues("phone")}
										/>
									</>
								)}

								<FormField
									control={form.control}
									name="employees"
									render={({ field }) => (
										<FormItem>
											<FormLabel className={cn(requiredFieldClass)}>
												Number of Employees
											</FormLabel>
											<FormControl>
												<select
													className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
													{...field}>
													<option value="">Select team size</option>
													<option value="1-5">1-5 employees</option>
													<option value="6-20">6-20 employees</option>
													<option value="21-50">21-50 employees</option>
													<option value="51-200">51-200 employees</option>
													<option value="201+">201+ employees</option>
												</select>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name="message"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Message (optional)</FormLabel>
											<FormControl>
												<Textarea
													placeholder="Tell us about your specific needs or questions"
													className="min-h-[100px]"
													{...field}
												/>
											</FormControl>
											<FormDescription></FormDescription>
											<FormMessage />
										</FormItem>
									)}
								/>
							</div>

							<Button
								type="submit"
								className="w-full"
								disabled={isSubmitting}>
								{isSubmitting ? (
									<>
										<Loader2 className="mr-2 h-4 w-4 animate-spin" />
										Scheduling...
									</>
								) : (
									"Schedule Demo"
								)}
							</Button>
						</form>
					</Form>
				)}
			</SheetContent>
		</Sheet>
	);
}
