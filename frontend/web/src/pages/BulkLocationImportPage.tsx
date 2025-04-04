import { useState, useEffect } from "react";
import { Location } from "@/api";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { BulkLocationImport } from "@/components/BulkLocationImport";
import { Helmet } from "react-helmet";
import { useHeader } from "@/lib/header-context";
import { ContentContainer } from "@/components/ui/content-container";
import { ContentSection } from "@/components/ui/content-section";
import { useOrganizationId } from "@/hooks/useOrganizationId";
import { toast } from "sonner";

export default function BulkLocationImportPage() {
	const { updateHeader } = useHeader();
	const navigate = useNavigate();
	const organizationId = useOrganizationId();
	const [successCount, setSuccessCount] = useState(0);

	// Set the page header on component mount
	useEffect(() => {
		updateHeader({
			title: "Bulk Import Locations",
			description: "Upload multiple locations at once",
			actions: null,
		});
	}, [updateHeader]);

	const handleLocationsCreated = (locations: Location[]) => {
		setSuccessCount(locations.length);
		toast.success(`Successfully imported ${locations.length} locations`);
	};

	return (
		<>
			<Helmet>
				<title>Bulk Import Locations</title>
			</Helmet>

			<ContentContainer>
				<ContentSection title="Import Locations">
					<div className="max-w-4xl mx-auto">
						{successCount > 0 ? (
							<div className="flex flex-col items-center py-8 text-center space-y-4">
								<div className="rounded-full bg-primary/10 p-4 mb-2">
									<svg
										xmlns="http://www.w3.org/2000/svg"
										className="h-8 w-8 text-primary"
										fill="none"
										viewBox="0 0 24 24"
										stroke="currentColor">
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M5 13l4 4L19 7"
										/>
									</svg>
								</div>
								<h2 className="text-2xl font-semibold">Import Complete!</h2>
								<p className="text-muted-foreground">
									Successfully imported {successCount} locations.
								</p>
								<div className="flex gap-3 mt-4">
									<Button onClick={() => setSuccessCount(0)}>
										Import More Locations
									</Button>
									<Button
										variant="outline"
										onClick={() => navigate("/locations")}>
										View All Locations
									</Button>
								</div>
							</div>
						) : (
							<BulkLocationImport
								organizationId={organizationId}
								onLocationsCreated={handleLocationsCreated}
								onCancel={() => navigate("/locations")}
							/>
						)}
					</div>
				</ContentSection>
			</ContentContainer>
		</>
	);
}
