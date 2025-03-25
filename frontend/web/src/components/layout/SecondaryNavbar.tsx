import React, { ReactNode } from "react";
import { cn } from "../../lib/utils";
import { MiniCalendar } from "../MiniCalendar";
import { SidebarProvider, Sidebar, SidebarInset } from "../ui/sidebar";
import { useLocation } from "react-router-dom";
import { CalendarIcon, ListTodo, Calendar, CalendarDays } from "lucide-react";
import { useAuth } from "../../lib/auth";
import { format } from "date-fns";

interface SecondaryNavbarProps {
	children: ReactNode;
	className?: string;
}

export function SecondaryNavbar({ children, className }: SecondaryNavbarProps) {
	return (
		<div
			className={cn(
				"fixed left-64 top-14 w-64 h-[calc(100%-3.5rem)] border-r bg-background z-30 shadow-sm",
				className
			)}>
			<div className="flex flex-col h-full overflow-y-auto scrollbar-thin scrollbar-thumb-muted-foreground/10">
				<div className="p-4 space-y-1">{children}</div>
			</div>
		</div>
	);
}

export function ScheduleSidebar({
	viewMode,
	onViewModeChange,
	onViewToday,
}: {
	viewMode: "calendar" | "daily";
	onViewModeChange: (mode: "calendar" | "daily") => void;
	onViewToday: () => void;
}) {
	const today = new Date();

	return (
		<SecondaryNavbar>
			<div className="space-y-6">
				{/* Schedule Selection */}
				<div>
					<h3 className="text-sm mb-2">Select Schedule</h3>
					<div className="relative">
						<select className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background appearance-none">
							<option>Spring 2025 Schedule</option>
							<option>Summer 2025 Schedule</option>
							<option>Fall 2025 Schedule</option>
						</select>
						<div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2">
							<svg
								className="h-4 w-4 text-muted-foreground"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor">
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M19 9l-7 7-7-7"
								/>
							</svg>
						</div>
					</div>
				</div>

				{/* View Tabs */}
				<div>
					<div className="flex border rounded-md overflow-hidden">
						<button
							onClick={() => onViewToday()}
							className="flex-1 text-center py-2 text-sm border-r">
							Today
						</button>
						<button
							onClick={() => onViewModeChange("calendar")}
							className={`flex-1 text-center py-2 text-sm ${
								viewMode === "calendar"
									? "bg-primary/10 text-primary font-medium"
									: ""
							}`}>
							Calendar
						</button>
					</div>
				</div>

				{/* Mini Calendar */}
				<div>
					<div className="flex justify-between items-center mb-3">
						<h3 className="text-sm">Calendar</h3>
						<button
							onClick={() => onViewModeChange("calendar")}
							className="flex items-center text-sm font-medium text-primary hover:underline">
							<svg
								className="h-4 w-4 mr-1"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								strokeWidth="2"
								strokeLinecap="round"
								strokeLinejoin="round">
								<rect
									x="3"
									y="4"
									width="18"
									height="18"
									rx="2"
									ry="2"></rect>
								<line
									x1="16"
									y1="2"
									x2="16"
									y2="6"></line>
								<line
									x1="8"
									y1="2"
									x2="8"
									y2="6"></line>
								<line
									x1="3"
									y1="10"
									x2="21"
									y2="10"></line>
							</svg>
							View Calendar
						</button>
					</div>
					<div className="border rounded-md p-2">
						<div className="flex justify-between items-center mb-2">
							<button className="h-6 w-6 flex items-center justify-center rounded-full hover:bg-accent">
								<svg
									className="h-4 w-4"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									strokeWidth="2"
									strokeLinecap="round"
									strokeLinejoin="round">
									<polyline points="15 18 9 12 15 6"></polyline>
								</svg>
							</button>
							<div className="text-sm font-medium">March 2025</div>
							<button className="h-6 w-6 flex items-center justify-center rounded-full hover:bg-accent">
								<svg
									className="h-4 w-4"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									strokeWidth="2"
									strokeLinecap="round"
									strokeLinejoin="round">
									<polyline points="9 18 15 12 9 6"></polyline>
								</svg>
							</button>
						</div>
						<div className="grid grid-cols-7 text-center text-xs mb-1">
							<div className="text-muted-foreground">Su</div>
							<div className="text-muted-foreground">Mo</div>
							<div className="text-muted-foreground">Tu</div>
							<div className="text-muted-foreground">We</div>
							<div className="text-muted-foreground">Th</div>
							<div className="text-muted-foreground">Fr</div>
							<div className="text-muted-foreground">Sa</div>
						</div>
						<div className="grid grid-cols-7 text-center gap-1">
							<div className="text-xs text-muted-foreground py-1">23</div>
							<div className="text-xs bg-primary/10 text-primary font-medium py-1 rounded-sm">
								24
							</div>
							<div className="text-xs py-1">25</div>
							<div className="text-xs py-1">26</div>
							<div className="text-xs py-1">27</div>
							<div className="text-xs py-1">28</div>
							<div className="text-xs text-muted-foreground py-1">1</div>
							{/* More days... */}
						</div>
					</div>
				</div>
			</div>
		</SecondaryNavbar>
	);
}

