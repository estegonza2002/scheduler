import { ShiftDetails } from "../components/shift/ShiftDetails";

import { ContentContainer } from "../components/ui/content-container";
import { ContentSection } from "../components/ui/content-section";
import {
	PageContentSpacing,
	SectionContentSpacing,
} from "../components/ui/header-content-spacing";

export default function ShiftDetailsPage() {
	return (
		<PageContentSpacing>
			<ContentContainer>
				<ShiftDetails />
			</ContentContainer>
		</PageContentSpacing>
	);
}
