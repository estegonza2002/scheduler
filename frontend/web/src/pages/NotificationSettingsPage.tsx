import React, { useState } from "react";
import { Helmet } from "react-helmet";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Switch } from "../components/ui/switch";
import { Label } from "../components/ui/label";
import { Separator } from "../components/ui/separator";
import {
	Tabs,
	TabsContent,
	TabsList,
	TabsTrigger,
} from "../components/ui/tabs";
import { Mail, Phone, Bell, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "../components/ui/alert-dialog";
import { Link } from "react-router-dom";

// Mock notification settings (in a real app, this would come from the API)
interface NotificationSettings {
	email: {
		shiftUpdates: boolean;
		shiftReminders: boolean;
		requestUpdates: boolean;
		systemAnnouncements: boolean;
		newSchedulePublished: boolean;
	};
	sms: {
		shiftUpdates: boolean;
		shiftReminders: boolean;
		requestUpdates: boolean;
		systemAnnouncements: boolean;
	};
	inApp: {
		shiftUpdates: boolean;
		shiftReminders: boolean;
		requestUpdates: boolean;
		systemAnnouncements: boolean;
		newSchedulePublished: boolean;
		newEmployees: boolean;
		locationChanges: boolean;
	};
	push: {
		enabled: boolean;
		shiftUpdates: boolean;
		shiftReminders: boolean;
		requestUpdates: boolean;
		systemAnnouncements: boolean;
	};
}

const defaultSettings: NotificationSettings = {
	email: {
		shiftUpdates: true,
		shiftReminders: true,
		requestUpdates: true,
		systemAnnouncements: true,
		newSchedulePublished: true,
	},
	sms: {
		shiftUpdates: true,
		shiftReminders: true,
		requestUpdates: false,
		systemAnnouncements: false,
	},
	inApp: {
		shiftUpdates: true,
		shiftReminders: true,
		requestUpdates: true,
		systemAnnouncements: true,
		newSchedulePublished: true,
		newEmployees: true,
		locationChanges: true,
	},
	push: {
		enabled: false,
		shiftUpdates: true,
		shiftReminders: true,
		requestUpdates: true,
		systemAnnouncements: true,
	},
};

export default function NotificationSettingsPage() {
	const [settings, setSettings] =
		useState<NotificationSettings>(defaultSettings);
	const [saving, setSaving] = useState(false);

	const handleToggle = (
		channel: keyof NotificationSettings,
		setting: string,
		value: boolean
	) => {
		setSettings((prev) => ({
			...prev,
			[channel]: {
				...prev[channel],
				[setting]: value,
			},
		}));
	};

	const handleSave = async () => {
		setSaving(true);

		// Simulate API call
		await new Promise((resolve) => setTimeout(resolve, 1000));

		toast.success("Notification settings saved successfully");
		setSaving(false);
	};

	const handleResetToDefault = () => {
		setSettings(defaultSettings);
		toast.success("Settings reset to default values");
	};

	const getEnabledCount = (channel: keyof NotificationSettings) => {
		const channelSettings = settings[channel];
		return Object.keys(channelSettings).reduce((count, key) => {
			// Skip the 'enabled' property for push notifications
			if (channel === "push" && key === "enabled") return count;
			return channelSettings[key as keyof typeof channelSettings]
				? count + 1
				: count;
		}, 0);
	};

	return (
		<>
			<Helmet>
				<title>Notification Settings | Scheduler</title>
			</Helmet>

			<div className="container py-6 max-w-screen-lg">
				<div className="flex justify-between items-center mb-6">
					<h1 className="text-2xl font-bold">Notification Settings</h1>
					<div className="flex gap-2">
						<Button
							variant="outline"
							size="sm"
							asChild>
							<Link to="/notifications">Back to Notifications</Link>
						</Button>
						<AlertDialog>
							<AlertDialogTrigger asChild>
								<Button
									variant="outline"
									size="sm">
									<RefreshCw className="h-4 w-4 mr-2" />
									Reset to Default
								</Button>
							</AlertDialogTrigger>
							<AlertDialogContent>
								<AlertDialogHeader>
									<AlertDialogTitle>
										Reset notification settings?
									</AlertDialogTitle>
									<AlertDialogDescription>
										This will revert all notification settings to their default
										values. This action cannot be undone.
									</AlertDialogDescription>
								</AlertDialogHeader>
								<AlertDialogFooter>
									<AlertDialogCancel>Cancel</AlertDialogCancel>
									<AlertDialogAction onClick={handleResetToDefault}>
										Reset
									</AlertDialogAction>
								</AlertDialogFooter>
							</AlertDialogContent>
						</AlertDialog>
						<Button
							onClick={handleSave}
							disabled={saving}>
							{saving ? "Saving..." : "Save Changes"}
						</Button>
					</div>
				</div>

				<Card className="mb-6">
					<CardHeader>
						<CardTitle>Notification Delivery</CardTitle>
						<CardDescription>
							Choose how you would like to receive different types of
							notifications
						</CardDescription>
					</CardHeader>
					<CardContent>
						<Tabs
							defaultValue="email"
							className="w-full">
							<TabsList className="grid grid-cols-4 mb-6">
								<TabsTrigger value="email">
									<Mail className="h-4 w-4 mr-2" />
									Email ({getEnabledCount("email")}/
									{Object.keys(settings.email).length})
								</TabsTrigger>
								<TabsTrigger value="sms">
									<Phone className="h-4 w-4 mr-2" />
									SMS ({getEnabledCount("sms")}/
									{Object.keys(settings.sms).length})
								</TabsTrigger>
								<TabsTrigger value="inApp">
									<Bell className="h-4 w-4 mr-2" />
									In-App ({getEnabledCount("inApp")}/
									{Object.keys(settings.inApp).length})
								</TabsTrigger>
								<TabsTrigger
									value="push"
									disabled={!settings.push.enabled}>
									Push ({getEnabledCount("push")}/
									{Object.keys(settings.push).length - 1})
								</TabsTrigger>
							</TabsList>

							{/* Email Notifications */}
							<TabsContent value="email">
								<div className="space-y-4">
									<div className="flex items-center justify-between">
										<Label
											htmlFor="email-shift-updates"
											className="flex-1">
											<div className="font-medium">Shift Updates</div>
											<div className="text-sm text-muted-foreground">
												Receive notifications when your shifts are updated
											</div>
										</Label>
										<Switch
											id="email-shift-updates"
											checked={settings.email.shiftUpdates}
											onCheckedChange={(checked) =>
												handleToggle("email", "shiftUpdates", checked)
											}
										/>
									</div>
									<Separator />
									<div className="flex items-center justify-between">
										<Label
											htmlFor="email-shift-reminders"
											className="flex-1">
											<div className="font-medium">Shift Reminders</div>
											<div className="text-sm text-muted-foreground">
												Receive reminders about upcoming shifts
											</div>
										</Label>
										<Switch
											id="email-shift-reminders"
											checked={settings.email.shiftReminders}
											onCheckedChange={(checked) =>
												handleToggle("email", "shiftReminders", checked)
											}
										/>
									</div>
									<Separator />
									<div className="flex items-center justify-between">
										<Label
											htmlFor="email-request-updates"
											className="flex-1">
											<div className="font-medium">Request Updates</div>
											<div className="text-sm text-muted-foreground">
												Receive updates about your time-off and shift swap
												requests
											</div>
										</Label>
										<Switch
											id="email-request-updates"
											checked={settings.email.requestUpdates}
											onCheckedChange={(checked) =>
												handleToggle("email", "requestUpdates", checked)
											}
										/>
									</div>
									<Separator />
									<div className="flex items-center justify-between">
										<Label
											htmlFor="email-system-announcements"
											className="flex-1">
											<div className="font-medium">System Announcements</div>
											<div className="text-sm text-muted-foreground">
												Receive important system announcements
											</div>
										</Label>
										<Switch
											id="email-system-announcements"
											checked={settings.email.systemAnnouncements}
											onCheckedChange={(checked) =>
												handleToggle("email", "systemAnnouncements", checked)
											}
										/>
									</div>
									<Separator />
									<div className="flex items-center justify-between">
										<Label
											htmlFor="email-new-schedule"
											className="flex-1">
											<div className="font-medium">New Schedule Published</div>
											<div className="text-sm text-muted-foreground">
												Receive notifications when a new schedule is published
											</div>
										</Label>
										<Switch
											id="email-new-schedule"
											checked={settings.email.newSchedulePublished}
											onCheckedChange={(checked) =>
												handleToggle("email", "newSchedulePublished", checked)
											}
										/>
									</div>
								</div>
							</TabsContent>

							{/* SMS Notifications */}
							<TabsContent value="sms">
								<div className="space-y-4">
									<div className="flex items-center justify-between">
										<Label
											htmlFor="sms-shift-updates"
											className="flex-1">
											<div className="font-medium">Shift Updates</div>
											<div className="text-sm text-muted-foreground">
												Receive SMS when your shifts are updated
											</div>
										</Label>
										<Switch
											id="sms-shift-updates"
											checked={settings.sms.shiftUpdates}
											onCheckedChange={(checked) =>
												handleToggle("sms", "shiftUpdates", checked)
											}
										/>
									</div>
									<Separator />
									<div className="flex items-center justify-between">
										<Label
											htmlFor="sms-shift-reminders"
											className="flex-1">
											<div className="font-medium">Shift Reminders</div>
											<div className="text-sm text-muted-foreground">
												Receive SMS reminders about upcoming shifts
											</div>
										</Label>
										<Switch
											id="sms-shift-reminders"
											checked={settings.sms.shiftReminders}
											onCheckedChange={(checked) =>
												handleToggle("sms", "shiftReminders", checked)
											}
										/>
									</div>
									<Separator />
									<div className="flex items-center justify-between">
										<Label
											htmlFor="sms-request-updates"
											className="flex-1">
											<div className="font-medium">Request Updates</div>
											<div className="text-sm text-muted-foreground">
												Receive SMS for time-off and shift swap request updates
											</div>
										</Label>
										<Switch
											id="sms-request-updates"
											checked={settings.sms.requestUpdates}
											onCheckedChange={(checked) =>
												handleToggle("sms", "requestUpdates", checked)
											}
										/>
									</div>
									<Separator />
									<div className="flex items-center justify-between">
										<Label
											htmlFor="sms-system-announcements"
											className="flex-1">
											<div className="font-medium">System Announcements</div>
											<div className="text-sm text-muted-foreground">
												Receive SMS for important system announcements
											</div>
										</Label>
										<Switch
											id="sms-system-announcements"
											checked={settings.sms.systemAnnouncements}
											onCheckedChange={(checked) =>
												handleToggle("sms", "systemAnnouncements", checked)
											}
										/>
									</div>
								</div>
							</TabsContent>

							{/* In-App Notifications */}
							<TabsContent value="inApp">
								<div className="space-y-4">
									<div className="flex items-center justify-between">
										<Label
											htmlFor="inapp-shift-updates"
											className="flex-1">
											<div className="font-medium">Shift Updates</div>
											<div className="text-sm text-muted-foreground">
												Receive in-app notifications when your shifts are
												updated
											</div>
										</Label>
										<Switch
											id="inapp-shift-updates"
											checked={settings.inApp.shiftUpdates}
											onCheckedChange={(checked) =>
												handleToggle("inApp", "shiftUpdates", checked)
											}
										/>
									</div>
									<Separator />
									<div className="flex items-center justify-between">
										<Label
											htmlFor="inapp-shift-reminders"
											className="flex-1">
											<div className="font-medium">Shift Reminders</div>
											<div className="text-sm text-muted-foreground">
												Receive in-app reminders about upcoming shifts
											</div>
										</Label>
										<Switch
											id="inapp-shift-reminders"
											checked={settings.inApp.shiftReminders}
											onCheckedChange={(checked) =>
												handleToggle("inApp", "shiftReminders", checked)
											}
										/>
									</div>
									<Separator />
									<div className="flex items-center justify-between">
										<Label
											htmlFor="inapp-request-updates"
											className="flex-1">
											<div className="font-medium">Request Updates</div>
											<div className="text-sm text-muted-foreground">
												Receive in-app updates about your time-off and shift
												swap requests
											</div>
										</Label>
										<Switch
											id="inapp-request-updates"
											checked={settings.inApp.requestUpdates}
											onCheckedChange={(checked) =>
												handleToggle("inApp", "requestUpdates", checked)
											}
										/>
									</div>
									<Separator />
									<div className="flex items-center justify-between">
										<Label
											htmlFor="inapp-system-announcements"
											className="flex-1">
											<div className="font-medium">System Announcements</div>
											<div className="text-sm text-muted-foreground">
												Receive in-app important system announcements
											</div>
										</Label>
										<Switch
											id="inapp-system-announcements"
											checked={settings.inApp.systemAnnouncements}
											onCheckedChange={(checked) =>
												handleToggle("inApp", "systemAnnouncements", checked)
											}
										/>
									</div>
									<Separator />
									<div className="flex items-center justify-between">
										<Label
											htmlFor="inapp-new-schedule"
											className="flex-1">
											<div className="font-medium">New Schedule Published</div>
											<div className="text-sm text-muted-foreground">
												Receive in-app notifications when a new schedule is
												published
											</div>
										</Label>
										<Switch
											id="inapp-new-schedule"
											checked={settings.inApp.newSchedulePublished}
											onCheckedChange={(checked) =>
												handleToggle("inApp", "newSchedulePublished", checked)
											}
										/>
									</div>
									<Separator />
									<div className="flex items-center justify-between">
										<Label
											htmlFor="inapp-new-employees"
											className="flex-1">
											<div className="font-medium">New Employees</div>
											<div className="text-sm text-muted-foreground">
												Receive in-app notifications when new employees are
												added
											</div>
										</Label>
										<Switch
											id="inapp-new-employees"
											checked={settings.inApp.newEmployees}
											onCheckedChange={(checked) =>
												handleToggle("inApp", "newEmployees", checked)
											}
										/>
									</div>
									<Separator />
									<div className="flex items-center justify-between">
										<Label
											htmlFor="inapp-location-changes"
											className="flex-1">
											<div className="font-medium">Location Changes</div>
											<div className="text-sm text-muted-foreground">
												Receive in-app notifications when there are changes to
												locations
											</div>
										</Label>
										<Switch
											id="inapp-location-changes"
											checked={settings.inApp.locationChanges}
											onCheckedChange={(checked) =>
												handleToggle("inApp", "locationChanges", checked)
											}
										/>
									</div>
								</div>
							</TabsContent>

							{/* Push Notifications */}
							<TabsContent value="push">
								<div className="space-y-4">
									<div className="flex items-center justify-between">
										<Label
											htmlFor="push-enabled"
											className="flex-1">
											<div className="font-medium">
												Enable Push Notifications
											</div>
											<div className="text-sm text-muted-foreground">
												Allow browser push notifications
											</div>
										</Label>
										<Switch
											id="push-enabled"
											checked={settings.push.enabled}
											onCheckedChange={(checked) =>
												handleToggle("push", "enabled", checked)
											}
										/>
									</div>

									{settings.push.enabled ? (
										<>
											<Separator />
											<div className="flex items-center justify-between">
												<Label
													htmlFor="push-shift-updates"
													className="flex-1">
													<div className="font-medium">Shift Updates</div>
													<div className="text-sm text-muted-foreground">
														Receive push notifications when your shifts are
														updated
													</div>
												</Label>
												<Switch
													id="push-shift-updates"
													checked={settings.push.shiftUpdates}
													onCheckedChange={(checked) =>
														handleToggle("push", "shiftUpdates", checked)
													}
												/>
											</div>
											<Separator />
											<div className="flex items-center justify-between">
												<Label
													htmlFor="push-shift-reminders"
													className="flex-1">
													<div className="font-medium">Shift Reminders</div>
													<div className="text-sm text-muted-foreground">
														Receive push reminders about upcoming shifts
													</div>
												</Label>
												<Switch
													id="push-shift-reminders"
													checked={settings.push.shiftReminders}
													onCheckedChange={(checked) =>
														handleToggle("push", "shiftReminders", checked)
													}
												/>
											</div>
											<Separator />
											<div className="flex items-center justify-between">
												<Label
													htmlFor="push-request-updates"
													className="flex-1">
													<div className="font-medium">Request Updates</div>
													<div className="text-sm text-muted-foreground">
														Receive push updates about your time-off and shift
														swap requests
													</div>
												</Label>
												<Switch
													id="push-request-updates"
													checked={settings.push.requestUpdates}
													onCheckedChange={(checked) =>
														handleToggle("push", "requestUpdates", checked)
													}
												/>
											</div>
											<Separator />
											<div className="flex items-center justify-between">
												<Label
													htmlFor="push-system-announcements"
													className="flex-1">
													<div className="font-medium">
														System Announcements
													</div>
													<div className="text-sm text-muted-foreground">
														Receive push notifications for important system
														announcements
													</div>
												</Label>
												<Switch
													id="push-system-announcements"
													checked={settings.push.systemAnnouncements}
													onCheckedChange={(checked) =>
														handleToggle("push", "systemAnnouncements", checked)
													}
												/>
											</div>
										</>
									) : (
										<div className="py-8 text-center">
											<p className="text-muted-foreground">
												Enable push notifications to configure these settings
											</p>
										</div>
									)}
								</div>
							</TabsContent>
						</Tabs>
					</CardContent>
					<CardFooter className="flex justify-between border-t pt-6">
						<p className="text-sm text-muted-foreground">
							Note: Some notification types may be required and cannot be
							disabled
						</p>
						<Button
							onClick={handleSave}
							disabled={saving}>
							{saving ? "Saving..." : "Save Changes"}
						</Button>
					</CardFooter>
				</Card>
			</div>
		</>
	);
}
