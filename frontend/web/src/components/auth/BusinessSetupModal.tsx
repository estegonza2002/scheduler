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
	DialogFooter,
} from "../ui/dialog";
import { Label } from "../ui/label";
import { useAuth } from "@/lib/auth";
import { Checkbox } from "../ui/checkbox";
import { Link } from "react-router-dom";
// Firestore imports
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

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
	const { user } = useAuth(); // Removed updateUserMetadata from context

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
			// Log terms acceptance in separate table for audit
			if (user.email) {
				await logTermsAcceptance(user.uid, user.email); // Use uid and ensure email exists
			}

			// Use OrganizationsAPI to create the organization
			// This API handles setting the ownerId and creating the member record
			const createdOrg = await OrganizationsAPI.create({
				name: values.businessName,
				description: values.businessDescription || undefined,
			});

			if (createdOrg) {
				// Success - Organization and member record created by API
				toast.success("Business profile created successfully!");
				// Set the new org ID as active in localStorage
				// (useOrganization hook should pick this up on next load)
				localStorage.setItem("activeOrganizationId", createdOrg.id);
				console.log("Business setup successful, closing modal.");
				onClose(); // Close the modal on successful setup
			} else {
				// Error handled within OrganizationsAPI.create (toast likely shown)
				console.error(
					"OrganizationsAPI.create returned null in BusinessSetupModal"
				);
				// Optionally show a generic error here if API doesn't guarantee toast
				// toast.error("Failed to create business profile. Please try again.");
			}
		} catch (error: any) {
			console.error("Failed to create business:", error);
			toast.error(
				"Failed to create business: " + (error.message || "Unknown error")
			);
		} finally {
			setIsLoading(false);
		}
	};

	// Function to log terms acceptance in a separate table for audit purposes
	async function logTermsAcceptance(userId: string, email?: string) {
		if (!email) {
			console.warn("Cannot log terms acceptance without user email.");
			return;
		}
		try {
			const termsAcceptanceData = {
				userId: userId,
				email: email,
				termsVersion: "1.0",
				privacyVersion: "1.0",
				acceptedAt: serverTimestamp(), // Use Firestore server timestamp
				ipAddress: "Logged client-side", // In production, consider logging server-side
				userAgent: navigator.userAgent,
			};

			// Insert into terms_acceptance table
			const docRef = await addDoc(
				collection(db, "termsAcceptances"),
				termsAcceptanceData
			);
			console.log("Terms acceptance logged successfully with ID:", docRef.id);
		} catch (error) {
			console.error("Error logging terms acceptance:", error);
			// Optionally toast here, but don't block main flow
			// toast.error("Could not record terms acceptance.");
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
