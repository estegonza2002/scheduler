import { Button } from "../ui/button";
import { Edit, Plus, Trash } from "lucide-react";
import { parseSimpleMarkdown } from "../../utils/text-formatting";

interface ShiftNotesProps {
	notes: string;
	onEditClick: () => void;
	onClearClick: () => void;
}

export function ShiftNotes({
	notes,
	onEditClick,
	onClearClick,
}: ShiftNotesProps) {
	return (
		<div className="mb-6">
			<div className="flex items-center justify-between mb-4">
				<h2 className="text-lg font-medium flex items-center">Manager Notes</h2>
				<div className="flex gap-2">
					{notes && (
						<Button
							variant="outline"
							size="sm"
							className="gap-1 text-destructive border-destructive/30 hover:bg-destructive/10"
							onClick={onClearClick}>
							<Trash className="h-4 w-4" /> Clear Notes
						</Button>
					)}
					<Button
						variant="outline"
						size="sm"
						className="gap-1"
						onClick={onEditClick}>
						<Edit className="h-4 w-4" /> {notes ? "Edit Notes" : "Add Notes"}
					</Button>
				</div>
			</div>

			{notes ? (
				<div className="bg-white rounded-md border overflow-hidden">
					<div className="p-4">
						<div className="space-y-2">
							{notes.includes("VIP") && (
								<div className="flex items-start text-amber-600 font-medium">
									<svg
										xmlns="http://www.w3.org/2000/svg"
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										strokeWidth="2"
										strokeLinecap="round"
										strokeLinejoin="round"
										className="w-4 h-4 mr-2 mt-0.5">
										<path d="M12 8a2.83 2.83 0 0 0 4 4 4 4 0 1 1-4-4" />
										<path d="M12 2v2" />
										<path d="M12 20v2" />
										<path d="M20 12h2" />
										<path d="M2 12h2" />
									</svg>
									<div
										dangerouslySetInnerHTML={{
											__html: parseSimpleMarkdown(notes),
										}}
									/>
								</div>
							)}

							{notes.includes("Training") && (
								<div className="flex items-start text-blue-600">
									<svg
										xmlns="http://www.w3.org/2000/svg"
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										strokeWidth="2"
										strokeLinecap="round"
										strokeLinejoin="round"
										className="w-4 h-4 mr-2 mt-0.5">
										<path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
										<path d="M13.73 21a2 2 0 0 1-3.46 0" />
									</svg>
									<div
										dangerouslySetInnerHTML={{
											__html: parseSimpleMarkdown(notes),
										}}
									/>
								</div>
							)}

							{!notes.includes("VIP") && !notes.includes("Training") && (
								<div className="flex items-start">
									<svg
										xmlns="http://www.w3.org/2000/svg"
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										strokeWidth="2"
										strokeLinecap="round"
										strokeLinejoin="round"
										className="w-4 h-4 mr-2 mt-0.5 text-muted-foreground">
										<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
									</svg>
									<div
										dangerouslySetInnerHTML={{
											__html: parseSimpleMarkdown(notes),
										}}
									/>
								</div>
							)}

							{notes.includes("meeting") && (
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
										<path d="M3 12a9 9 0 1 0 18 0a9 9 0 0 0-18 0" />
										<path d="M12 7v5l2 2" />
									</svg>
									<span>
										Staff meeting{" "}
										{notes.match(/at (\d+(?::\d+)?(?:am|pm)?)/i)?.[1] || ""}
									</span>
								</div>
							)}

							{/* Additional note indicators */}
							{renderNoteIndicators(notes)}
						</div>
					</div>
				</div>
			) : (
				<div className="bg-white border rounded-md p-6 text-center">
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
						Add notes to provide additional information about the shift.
					</p>
					<Button onClick={onEditClick}>
						<Plus className="h-4 w-4 mr-2" /> Add Notes
					</Button>
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