export function LocationsSidebar({
	onSearch,
	stateFilter,
	onStateFilterChange,
	statusFilter,
	onStatusFilterChange,
	onClearFilters,
	states,
}: {
	onSearch: (term: string) => void;
	stateFilter: string | null;
	onStateFilterChange: (state: string | null) => void;
	statusFilter: string | null;
	onStatusFilterChange: (status: string | null) => void;
	onClearFilters: () => void;
	states: string[];
}) {
	return (
		<SecondaryNavbar>
			<h3 className="font-medium mb-4">Filters</h3>

			<div className="space-y-4">
				{/* Search input */}
				<div>
					<label
						htmlFor="search-locations"
						className="text-sm font-medium mb-1.5 block">
						Search
					</label>
					<input
						id="search-locations"
						type="text"
						placeholder="Search locations..."
						className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
						onChange={(e) => onSearch(e.target.value)}
					/>
				</div>

				{/* State filter */}
				<div>
					<label
						htmlFor="state-filter"
						className="text-sm font-medium mb-1.5 block">
						State
					</label>
					<select
						id="state-filter"
						className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
						value={stateFilter || ""}
						onChange={(e) => onStateFilterChange(e.target.value || null)}>
						<option value="">All states</option>
						{states.map((state) => (
							<option
								key={state}
								value={state}>
								{state}
							</option>
						))}
					</select>
				</div>

				{/* Status filter */}
				<div>
					<label
						htmlFor="status-filter"
						className="text-sm font-medium mb-1.5 block">
						Status
					</label>
					<select
						id="status-filter"
						className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
						value={statusFilter || ""}
						onChange={(e) => onStatusFilterChange(e.target.value || null)}>
						<option value="">All statuses</option>
						<option value="active">Active</option>
						<option value="inactive">Inactive</option>
					</select>
				</div>

				{/* Clear filters button */}
				{(stateFilter || statusFilter) && (
					<button
						onClick={onClearFilters}
						className="w-full border border-input bg-background hover:bg-accent hover:text-accent-foreground rounded-md px-3 py-2 text-sm">
						Clear Filters
					</button>
				)}
			</div>
		</SecondaryNavbar>
	);
}

export function EmployeesSidebar({
	onSearch,
	positionFilter,
	onPositionFilterChange,
	onClearFilters,
	positions,
}: {
	onSearch: (term: string) => void;
	positionFilter: string | null;
	onPositionFilterChange: (position: string | null) => void;
	onClearFilters: () => void;
	positions: string[];
}) {
	return (
		<SecondaryNavbar>
			<h3 className="font-medium mb-4">Filters</h3>

			<div className="space-y-4">
				{/* Search input */}
				<div>
					<label
						htmlFor="search-employees"
						className="text-sm font-medium mb-1.5 block">
						Search
					</label>
					<input
						id="search-employees"
						type="text"
						placeholder="Search employees..."
						className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
						onChange={(e) => onSearch(e.target.value)}
					/>
				</div>

				{/* Position filter */}
				<div>
					<label
						htmlFor="position-filter"
						className="text-sm font-medium mb-1.5 block">
						Position
					</label>
					<select
						id="position-filter"
						className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
						value={positionFilter || ""}
						onChange={(e) => onPositionFilterChange(e.target.value || null)}>
						<option value="">All positions</option>
						{positions.map((position) => (
							<option
								key={position}
								value={position}>
								{position}
							</option>
						))}
					</select>
				</div>

				{/* Clear filters button */}
				{positionFilter && (
					<button
						onClick={onClearFilters}
						className="w-full border border-input bg-background hover:bg-accent hover:text-accent-foreground rounded-md px-3 py-2 text-sm">
						Clear Filters
					</button>
				)}
			</div>
		</SecondaryNavbar>
	);
}

