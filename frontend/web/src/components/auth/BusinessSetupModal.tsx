import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { OrganizationsAPI } from "@/api";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "../ui/dialog";
import { Label } from "../ui/label";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import { Checkbox } from "../ui/checkbox";
import { Link } from "react-router-dom";

const businessSetupSchema = z.object({
	businessName: z.string().min(2, "Business name is required"),
	businessDescription: z.string().optional(),
	termsAccepted: z.boolean().refine((value) => value === true, {
		message: "You must accept the terms and conditions",
	}),
});

type BusinessSetupFormValues = z.infer<typeof businessSetupSchema>;

interface BusinessSetupModalProps {
	isOpen: boolean;
	onClose: () => void;
}

export function BusinessSetupModal({
	isOpen,
	onClose,
}: BusinessSetupModalProps) {
	const [isLoading, setIsLoading] = useState(false);
	const navigate = useNavigate();
	const { user, updateUserMetadata } = useAuth();

	const form = useForm<BusinessSetupFormValues>({
		resolver: zodResolver(businessSetupSchema),
		defaultValues: {
			businessName: "",
			businessDescription: "",
			termsAccepted: false,
		},
	});

	const onSubmit = async (values: BusinessSetupFormValues) => {
		if (!user) {
			toast.error("You must be logged in to create a business");
			return;
		}

		setIsLoading(true);
		try {
			// Update user metadata to set role as admin and record terms acceptance
			await updateUserMetadata({
				role: "admin",
				termsAccepted: true,
				termsAcceptedAt: new Date().toISOString(),
				termsAcceptedVersion: "1.0",
			});

			// Log terms acceptance in separate table for audit
			await logTermsAcceptance(user.id, user.email);

			// Create the business organization directly with Supabase
			try {
				// Insert organization with direct Supabase client
				const { data: newOrg, error: orgError } = await supabase
					.from("organizations")
					.insert({
						name: values.businessName,
						description: values.businessDescription || null,
					})
					.select()
					.single();

				if (orgError) {
					console.error("Failed to create business organization:", orgError);
					toast.error(
						"There was an issue setting up your business: " + orgError.message
					);
					return;
				}

				toast.success("Business created successfully!");
				localStorage.removeItem("business_signup");
				navigate("/admin-dashboard");
			} catch (error: any) {
				console.error("Failed to create business:", error);
				toast.error(
					"Failed to create business: " + (error.message || "Unknown error")
				);
			}
		} catch (error: any) {
			console.error("Failed to update user role:", error);
			toast.error(
				"Failed to create business: " + (error.message || "Unknown error")
			);
		} finally {
			setIsLoading(false);
			onClose();
		}
	};

	// Function to log terms acceptance in a separate table for audit purposes
	async function logTermsAcceptance(userId: string, email?: string) {
		try {
			if (!email) return;

			const termsAcceptanceData = {
				user_id: userId,
				email: email,
				terms_version: "1.0",
				privacy_version: "1.0",
				accepted_at: new Date().toISOString(),
				ip_address: "Logged client-side", // In production, you'd log this server-side
				user_agent: navigator.userAgent,
			};

			// Insert into terms_acceptance table
			const { error } = await supabase
				.from("terms_acceptances")
				.insert(termsAcceptanceData);

			if (error) {
				console.error("Failed to log terms acceptance:", error);
				// Don't block registration if this fails - just log the error
			} else {
				console.log("Terms acceptance logged successfully");
			}
		} catch (error) {
			console.error("Error logging terms acceptance:", error);
		}
	}

	return (
		<Dialog
			open={isOpen}
			onOpenChange={onClose}>
			<DialogContent className="sm:max-w-[425px]">
				<DialogHeader>
					<DialogTitle>Complete Your Business Setup</DialogTitle>
					<DialogDescription>
						Please provide your business details to complete the registration.
					</DialogDescription>
				</DialogHeader>
				<form
					onSubmit={form.handleSubmit(onSubmit)}
					className="space-y-4 pt-4">
					<div className="space-y-2">
						<Label htmlFor="businessName">Business Name</Label>
						<Input
							id="businessName"
							placeholder="Enter your business name"
							{...form.register("businessName")}
						/>
						{form.formState.errors.businessName && (
							<p className="text-sm text-red-500">
								{form.formState.errors.businessName.message}
							</p>
						)}
					</div>

					<div className="space-y-2">
						<Label htmlFor="businessDescription">
							Business Description (Optional)
						</Label>
						<Input
							id="businessDescription"
							placeholder="Enter a short description of your business"
							{...form.register("businessDescription")}
						/>
					</div>

					<div className="space-y-2">
						<div className="flex items-start space-x-3 space-y-0">
							<Checkbox
								id="termsAccepted"
								checked={form.watch("termsAccepted")}
								onCheckedChange={(checked) =>
									form.setValue("termsAccepted", checked === true)
								}
							/>
							<div className="space-y-1 leading-none">
								<Label
									htmlFor="termsAccepted"
									className="text-sm font-normal">
									I agree to the{" "}
									<Link
										to="/terms"
										className="text-primary hover:underline"
										target="_blank"
										rel="noopener noreferrer">
										Terms of Service
									</Link>{" "}
									and{" "}
									<Link
										to="/privacy"
										className="text-primary hover:underline"
										target="_blank"
										rel="noopener noreferrer">
										Privacy Policy
									</Link>
								</Label>
								{form.formState.errors.termsAccepted && (
									<p className="text-sm text-red-500">
										{form.formState.errors.termsAccepted.message}
									</p>
								)}
							</div>
						</div>
					</div>

					<div className="flex justify-end space-x-2 pt-4">
						<Button
							type="button"
							variant="outline"
							onClick={onClose}
							disabled={isLoading}>
							Cancel
						</Button>
						<Button
							type="submit"
							disabled={isLoading}>
							{isLoading ? "Creating..." : "Create Business"}
						</Button>
					</div>
				</form>
			</DialogContent>
		</Dialog>
	);
}
