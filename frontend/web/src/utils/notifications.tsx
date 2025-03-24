import React from "react";
import {
	AlertTriangle,
	Bell,
	Briefcase,
	Calendar,
	Check,
	Clock,
	FileEdit,
	Mail,
	MessageCircle,
	User,
} from "lucide-react";

export const getNotificationIcon = (type: string) => {
	switch (type) {
		case "shift_update":
			return <Clock className="h-6 w-6 text-blue-500" />;
		case "shift_reminder":
			return <Bell className="h-6 w-6 text-purple-500" />;
		case "request_update":
			return <Check className="h-6 w-6 text-green-500" />;
		case "system":
			return <AlertTriangle className="h-6 w-6 text-amber-500" />;
		case "message":
			return <MessageCircle className="h-6 w-6 text-indigo-500" />;
		case "document":
			return <FileEdit className="h-6 w-6 text-rose-500" />;
		case "calendar":
			return <Calendar className="h-6 w-6 text-cyan-500" />;
		case "user":
			return <User className="h-6 w-6 text-emerald-500" />;
		case "email":
			return <Mail className="h-6 w-6 text-orange-500" />;
		case "task":
			return <Briefcase className="h-6 w-6 text-violet-500" />;
		default:
			return <Bell className="h-6 w-6 text-gray-500" />;
	}
};
