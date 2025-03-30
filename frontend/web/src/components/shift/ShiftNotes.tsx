import { Button } from "../ui/button";
import { Edit, Plus, Trash, Lock } from "lucide-react";
import { parseSimpleMarkdown } from "../../utils/text-formatting";
import { cn } from "../../lib/utils";
import { Badge } from "../ui/badge";

interface ShiftNotesProps {
	notes: string;
	onEditClick: () => void;
	onClearClick: () => void;
	isCompleted?: boolean;
}

export function ShiftNotes({
	notes,
	onEditClick,
	onClearClick,
	isCompleted = false,
}: ShiftNotesProps) {
	return (
		<div className="mb-6">
			<div className="flex items-center justify-between mb-4">
				<h2 className="text-lg font-medium">
					Notes
					{isCompleted && (
						<Badge
							variant="outline"
							className="ml-2 bg-gray-100 text-gray-700">
							<Lock className="h-3 w-3 mr-1" />
							Locked
						</Badge>
					)}
				</h2>
				<div className="flex gap-2">
					{!isCompleted && (
						<>
							<Button
								variant="outline"
								size="sm"
								onClick={onEditClick}
								disabled={isCompleted}>
								<Edit className="h-4 w-4 mr-1" /> Edit
							</Button>
							{notes.trim().length > 0 && (
								<Button
									variant="outline"
									size="sm"
									className="text-destructive hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30"
									onClick={onClearClick}
									disabled={isCompleted}>
									<Trash className="h-4 w-4 mr-1" /> Clear
								</Button>
							)}
						</>
					)}
				</div>
			</div>

			{notes.trim().length > 0 ? (
				<div className="bg-white border rounded-md p-6">
					<div
						className="prose max-w-none prose-neutral prose-sm"
						dangerouslySetInnerHTML={{
							__html: parseSimpleMarkdown(notes),
						}}
					/>
				</div>
			) : (
				<div
					className={cn(
						"bg-white border rounded-md p-6 text-center",
						isCompleted && "bg-gray-50"
					)}>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						strokeWidth="2"
						strokeLinecap="round"
						strokeLinejoin="round"
						className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3">
						<rect
							width="18"
							height="18"
							x="3"
							y="3"
							rx="2"
						/>
						<path d="M8 12h8" />
					</svg>
					<h3 className="text-base font-medium mb-1">No notes added yet</h3>
					<p className="text-sm text-muted-foreground mb-4">
						{isCompleted
							? "This shift was completed without any notes."
							: "Add notes to provide additional information about the shift."}
					</p>
					{!isCompleted && (
						<Button
							onClick={onEditClick}
							disabled={isCompleted}>
							<Plus className="h-4 w-4 mr-2" /> Add Notes
						</Button>
					)}
				</div>
			)}
		</div>
	);
}

// Helper function to render additional note indicators
function renderNoteIndicators(notes: string) {
	return (
		<>
			{notes.includes("inspection") && (
				<div className="flex items-center mt-2 text-xs text-muted-foreground">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						strokeWidth="2"
						strokeLinecap="round"
						strokeLinejoin="round"
						className="w-3 h-3 mr-1">
						<path d="M8 3H5a2 2 0 0 0-2 2v3" />
						<path d="M21 8V5a2 2 0 0 0-2-2h-3" />
						<path d="M3 16v3a2 2 0 0 0 2 2h3" />
						<path d="M16 21h3a2 2 0 0 0 2-2v-3" />
						<path d="m9 11 3 3" />
						<path d="m12 8 3 3" />
						<path d="m15 5 1 1" />
						<path d="m5 15 1 1" />
						<path d="m8 18 1 1" />
					</svg>
					<span>
						Vehicle inspection{" "}
						{notes.match(/at (\d+(?::\d+)?(?:am|pm)?)/i)?.[1] || ""}
					</span>
				</div>
			)}

			{notes.includes("rush") && (
				<div className="flex items-center mt-2 text-xs text-orange-500">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						strokeWidth="2"
						strokeLinecap="round"
						strokeLinejoin="round"
						className="w-3 h-3 mr-1">
						<path d="M13 2 L13 10 L20 10" />
						<circle
							cx="12"
							cy="14"
							r="8"
						/>
					</svg>
					<span>High volume expected</span>
				</div>
			)}

			{notes.includes("closing") && (
				<div className="flex items-center mt-2 text-xs text-muted-foreground">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						strokeWidth="2"
						strokeLinecap="round"
						strokeLinejoin="round"
						className="w-3 h-3 mr-1">
						<path d="m18 6-2-2H8L6 6" />
						<path d="M5 10V6a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-5Z" />
						<path d="M10 16h4" />
					</svg>
					<span>Responsible for end-of-day closing</span>
				</div>
			)}
		</>
	);
}
