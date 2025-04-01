import { useTheme } from "next-themes";
import { Toaster as Sonner, ToasterProps } from "sonner";
import { cn } from "@/lib/utils";

const Toaster = ({ ...props }: ToasterProps) => {
	const { theme = "system" } = useTheme();

	return (
		<Sonner
			theme={theme as ToasterProps["theme"]}
			position="bottom-center"
			className="toaster group"
			toastOptions={{
				classNames: {
					toast: "bg-background text-foreground border-border",
					success:
						"bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20",
					error: "bg-destructive/10 text-destructive border-destructive/20",
					warning:
						"bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20",
					info: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
					actionButton: "bg-primary text-primary-foreground",
				},
			}}
			{...props}
		/>
	);
};

export { Toaster };
