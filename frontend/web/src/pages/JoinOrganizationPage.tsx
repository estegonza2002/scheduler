import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { switchOrganization, getCurrentRole } from "@/lib/organization-utils";
import { supabase } from "@/lib/supabase";
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
import { AlertTriangle, Building2 } from "lucide-react";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";

// Form validation schemas
const joinFormSchema = z.object({
	inviteCode: z.string().min(1, "Invite code is required"),
});

const requestAccessSchema = z.object({
	organizationName: z.string().min(1, "Organization name is required"),
	email: z.string().email("Please enter a valid email"),
	message: z.string().min(1, "Please provide a message"),
});

type JoinFormValues = z.infer<typeof joinFormSchema>;
type RequestAccessValues = z.infer<typeof requestAccessSchema>;

interface Organization {
	name: string;
}

interface OrganizationInvite {
	organization_id: string;
	role: string;
	organizations: Organization;
}

export default function JoinOrganizationPage() {
	const { user } = useAuth();
	const navigate = useNavigate();
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [showAdminWarning, setShowAdminWarning] = useState(false);
	const [showJoinConfirmation, setShowJoinConfirmation] = useState(false);
	const [pendingInvite, setPendingInvite] = useState<{
		organization_id: string;
		role: "member" | "admin" | "owner";
		organization_name?: string;
	} | null>(null);

	// Setup react-hook-form with zod validation for join form
	const joinForm = useForm<JoinFormValues>({
		resolver: zodResolver(joinFormSchema),
		defaultValues: {
			inviteCode: "",
		},
	});

	// Setup react-hook-form with zod validation for request access form
	const requestForm = useForm<RequestAccessValues>({
		resolver: zodResolver(requestAccessSchema),
		defaultValues: {
			organizationName: "",
			email: user?.email || "",
			message: "",
		},
	});

	const handleJoinOrganization = async (invite: {
		organization_id: string;
		role: "member" | "admin" | "owner";
	}) => {
		try {
			// Add user to organization members
			const { error: memberError } = await supabase
				.from("organization_members")
				.insert({
					organization_id: invite.organization_id,
					user_id: user?.id,
					role: invite.role || "member", // Default to member if no role specified
				});

			if (memberError) {
				// Check if it's a duplicate membership error
				if (memberError.code === "23505") {
					// Postgres unique constraint violation
					setError("You are already a member of this organization.");
				} else {
					setError("Failed to join organization. Please try again.");
					console.error("Error joining organization:", memberError);
				}
				return;
			}

			// Update user metadata with new organization id and role
			const success = await switchOrganization(
				invite.organization_id,
				invite.role
			);

			if (success) {
				toast.success("Successfully joined organization!");
				// Redirect to dashboard
				navigate("/dashboard", { replace: true });
			}
		} catch (error) {
			console.error("Error joining organization:", error);
			setError("An unexpected error occurred. Please try again.");
		} finally {
			setIsSubmitting(false);
			setShowAdminWarning(false);
			setShowJoinConfirmation(false);
		}
	};

	const onJoinSubmit = async (data: JoinFormValues) => {
		setIsSubmitting(true);
		setError(null);

		try {
			// Validate invite code and get organization details
			const { data: invite, error: inviteError } = (await supabase
				.from("organization_invites")
				.select(
					`
					organization_id,
					role,
					organizations (
						name
					)
				`
				)
				.eq("code", data.inviteCode)
				.eq("status", "active")
				.single()) as { data: OrganizationInvite | null; error: any };

			if (inviteError || !invite) {
				setError("Invalid or expired invite code. Please try again.");
				setIsSubmitting(false);
				return;
			}

			// Cast the role to the correct type and include organization name
			const inviteWithRole = {
				organization_id: invite.organization_id,
				role: (invite.role || "member") as "member" | "admin" | "owner",
				organization_name: invite.organizations.name,
			};

			// Check if user is an admin in another organization
			const currentRole = await getCurrentRole();
			if (currentRole === "admin" || currentRole === "owner") {
				setPendingInvite(inviteWithRole);
				setShowAdminWarning(true);
				setIsSubmitting(false);
				return;
			}

			// Show join confirmation dialog
			setPendingInvite(inviteWithRole);
			setShowJoinConfirmation(true);
			setIsSubmitting(false);
		} catch (error) {
			console.error("Error validating invite:", error);
			setError("An unexpected error occurred. Please try again.");
			setIsSubmitting(false);
		}
	};

	const onRequestSubmit = async (data: RequestAccessValues) => {
		setIsSubmitting(true);
		setError(null);

		try {
			// Create access request in the database
			const { error: requestError } = await supabase
				.from("organization_access_requests")
				.insert({
					organization_name: data.organizationName,
					user_id: user?.id,
					email: data.email,
					message: data.message,
					status: "pending",
				});

			if (requestError) {
				if (requestError.code === "23505") {
					setError("You have already requested access to this organization.");
				} else {
					throw requestError;
				}
			} else {
				toast.success(
					"Access request submitted successfully! You will be notified when it's approved."
				);
				requestForm.reset();
			}
		} catch (error) {
			console.error("Error submitting access request:", error);
			setError("Failed to submit access request. Please try again.");
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<>
			<div className="container max-w-2xl py-8">
				<div className="space-y-6">
					<div className="space-y-2">
						<h1 className="text-3xl font-bold">Join Organization</h1>
						<p className="text-muted-foreground">
							Join an existing organization using an invite code or request
							access
						</p>
					</div>

					<Tabs defaultValue="join">
						<TabsList className="grid w-full grid-cols-2">
							<TabsTrigger value="join">Have an Invite Code</TabsTrigger>
							<TabsTrigger value="request">Request Access</TabsTrigger>
						</TabsList>

						<TabsContent value="join">
							<Card>
								<CardHeader>
									<CardTitle>Join with Invite Code</CardTitle>
									<CardDescription>
										Enter the invite code you received to join the organization
									</CardDescription>
								</CardHeader>
								<Form {...joinForm}>
									<form onSubmit={joinForm.handleSubmit(onJoinSubmit)}>
										<CardContent>
											<FormField
												control={joinForm.control}
												name="inviteCode"
												render={({ field }) => (
													<FormItem>
														<FormLabel>Invite Code</FormLabel>
														<FormControl>
															<Input
																placeholder="Enter your invite code"
																{...field}
															/>
														</FormControl>
														<FormMessage />
													</FormItem>
												)}
											/>
											{error && (
												<p className="text-sm text-destructive mt-2">{error}</p>
											)}
										</CardContent>
										<CardFooter>
											<Button
												type="submit"
												className="w-full"
												disabled={isSubmitting}>
												{isSubmitting ? "Validating..." : "Join Organization"}
											</Button>
										</CardFooter>
									</form>
								</Form>
							</Card>
						</TabsContent>

						<TabsContent value="request">
							<Card>
								<CardHeader>
									<CardTitle>Request Organization Access</CardTitle>
									<CardDescription>
										Don't have an invite code? Submit a request to join an
										organization
									</CardDescription>
								</CardHeader>
								<Form {...requestForm}>
									<form onSubmit={requestForm.handleSubmit(onRequestSubmit)}>
										<CardContent className="space-y-4">
											<FormField
												control={requestForm.control}
												name="organizationName"
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
												control={requestForm.control}
												name="email"
												render={({ field }) => (
													<FormItem>
														<FormLabel>Your Email</FormLabel>
														<FormControl>
															<Input
																type="email"
																placeholder="Enter your email"
																{...field}
															/>
														</FormControl>
														<FormMessage />
													</FormItem>
												)}
											/>
											<FormField
												control={requestForm.control}
												name="message"
												render={({ field }) => (
													<FormItem>
														<FormLabel>Message</FormLabel>
														<FormControl>
															<Textarea
																placeholder="Explain why you want to join this organization"
																{...field}
															/>
														</FormControl>
														<FormMessage />
													</FormItem>
												)}
											/>
											{error && (
												<p className="text-sm text-destructive">{error}</p>
											)}
										</CardContent>
										<CardFooter>
											<Button
												type="submit"
												className="w-full"
												disabled={isSubmitting}>
												{isSubmitting
													? "Submitting Request..."
													: "Submit Access Request"}
											</Button>
										</CardFooter>
									</form>
								</Form>
							</Card>
						</TabsContent>
					</Tabs>
				</div>
			</div>

			{/* Admin Warning Dialog */}
			<Dialog
				open={showAdminWarning}
				onOpenChange={setShowAdminWarning}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle className="flex items-center gap-2">
							<AlertTriangle className="h-5 w-5 text-yellow-500" />
							Change Role Warning
						</DialogTitle>
						<DialogDescription>
							You are currently an admin in another organization. Joining this
							organization as a member will change your role. Are you sure you
							want to proceed?
						</DialogDescription>
					</DialogHeader>
					<DialogFooter>
						<Button
							variant="outline"
							onClick={() => {
								setShowAdminWarning(false);
								setIsSubmitting(false);
							}}>
							Cancel
						</Button>
						<Button
							onClick={() => {
								if (pendingInvite) {
									handleJoinOrganization(pendingInvite);
								}
							}}>
							Proceed
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* Join Confirmation Dialog */}
			<Dialog
				open={showJoinConfirmation}
				onOpenChange={setShowJoinConfirmation}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle className="flex items-center gap-2">
							<Building2 className="h-5 w-5" />
							Confirm Organization Join
						</DialogTitle>
						<DialogDescription>
							You are about to join{" "}
							{pendingInvite?.organization_name && (
								<span className="font-medium">
									{pendingInvite.organization_name}
								</span>
							)}{" "}
							as a {pendingInvite?.role}. This will give you access to the
							organization's resources and data.
						</DialogDescription>
					</DialogHeader>
					<DialogFooter>
						<Button
							variant="outline"
							onClick={() => {
								setShowJoinConfirmation(false);
								setIsSubmitting(false);
							}}>
							Cancel
						</Button>
						<Button
							onClick={() => {
								if (pendingInvite) {
									handleJoinOrganization(pendingInvite);
								}
							}}>
							Join Organization
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</>
	);
}
