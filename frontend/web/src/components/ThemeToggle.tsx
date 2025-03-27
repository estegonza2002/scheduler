import { useTheme } from "./ThemeProvider";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Switch } from "./ui/switch";
import { SunIcon, MoonIcon, MonitorIcon } from "lucide-react";

interface ThemeToggleProps {
	className?: string;
}

export function ThemeToggle({ className }: ThemeToggleProps) {
	const { theme, setTheme } = useTheme();

	return (
		<div className={className}>
			<div className="flex items-center justify-between">
				<div className="space-y-0.5">
					<Label className="text-base">Dark Mode</Label>
					<p className="text-sm text-muted-foreground">
						Toggle between light and dark themes
					</p>
				</div>
				<Switch
					checked={theme === "dark"}
					onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
				/>
			</div>

			<div className="flex items-center justify-between mt-6">
				<Label className="text-base">Theme</Label>
				<div className="flex gap-2">
					<Button
						variant={theme === "light" ? "default" : "outline"}
						size="icon"
						onClick={() => setTheme("light")}
						title="Light">
						<SunIcon className="h-4 w-4" />
						<span className="sr-only">Light</span>
					</Button>
					<Button
						variant={theme === "dark" ? "default" : "outline"}
						size="icon"
						onClick={() => setTheme("dark")}
						title="Dark">
						<MoonIcon className="h-4 w-4" />
						<span className="sr-only">Dark</span>
					</Button>
					<Button
						variant={theme === "system" ? "default" : "outline"}
						size="icon"
						onClick={() => setTheme("system")}
						title="System">
						<MonitorIcon className="h-4 w-4" />
						<span className="sr-only">System</span>
					</Button>
				</div>
			</div>
		</div>
	);
}
