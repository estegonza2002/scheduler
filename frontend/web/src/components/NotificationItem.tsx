import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { getNotificationIcon } from "../utils/notifications";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Check, Trash2, Clock, ExternalLink } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";

interface NotificationItemProps {
	notification: {
		id: string;
		type: string;
		title: string;
		message: string;
		isRead: boolean;
		isActionRequired?: boolean;
		actionUrl?: string;
		createdAt: string;
	};
	onMarkAsRead?: (id: string) => void;
	onDismiss?: (id: string) => void;
	useSampleData?: boolean;
	showActions?: boolean;
	compact?: boolean;
}

export function NotificationItem({
	notification,
	onMarkAsRead,
	onDismiss,
	useSampleData = false,
	showActions = true,
	compact = false,
}: NotificationItemProps) {
	const icon = getNotificationIcon(notification.type);
	const formattedTime = formatDistanceToNow(new Date(notification.createdAt), {
		addSuffix: true,
	});

	return (
		<Card
			className={cn(
				"rounded-none shadow-none border-b last:border-b-0",
				!notification.isRead && "bg-muted/20"
			)}>
			<CardContent
				className={cn(
					"p-4 hover:bg-muted/50 transition-colors",
					compact && "px-4 py-3"
				)}>
				<div className="flex gap-4">
					<div className="flex-shrink-0">
						<div
							className={cn(
								"rounded-full p-2",
								!notification.isRead ? "bg-primary/10" : "bg-muted/50"
							)}>
							{icon}
						</div>
					</div>

					<div className="flex-1 min-w-0">
						<div className="flex justify-between items-start gap-2">
							<div className="flex flex-col">
								<h3
									className={cn(
										"text-sm font-medium",
										!notification.isRead && "font-semibold"
									)}>
									{notification.title}
								</h3>
								<p className="text-sm text-muted-foreground mt-1 line-clamp-2">
									{notification.message}
								</p>
							</div>

							<div className="flex items-center gap-1 flex-shrink-0">
								<TooltipProvider>
									<Tooltip>
										<TooltipTrigger asChild>
											<div className="flex items-center text-xs text-muted-foreground">
												<Clock className="h-3 w-3 mr-1" />
												<span>{formattedTime}</span>
											</div>
										</TooltipTrigger>
										<TooltipContent>
											{new Date(notification.createdAt).toLocaleString()}
										</TooltipContent>
									</Tooltip>
								</TooltipProvider>

								{showActions && (
									<DropdownMenu>
										<DropdownMenuTrigger asChild>
											<Button
												variant="ghost"
												size="icon"
												className="h-6 w-6 rounded-full">
												<span className="sr-only">Actions</span>
												<span className="h-1 w-1 rounded-full bg-foreground inline-block"></span>
												<span className="h-1 w-1 rounded-full bg-foreground inline-block ml-0.5"></span>
												<span className="h-1 w-1 rounded-full bg-foreground inline-block ml-0.5"></span>
											</Button>
										</DropdownMenuTrigger>
										<DropdownMenuContent
											align="end"
											className="w-40">
											<DropdownMenuLabel>Actions</DropdownMenuLabel>
											<DropdownMenuSeparator />
											{!notification.isRead && onMarkAsRead && (
												<DropdownMenuItem
													onClick={() => onMarkAsRead(notification.id)}
													disabled={useSampleData}>
													<Check className="h-4 w-4 mr-2" />
													Mark as read
												</DropdownMenuItem>
											)}
											{onDismiss && (
												<DropdownMenuItem
													onClick={() => onDismiss(notification.id)}
													disabled={useSampleData}
													className="text-destructive">
													<Trash2 className="h-4 w-4 mr-2" />
													Delete
												</DropdownMenuItem>
											)}
										</DropdownMenuContent>
									</DropdownMenu>
								)}
							</div>
						</div>

						{(notification.isActionRequired || notification.actionUrl) && (
							<div className="mt-3 flex items-center gap-2">
								{notification.isActionRequired && (
									<Badge
										variant="secondary"
										className="mr-1">
										Action Required
									</Badge>
								)}
								{notification.actionUrl && (
									<Button
										variant="outline"
										size="sm"
										className="h-8 rounded-full"
										asChild>
										<Link to={notification.actionUrl}>
											<ExternalLink className="h-3 w-3 mr-1" />
											View Details
										</Link>
									</Button>
								)}
							</div>
						)}
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
