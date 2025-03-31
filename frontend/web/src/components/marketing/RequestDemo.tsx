import { useState } from "react";
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
import { Check, Loader2 } from "lucide-react";

// Form validation schema
const demoFormSchema = z.object({
	name: z.string().min(2, "Name must be at least 2 characters"),
	email: z.string().email("Please enter a valid email address"),
	company: z.string().min(1, "Company name is required"),
	phone: z.string().optional(),
	employees: z.string().min(1, "Please select the number of employees"),
	message: z.string().optional(),
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
	const [open, setOpen] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [isSubmitted, setIsSubmitted] = useState(false);

	const form = useForm<DemoFormValues>({
		resolver: zodResolver(demoFormSchema),
		defaultValues: {
			name: "",
			email: "",
			company: "",
			phone: "",
			employees: "",
			message: "",
		},
	});

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
		} finally {
			setIsSubmitting(false);
		}
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
						Fill out the form below and our team will get in touch with you
						shortly.
					</SheetDescription>
				</SheetHeader>

				{isSubmitted ? (
					<div className="flex flex-col items-center justify-center h-[60vh]">
						<div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center mb-4">
							<Check className="h-6 w-6 text-green-600" />
						</div>
						<h3 className="text-xl font-semibold mb-2">Thank You!</h3>
						<p className="text-center text-muted-foreground">
							Your demo request has been submitted. We'll contact you shortly.
						</p>
					</div>
				) : (
					<Form {...form}>
						<form
							onSubmit={form.handleSubmit(onSubmit)}
							className="space-y-6">
							<FormField
								control={form.control}
								name="name"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Name</FormLabel>
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
										<FormLabel>Email</FormLabel>
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

							<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
								<FormField
									control={form.control}
									name="company"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Company</FormLabel>
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
							</div>

							<FormField
								control={form.control}
								name="employees"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Number of Employees</FormLabel>
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
										<FormDescription>
											Share any specific requirements or questions you have.
										</FormDescription>
										<FormMessage />
									</FormItem>
								)}
							/>

							<Button
								type="submit"
								className="w-full"
								disabled={isSubmitting}>
								{isSubmitting ? (
									<>
										<Loader2 className="mr-2 h-4 w-4 animate-spin" />
										Submitting...
									</>
								) : (
									"Submit Request"
								)}
							</Button>
						</form>
					</Form>
				)}
			</SheetContent>
		</Sheet>
	);
}