export function ProfileSidebar({
	activeTab,
	onTabChange,
}: {
	activeTab: string;
	onTabChange: (tab: string) => void;
}) {
	const { user } = useAuth();
	const isAdmin = user?.user_metadata?.role === "admin";
	const hasPaidSubscription = true; // For demo purposes, showing all options

	return (
		<SecondaryNavbar>
			<div className="space-y-2">
				<h3 className="text-sm font-medium text-muted-foreground mb-2">
					Personal Settings
				</h3>
				<button
					onClick={() => onTabChange("profile")}
					className={`w-full text-left px-3 py-2 rounded-md ${
						activeTab === "profile"
							? "bg-primary/10 text-primary font-medium"
							: "hover:bg-accent"
					}`}>
					Personal Information
				</button>
				<button
					onClick={() => onTabChange("password")}
					className={`w-full text-left px-3 py-2 rounded-md ${
						activeTab === "password"
							? "bg-primary/10 text-primary font-medium"
							: "hover:bg-accent"
					}`}>
					Password
				</button>
				<button
					onClick={() => onTabChange("notifications")}
					className={`w-full text-left px-3 py-2 rounded-md ${
						activeTab === "notifications"
							? "bg-primary/10 text-primary font-medium"
							: "hover:bg-accent"
					}`}>
					Notifications
				</button>
				{isAdmin && (
					<>
						<div className="my-6 border-t pt-4">
							<h3 className="text-sm font-medium text-muted-foreground mb-2">
								Business Settings
							</h3>
						</div>
						<button
							onClick={() => onTabChange("business-profile")}
							className={`w-full text-left px-3 py-2 rounded-md ${
								activeTab === "business-profile"
									? "bg-primary/10 text-primary font-medium"
									: "hover:bg-accent"
							}`}>
							Business Profile
						</button>
						<button
							onClick={() => onTabChange("branding")}
							className={`w-full text-left px-3 py-2 rounded-md ${
								activeTab === "branding"
									? "bg-primary/10 text-primary font-medium"
									: "hover:bg-accent"
							}`}>
							Branding
						</button>

						{/* Billing options directly in the sidebar */}
						<div className="my-4">
							<h3 className="text-sm font-medium text-muted-foreground mb-2 pl-3">
								Billing
							</h3>
						</div>
						<button
							onClick={() => onTabChange("subscription")}
							className={`w-full text-left px-3 py-2 rounded-md ${
								activeTab === "subscription"
									? "bg-primary/10 text-primary font-medium"
									: "hover:bg-accent"
							}`}>
							Subscription
						</button>
						{hasPaidSubscription && (
							<>
								<button
									onClick={() => onTabChange("payment-methods")}
									className={`w-full text-left px-3 py-2 rounded-md ${
										activeTab === "payment-methods"
											? "bg-primary/10 text-primary font-medium"
											: "hover:bg-accent"
									}`}>
									Payment Methods
								</button>
								<button
									onClick={() => onTabChange("billing-history")}
									className={`w-full text-left px-3 py-2 rounded-md ${
										activeTab === "billing-history"
											? "bg-primary/10 text-primary font-medium"
											: "hover:bg-accent"
									}`}>
									Billing History
								</button>
							</>
						)}
					</>
				)}
			</div>
		</SecondaryNavbar>
	);
}
