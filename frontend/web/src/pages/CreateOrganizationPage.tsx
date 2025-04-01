import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { switchOrganization, getCurrentRole } from "@/lib/organization-utils";
import { OrganizationsAPI } from "@/api/real/api";
import { toast } from "sonner";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { AlertTriangle } from "lucide-react";

// Form validation schema
const orgFormSchema = z.object({
	name: z.string().min(2, "Organization name must be at least 2 characters"),
	description: z.string().optional(),
	website: z
		.string()
		.url("Please enter a valid URL")
		.optional()
		.or(z.literal("")),
});

type OrgFormValues = z.infer<typeof orgFormSchema>;

export default function CreateOrganizationPage() {
	const { user, updateUserMetadata } = useAuth();
	const navigate = useNavigate();
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [showConfirmation, setShowConfirmation] = useState(false);
	const [formData, setFormData] = useState<OrgFormValues | null>(null);
	const [currentRole, setCurrentRole] = useState<string | null>(null);

	// Setup react-hook-form with zod validation
	const form = useForm<OrgFormValues>({
		resolver: zodResolver(orgFormSchema),
		defaultValues: {
			name: "",
			website: "",
			description: "",
		},
	});

	// Get the user's current role on mount
	useEffect(() => {
		const fetchRole = async () => {
			const role = await getCurrentRole();
			setCurrentRole(role);
		};
		fetchRole();
	}, []);

	const handleSubmit = async (data: OrgFormValues) => {
		// Store form data for later use
		setFormData(data);

		// If user is an employee, show confirmation dialog
		if (currentRole === "member") {
			setShowConfirmation(true);
			return;
		}

		// Otherwise, proceed with creation
		await createOrganization(data);
	};

	const createOrganization = async (data: OrgFormValues) => {
		setIsSubmitting(true);
		try {
			if (!user) {
				toast.error("You must be logged in to create an organization");
				return;
			}

			// Create the organization
			const newOrg = await OrganizationsAPI.create({
				name: data.name,
				description: data.description || undefined,
				website: data.website || undefined,
				owner_id: user.id,
			});

			// Update user metadata with new organization id
			const success = await switchOrganization(newOrg.id, "owner");

			if (success) {
				toast.success("Organization created successfully!");

				// Ensure user role is updated in auth metadata
				await updateUserMetadata({ role: "owner" });

				// Redirect to admin dashboard
				navigate("/admin-dashboard", { replace: true });
			}
		} catch (error) {
			console.error("Error creating organization:", error);
			toast.error("Failed to create organization. Please try again.");
		} finally {
			setIsSubmitting(false);
			setShowConfirmation(false);
		}
	};

	return (
		<div className="container max-w-md py-8">
			<Card>
				<CardHeader>
					<CardTitle>Create Organization</CardTitle>
					<CardDescription>Set up your new organization</CardDescription>
				</CardHeader>
				<Form {...form}>
					<form onSubmit={form.handleSubmit(handleSubmit)}>
						<CardContent className="space-y-4">
							<FormField
								control={form.control}
								name="name"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Organization Name</FormLabel>
										<FormControl>
											<Input
												placeholder="Enter organization name"
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="description"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Description</FormLabel>
										<FormControl>
											<Textarea
												placeholder="Describe your organization"
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="website"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Website</FormLabel>
										<FormControl>
											<Input
												type="url"
												placeholder="https://example.com"
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</CardContent>
						<CardFooter>
							<Button
								type="submit"
								className="w-full"
								disabled={isSubmitting}>
								{isSubmitting ? "Creating..." : "Create Organization"}
							</Button>
						</CardFooter>
					</form>
				</Form>
			</Card>

			<ConfirmDialog
				open={showConfirmation}
				onOpenChange={setShowConfirmation}
				title="Create New Organization?"
				description={`As an employee of an existing organization, creating a new organization will create a separate workspace. You'll be able to switch between organizations using the organization switcher.

This will create a separate workspace from your current organization. You'll be set as the owner of the new organization while maintaining your role in your current organization.`}
				onConfirm={() => formData && createOrganization(formData)}
				confirmLabel="Create Organization"
				cancelLabel="Cancel"
				destructive={false}
				trigger={<Button className="hidden" />}
			/>
		</div>
	);
}
