import { useEffect } from "react";
import { useNavigate, Outlet, useLocation } from "react-router-dom";
import { PageHeader } from "@/components/ui/page-header";
import { ContentContainer } from "@/components/ui/content-container";
import { useAuth } from "@/lib/auth";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Building2, Users, CreditCard } from "lucide-react";

export default function AccountPage() {
	const { user, isLoading } = useAuth();
	const navigate = useNavigate();
	const location = useLocation();

	// Determine which tab is active
	const getActiveTab = () => {
		const path = location.pathname;
		if (path.includes("/account/users")) return "users";
		if (path.includes("/account/billing")) return "billing";
		return "business-profile"; // Default tab
	};

	// Handle tab changes
	const handleTabChange = (value: string) => {
		navigate(`/account/${value}`);
	};

	// Redirect to a specific tab if at the root account path
	useEffect(() => {
		if (location.pathname === "/account") {
			navigate("/account/business-profile");
		}
	}, [location.pathname, navigate]);

	return (
		<>
			<PageHeader
				title="Account"
				description="Manage your organization settings and user access"
			/>

			<div className="w-full px-4 sm:px-6 lg:px-8 py-6">
				<Tabs
					value={getActiveTab()}
					onValueChange={handleTabChange}
					className="w-full">
					<TabsList className="inline-flex mb-6">
						<TabsTrigger
							value="business-profile"
							className="flex items-center">
							<Building2 className="h-4 w-4 mr-2" />
							Business Profile
						</TabsTrigger>
						<TabsTrigger
							value="users"
							className="flex items-center">
							<Users className="h-4 w-4 mr-2" />
							Users Management
						</TabsTrigger>
						<TabsTrigger
							value="billing"
							className="flex items-center">
							<CreditCard className="h-4 w-4 mr-2" />
							Billing
						</TabsTrigger>
					</TabsList>
				</Tabs>

				<ContentContainer>
					<Outlet />
				</ContentContainer>
			</div>
		</>
	);
}
