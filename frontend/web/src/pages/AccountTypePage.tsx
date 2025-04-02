import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet";
import { COMPANY_NAME } from "@/constants";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Building2, UserCircle } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { BusinessSetupModal } from "@/components/auth/BusinessSetupModal";
import { toast } from "sonner";

export default function AccountTypePage() {
	const navigate = useNavigate();
	const { user, updateUserMetadata } = useAuth();
	const [showBusinessSetup, setShowBusinessSetup] = useState(false);
	const [isLoading, setIsLoading] = useState(false);

	// Redirect to login if no user is found
	if (!user) {
		navigate("/login");
		return null;
	}

	const handleCreateOrganization = () => {
		setShowBusinessSetup(true);
	};

	const handleContinueAsEmployee = async () => {
		setIsLoading(true);
		try {
			// Update user role to "employee" in metadata
			await updateUserMetadata({
				role: "employee",
			});

			toast.success("Account set up as employee successfully!");
			navigate("/dashboard");
		} catch (error) {
			console.error("Error updating user role:", error);
			toast.error("Failed to set up employee account");
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<>
			<Helmet>
				<title>Select Account Type | {COMPANY_NAME}</title>
			</Helmet>

			<div className="container flex items-center justify-center min-h-screen p-4">
				<div className="w-full max-w-3xl">
					<div className="text-center mb-8">
						<h1 className="text-3xl font-bold tracking-tight">
							Welcome to {COMPANY_NAME}!
						</h1>
						<p className="text-muted-foreground mt-2">
							How would you like to use the platform?
						</p>
					</div>

					<div className="grid gap-6 sm:grid-cols-2">
						{/* Organization Admin Option */}
						<Card
							className="border-2 hover:border-primary cursor-pointer transition-all"
							onClick={handleCreateOrganization}>
							<CardHeader>
								<div className="flex justify-center mb-4">
									<div className="p-3 rounded-full bg-primary/10">
										<Building2 className="h-8 w-8 text-primary" />
									</div>
								</div>
								<CardTitle className="text-center">
									Create Organization
								</CardTitle>
								<CardDescription className="text-center">
									I want to create and manage an organization
								</CardDescription>
							</CardHeader>
							<CardContent>
								<ul className="space-y-2 text-sm">
									<li className="flex items-start">
										<span className="text-green-500 mr-2">✓</span>
										Manage employees and schedules
									</li>
									<li className="flex items-start">
										<span className="text-green-500 mr-2">✓</span>
										Create locations and shifts
									</li>
									<li className="flex items-start">
										<span className="text-green-500 mr-2">✓</span>
										Access admin dashboard
									</li>
								</ul>
							</CardContent>
							<CardFooter>
								<Button className="w-full">Create Organization</Button>
							</CardFooter>
						</Card>

						{/* Employee Option */}
						<Card
							className="border-2 hover:border-primary cursor-pointer transition-all"
							onClick={handleContinueAsEmployee}>
							<CardHeader>
								<div className="flex justify-center mb-4">
									<div className="p-3 rounded-full bg-primary/10">
										<UserCircle className="h-8 w-8 text-primary" />
									</div>
								</div>
								<CardTitle className="text-center">
									Continue as Employee
								</CardTitle>
								<CardDescription className="text-center">
									I want to join an existing organization
								</CardDescription>
							</CardHeader>
							<CardContent>
								<ul className="space-y-2 text-sm">
									<li className="flex items-start">
										<span className="text-green-500 mr-2">✓</span>
										View your schedule
									</li>
									<li className="flex items-start">
										<span className="text-green-500 mr-2">✓</span>
										Manage availability
									</li>
									<li className="flex items-start">
										<span className="text-green-500 mr-2">✓</span>
										Request time off
									</li>
								</ul>
							</CardContent>
							<CardFooter>
								<Button
									variant="outline"
									className="w-full"
									disabled={isLoading}>
									{isLoading ? "Loading..." : "Continue as Employee"}
								</Button>
							</CardFooter>
						</Card>
					</div>
				</div>
			</div>

			{/* Business Setup Modal */}
			{showBusinessSetup && (
				<BusinessSetupModal
					isOpen={showBusinessSetup}
					onClose={() => {
						setShowBusinessSetup(false);
					}}
				/>
			)}
		</>
	);
}
