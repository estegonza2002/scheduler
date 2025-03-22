import { ReactNode } from "react";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "./ui/dialog";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "./ui/card";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Separator } from "./ui/separator";
import { Employee } from "../api";
import {
	Mail,
	Phone,
	Calendar,
	MapPin,
	User,
	Info,
	ClipboardList,
	AlertCircle,
	DollarSign,
} from "lucide-react";

interface EmployeeDetailDialogProps {
	employee: Employee;
	trigger?: ReactNode;
}

export function EmployeeDetailDialog({
	employee,
	trigger,
}: EmployeeDetailDialogProps) {
	// Generate user initials for the avatar
	const initials = employee.name
		.split(" ")
		.map((n) => n[0])
		.join("")
		.toUpperCase();

	return (
		<Dialog>
			<DialogTrigger asChild>
				{trigger || <Button variant="ghost">View Details</Button>}
			</DialogTrigger>
			<DialogContent className="sm:max-w-[600px]">
				<DialogHeader>
					<DialogTitle>Employee Profile</DialogTitle>
					<DialogDescription>
						Detailed information about {employee.name}.
					</DialogDescription>
				</DialogHeader>

				<div className="grid gap-6">
					{/* Profile Header */}
					<div className="flex items-center gap-4">
						<Avatar className="h-16 w-16">
							<AvatarImage
								src={employee.avatar}
								alt={employee.name}
							/>
							<AvatarFallback className="text-lg">{initials}</AvatarFallback>
						</Avatar>
						<div>
							<h2 className="text-xl font-semibold">{employee.name}</h2>
							<p className="text-muted-foreground">
								{employee.position || employee.role}
							</p>
						</div>
					</div>

					<Separator />

					{/* Contact Information */}
					<Card>
						<CardHeader className="pb-2">
							<CardTitle className="text-base">Contact Information</CardTitle>
						</CardHeader>
						<CardContent className="space-y-3">
							<div className="flex items-center gap-2">
								<Mail className="h-4 w-4 text-muted-foreground" />
								<span>{employee.email}</span>
							</div>
							{employee.phone && (
								<div className="flex items-center gap-2">
									<Phone className="h-4 w-4 text-muted-foreground" />
									<span>{employee.phone}</span>
								</div>
							)}
							{employee.address && (
								<div className="flex items-center gap-2">
									<MapPin className="h-4 w-4 text-muted-foreground" />
									<span>{employee.address}</span>
								</div>
							)}
						</CardContent>
					</Card>

					{/* Employment Details */}
					<Card>
						<CardHeader className="pb-2">
							<CardTitle className="text-base">Employment Details</CardTitle>
						</CardHeader>
						<CardContent className="space-y-3">
							<div className="flex items-center gap-2">
								<User className="h-4 w-4 text-muted-foreground" />
								<span>
									<strong>Role:</strong> {employee.role}
								</span>
							</div>
							{employee.position && (
								<div className="flex items-center gap-2">
									<Info className="h-4 w-4 text-muted-foreground" />
									<span>
										<strong>Position:</strong> {employee.position}
									</span>
								</div>
							)}
							{employee.hourlyRate !== undefined && (
								<div className="flex items-center gap-2">
									<DollarSign className="h-4 w-4 text-muted-foreground" />
									<span>
										<strong>Hourly Rate:</strong> $
										{employee.hourlyRate.toFixed(2)}
									</span>
								</div>
							)}
							{employee.hireDate && (
								<div className="flex items-center gap-2">
									<Calendar className="h-4 w-4 text-muted-foreground" />
									<span>
										<strong>Hire Date:</strong>{" "}
										{new Date(employee.hireDate).toLocaleDateString()}
									</span>
								</div>
							)}
						</CardContent>
					</Card>

					{/* Additional Information */}
					{(employee.emergencyContact || employee.notes) && (
						<Card>
							<CardHeader className="pb-2">
								<CardTitle className="text-base">
									Additional Information
								</CardTitle>
							</CardHeader>
							<CardContent className="space-y-3">
								{employee.emergencyContact && (
									<div className="flex items-center gap-2">
										<AlertCircle className="h-4 w-4 text-muted-foreground" />
										<span>
											<strong>Emergency Contact:</strong>{" "}
											{employee.emergencyContact}
										</span>
									</div>
								)}
								{employee.notes && (
									<div className="flex items-start gap-2">
										<ClipboardList className="h-4 w-4 text-muted-foreground mt-1" />
										<div>
											<strong>Notes:</strong>
											<p className="text-muted-foreground mt-1">
												{employee.notes}
											</p>
										</div>
									</div>
								)}
							</CardContent>
						</Card>
					)}
				</div>
			</DialogContent>
		</Dialog>
	);
}
