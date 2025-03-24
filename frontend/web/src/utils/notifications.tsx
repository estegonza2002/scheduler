import React from "react";
import { AlertTriangle, Bell, Check, Clock } from "lucide-react";

export const getNotificationIcon = (type: string) => {
	switch (type) {
		case "shift_update":
			return <Clock className="h-5 w-5 text-blue-500" />;
		case "shift_reminder":
			return <Bell className="h-5 w-5 text-purple-500" />;
		case "request_update":
			return <Check className="h-5 w-5 text-green-500" />;
		case "system":
			return <AlertTriangle className="h-5 w-5 text-amber-500" />;
		default:
			return <Bell className="h-5 w-5 text-gray-500" />;
	}
};
