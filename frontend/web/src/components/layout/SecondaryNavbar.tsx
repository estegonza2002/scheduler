import React, { ReactNode } from "react";
import { cn } from "../../lib/utils";
import { MiniCalendar } from "../MiniCalendar";
import { SidebarProvider, Sidebar, SidebarInset } from "../ui/sidebar";
import { useLocation } from "react-router-dom";
import { CalendarIcon, ListTodo, Calendar, CalendarDays } from "lucide-react";
import { useAuth } from "../../lib/auth";
import { format } from "date-fns";
import { Button } from "../ui/button";

interface SecondaryNavbarProps {
	children: ReactNode;
	className?: string;
	sidebarState?: "expanded" | "collapsed";
}

export function SecondaryNavbar({
	children,
	className,
	sidebarState = "expanded",
}: SecondaryNavbarProps) {
	const isCollapsed = sidebarState === "collapsed";

	return (
		<div
			className={cn(
				"fixed top-14 h-[calc(100%-3.5rem)] border-r bg-background z-30 transition-all duration-200 secondary-navbar",
				isCollapsed && "secondary-navbar-minimized",
				className
			)}
			style={{
				left: isCollapsed
					? "var(--sidebar-width-icon)"
					: "var(--sidebar-width)",
			}}>
			<aside className="flex flex-col h-full overflow-y-auto px-4 py-6">
				{children}
			</aside>
		</div>
	);
}

export function ScheduleSidebar({
	viewMode,
	onViewModeChange,
	onViewToday,
	sidebarState,
}: {
	viewMode: "calendar" | "daily";
	onViewModeChange: (mode: "calendar" | "daily") => void;
	onViewToday: () => void;
	sidebarState?: "expanded" | "collapsed";
}) {
	const today = new Date();

	return (
		<SecondaryNavbar sidebarState={sidebarState}>
			<div className="space-y-6">
				{/* Schedule Selection */}
				<div>
					<h3 className="text-sm font-medium text-muted-foreground mb-3">
						Select Schedule
					</h3>
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
					<div className="flex rounded-md overflow-hidden shadow-sm">
						<Button
							variant="ghost"
							onClick={() => onViewToday()}
							className="flex-1 rounded-none text-center py-2 text-sm">
							Today
						</Button>
						<Button
							variant={viewMode === "calendar" ? "secondary" : "ghost"}
							onClick={() => onViewModeChange("calendar")}
							className="flex-1 rounded-none text-center py-2 text-sm">
							Calendar
						</Button>
					</div>
				</div>

				{/* Mini Calendar */}
				<div>
					<div className="flex justify-between items-center mb-3">
						<h3 className="text-sm font-medium text-muted-foreground">
							Calendar
						</h3>
						<Button
							variant="ghost"
							size="sm"
							onClick={() => onViewModeChange("calendar")}
							className="flex items-center text-sm font-medium h-7 px-2">
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
						</Button>
					</div>
					<div className="rounded-md p-2 bg-muted/30">
						<div className="flex justify-between items-center mb-2">
							<Button
								variant="ghost"
								size="icon"
								className="h-6 w-6 rounded-full p-0">
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
							</Button>
							<div className="text-sm font-medium">March 2025</div>
							<Button
								variant="ghost"
								size="icon"
								className="h-6 w-6 rounded-full p-0">
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
							</Button>
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
	sidebarState,
}: {
	onSearch: (term: string) => void;
	stateFilter: string | null;
	onStateFilterChange: (state: string | null) => void;
	statusFilter: string | null;
	onStatusFilterChange: (status: string | null) => void;
	onClearFilters: () => void;
	states: string[];
	sidebarState?: "expanded" | "collapsed";
}) {
	return (
		<SecondaryNavbar sidebarState={sidebarState}>
			<h3 className="text-sm font-medium text-muted-foreground mb-4">
				Filters
			</h3>

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
					<Button
						variant="outline"
						onClick={onClearFilters}
						className="w-full">
						Clear Filters
					</Button>
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
	sidebarState,
}: {
	onSearch: (term: string) => void;
	positionFilter: string | null;
	onPositionFilterChange: (position: string | null) => void;
	onClearFilters: () => void;
	positions: string[];
	sidebarState?: "expanded" | "collapsed";
}) {
	return (
		<SecondaryNavbar sidebarState={sidebarState}>
			<h3 className="text-sm font-medium text-muted-foreground mb-4">
				Filters
			</h3>

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
					<Button
						variant="outline"
						onClick={onClearFilters}
						className="w-full">
						Clear Filters
					</Button>
				)}
			</div>
		</SecondaryNavbar>
	);
}

export function ProfileSidebar({
	activeTab,
	onTabChange,
	sidebarState,
}: {
	activeTab: string;
	onTabChange: (tab: string) => void;
	sidebarState?: "expanded" | "collapsed";
}) {
	const { user } = useAuth();
	const isAdmin = user?.user_metadata?.role === "admin";
	const hasPaidSubscription = true; // For demo purposes, showing all options

	return (
		<SecondaryNavbar sidebarState={sidebarState}>
			<div className="space-y-1">
				<h3 className="text-sm font-medium text-muted-foreground mb-3">
					Personal Settings
				</h3>

				<Button
					variant={activeTab === "profile" ? "secondary" : "ghost"}
					onClick={() => onTabChange("profile")}
					className="w-full justify-start text-left font-normal">
					Personal Information
				</Button>

				<Button
					variant={activeTab === "password" ? "secondary" : "ghost"}
					onClick={() => onTabChange("password")}
					className="w-full justify-start text-left font-normal">
					Password
				</Button>

				<Button
					variant={activeTab === "appearance" ? "secondary" : "ghost"}
					onClick={() => onTabChange("appearance")}
					className="w-full justify-start text-left font-normal">
					Appearance
				</Button>

				<Button
					variant={activeTab === "notifications" ? "secondary" : "ghost"}
					onClick={() => onTabChange("notifications")}
					className="w-full justify-start text-left font-normal">
					Notifications
				</Button>

				{isAdmin && (
					<>
						<div className="mt-8 mb-3">
							<h3 className="text-sm font-medium text-muted-foreground">
								Business Settings
							</h3>
						</div>

						<Button
							variant={activeTab === "business-profile" ? "secondary" : "ghost"}
							onClick={() => onTabChange("business-profile")}
							className="w-full justify-start text-left font-normal">
							Business Profile
						</Button>

						{/* Branding button hidden temporarily
						<Button
							variant={activeTab === "branding" ? "secondary" : "ghost"}
							onClick={() => onTabChange("branding")}
							className="w-full justify-start text-left font-normal">
							Branding
						</Button>
						*/}

						{/* Billing options */}
						<div className="mt-8 mb-3">
							<h3 className="text-sm font-medium text-muted-foreground">
								Billing
							</h3>
						</div>

						<Button
							variant={activeTab === "subscription" ? "secondary" : "ghost"}
							onClick={() => onTabChange("subscription")}
							className="w-full justify-start text-left font-normal">
							Subscription
						</Button>

						{hasPaidSubscription && (
							<>
								<Button
									variant={
										activeTab === "payment-methods" ? "secondary" : "ghost"
									}
									onClick={() => onTabChange("payment-methods")}
									className="w-full justify-start text-left font-normal">
									Payment Methods
								</Button>

								<Button
									variant={
										activeTab === "billing-history" ? "secondary" : "ghost"
									}
									onClick={() => onTabChange("billing-history")}
									className="w-full justify-start text-left font-normal">
									Billing History
								</Button>
							</>
						)}
					</>
				)}
			</div>
		</SecondaryNavbar>
	);
}
