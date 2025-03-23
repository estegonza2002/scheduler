import { useAuth } from "../lib/auth";
import { Button } from "../components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "../components/ui/card";
import { CalendarCheck, Clock, FileText, Bell } from "lucide-react";
import { Link } from "react-router-dom";
import { NotificationsAPI } from "../api";
import { toast } from "sonner";

export default function DashboardPage() {
	const { user } = useAuth();

	const createDemoNotification = async () => {
		try {
			const notification = await NotificationsAPI.createNotification({
				userId: "user-1", // In a real app, this would be the actual user ID
				organizationId: "org-1",
				type: "system",
				title: "Demo Notification",
				message: "This is a test notification created from the dashboard.",
				isRead: false,
				isActionRequired: true,
				actionUrl: "/notifications",
			});

			toast.success("Demo notification created successfully!");
		} catch (error) {
			console.error("Error creating demo notification:", error);
			toast.error("Failed to create demo notification");
		}
	};

	return (
		<div className="py-6 px-4 sm:px-6 lg:px-8">
			<div className="mb-8">
				<h1 className="text-3xl font-bold text-primary">
					Welcome back, {user?.user_metadata?.firstName || "User"}!
				</h1>
				<p className="text-muted-foreground mt-1">
					Here's what's happening with your schedule today.
				</p>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
				<Card>
					<CardHeader className="pb-2">
						<div className="flex items-center justify-between">
							<CardTitle className="text-base">My Schedule</CardTitle>
							<CalendarCheck className="h-4 w-4 text-muted-foreground" />
						</div>
						<CardDescription>View your upcoming shifts</CardDescription>
					</CardHeader>
					<CardContent>
						<p className="text-sm text-muted-foreground mb-4">
							You have no upcoming shifts scheduled.
						</p>
						<Link to="/schedule">
							<Button
								variant="secondary"
								className="w-full">
								View Schedule
							</Button>
						</Link>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="pb-2">
						<div className="flex items-center justify-between">
							<CardTitle className="text-base">Time Tracking</CardTitle>
							<Clock className="h-4 w-4 text-muted-foreground" />
						</div>
						<CardDescription>Manage your time</CardDescription>
					</CardHeader>
					<CardContent>
						<p className="text-sm text-muted-foreground mb-4">
							You haven't clocked in today.
						</p>
						<Button className="w-full">Clock In</Button>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="pb-2">
						<div className="flex items-center justify-between">
							<CardTitle className="text-base">Requests</CardTitle>
							<FileText className="h-4 w-4 text-muted-foreground" />
						</div>
						<CardDescription>Manage time-off and shift swaps</CardDescription>
					</CardHeader>
					<CardContent>
						<p className="text-sm text-muted-foreground mb-4">
							You have no pending requests.
						</p>
						<Button
							variant="outline"
							className="w-full">
							New Request
						</Button>
					</CardContent>
				</Card>
			</div>

			<Card>
				<CardHeader>
					<div className="flex items-center justify-between">
						<div>
							<CardTitle>Upcoming Shifts</CardTitle>
							<CardDescription>Your next 7 days</CardDescription>
						</div>
						<Button
							variant="outline"
							size="sm">
							View All
						</Button>
					</div>
				</CardHeader>
				<CardContent>
					<div className="text-center py-8">
						<p className="text-sm text-muted-foreground mb-2">
							No upcoming shifts for the next 7 days.
						</p>
						<p className="text-xs text-muted-foreground">
							When you're assigned shifts, they will appear here.
						</p>
					</div>
				</CardContent>
			</Card>

			<div className="mt-6 flex justify-center">
				<Button
					onClick={createDemoNotification}
					variant="outline"
					className="flex gap-2 items-center">
					<Bell className="h-4 w-4" />
					Create Demo Notification
				</Button>
			</div>
		</div>
	);
}
