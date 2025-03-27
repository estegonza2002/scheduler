import { ShiftDetails } from "../components/shift/ShiftDetails";

import { ContentContainer } from "../components/ui/content-container";
import { PageHeader } from "../components/ui/page-header";

export default function ShiftDetailsPage() {
	return (
		<>
			<PageHeader
				title="Shift Details"
				description="View and manage shift information, assigned employees, and tasks"
				showBackButton={true}
			/>
			<ContentContainer>
				<ShiftDetails />
			</ContentContainer>
		</>
	);
}
