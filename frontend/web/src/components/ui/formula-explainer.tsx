import { Calculator, FunctionSquare } from "lucide-react";
import { Button } from "./button";
import { cn } from "@/lib/utils";
import {
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
	SheetDescription,
} from "./sheet";
import { Separator } from "./separator";

interface FormulaExplainerProps {
	formula: string;
	description: string;
	example?: string;
	variables?: Array<{ name: string; description: string }>;
	variantColor?:
		| "blue"
		| "green"
		| "red"
		| "amber"
		| "purple"
		| "indigo"
		| "emerald";
}

export function FormulaExplainer({
	formula,
	description,
	example,
	variables,
	variantColor = "blue",
}: FormulaExplainerProps) {
	const colorButton = {
		blue: "bg-blue-100 text-blue-700 hover:bg-blue-200",
		green: "bg-green-100 text-green-700 hover:bg-green-200",
		red: "bg-red-100 text-red-700 hover:bg-red-200",
		amber: "bg-amber-100 text-amber-700 hover:bg-amber-200",
		purple: "bg-purple-100 text-purple-700 hover:bg-purple-200",
		indigo: "bg-indigo-100 text-indigo-700 hover:bg-indigo-200",
		emerald: "bg-emerald-100 text-emerald-700 hover:bg-emerald-200",
	};

	const colorText = {
		blue: "text-blue-600",
		green: "text-green-600",
		red: "text-red-600",
		amber: "text-amber-600",
		purple: "text-purple-600",
		indigo: "text-indigo-600",
		emerald: "text-emerald-600",
	};

	return (
		<Sheet>
			<SheetTrigger asChild>
				<Button
					variant="ghost"
					size="icon"
					className={cn(
						"rounded-full h-7 w-7 p-0 ml-1.5 shadow-sm",
						"hover:scale-110 hover:shadow-md focus:scale-110 focus:shadow-md",
						"transition-all duration-200 ring-offset-2 focus:ring-2 ring-offset-background",
						colorButton[variantColor]
					)}>
					<FunctionSquare className="h-4 w-4" />
					<span className="sr-only">View formula</span>
				</Button>
			</SheetTrigger>
			<SheetContent
				side="bottom"
				className="max-h-[85vh]">
				<SheetHeader className="pb-4">
					<SheetTitle className="flex items-center gap-2">
						<Calculator className="h-5 w-5" />
						Formula Explanation
					</SheetTitle>
					<SheetDescription>
						Understanding how this metric is calculated
					</SheetDescription>
				</SheetHeader>

				<div className="space-y-6">
					<div className="space-y-3">
						<h3 className="text-sm font-medium">Formula:</h3>
						<div className="p-3 bg-muted rounded-md font-mono text-sm">
							{formula}
						</div>
					</div>

					<Separator />

					<div className="space-y-3">
						<h3 className="text-sm font-medium">Explanation:</h3>
						<p className="text-sm text-muted-foreground">{description}</p>
					</div>

					{variables && variables.length > 0 && (
						<>
							<Separator />
							<div className="space-y-3">
								<h3 className="text-sm font-medium">Variables:</h3>
								<div className="grid gap-3 grid-cols-1">
									{variables.map((variable, index) => (
										<div
											key={index}
											className="flex items-start gap-3 p-3 rounded-md bg-muted/50 border">
											<div className="px-2 py-1 rounded-md font-mono text-xs font-medium whitespace-nowrap bg-background border">
												{variable.name}
											</div>
											<span className="text-sm">{variable.description}</span>
										</div>
									))}
								</div>
							</div>
						</>
					)}

					{example && (
						<>
							<Separator />
							<div className="space-y-3">
								<h3 className="text-sm font-medium">Example:</h3>
								<div className="p-3 rounded-md bg-muted/50 border">
									<p className="text-sm">{example}</p>
								</div>
							</div>
						</>
					)}
				</div>
			</SheetContent>
		</Sheet>
	);
}
