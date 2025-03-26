import { ShiftDetails } from "../components/shift/ShiftDetails";

import { ContentContainer } from "../components/ui/content-container";
import { ContentSection } from "../components/ui/content-section";
import { PageHeader } from "../components/ui/page-header";
import {
	PageContentSpacing,
	SectionContentSpacing,
} from "../components/ui/header-content-spacing";

export default function ShiftDetailsPage() {
	return (
		<>
			<PageHeader
				title="Shift Details"
				description="View detailed information about this shift"
				showBackButton={true}
			/>
			<PageContentSpacing>
				<ContentContainer>
					<ShiftDetails />
				</ContentContainer>
			</PageContentSpacing>
		</>
	);
}
