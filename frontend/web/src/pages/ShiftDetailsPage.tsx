import { ShiftDetails } from "../components/shift/ShiftDetails";

import { ContentContainer } from "../components/ui/content-container";
import { ContentSection } from "../components/ui/content-section";
import { PageHeader } from "../components/ui/page-header";

export default function ShiftDetailsPage() {
	return (
		<>
			<PageHeader
				title="Shift Details"
				description="View detailed information about this shift"
				showBackButton={true}
			/>
			<ContentContainer>
				<ShiftDetails />
			</ContentContainer>
		</>
	);
}
