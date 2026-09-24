# Individual Participant Report – Frontend Development Notes

## Overview

This implementation contains the frontend prototype for the Individual Participant Report workflow. This iteration uses HTML, CSS and JavaScript and is developed independently of the WordPress plugin environment. WordPress compatibility will be addressed when the frontend and backend/report-generation components are integrated.

The frontend demonstrates the user interface and interactions required to configure a participant report. Where backend data or report-generation functionality is not yet available, mock data and representative states are used.

## Functionality Implemented

The frontend currently supports:

- Loading participant names from a mock Excel file using the `Participant Name` column
- Dynamic participant selection
- Inline editing of the participant display name
- Evaluation-point selection (Initial, Final, Delayed, Managers and Select All)
- Benchmark-selection interface using placeholder benchmark options
- Representative "Your Leadership Profile" report preview
- Prototype PDF export through the Generate Report button
- Basic frontend validation and interaction states

The mock Excel file is used only for frontend development. Production participant data is expected to come from the integrated application/database.

## Report Preview and Generation

The report preview demonstrates how frontend selections affect the displayed report.

It is representative only and is not the final report renderer. Scores, graphics, fonts, formatting and benchmark data may change when the frontend is integrated with the completed data-processing and report-generation components.

The current Generate Report functionality exports the representative frontend preview as a prototype PDF.

The intended integrated workflow is:

Frontend configuration
→ report-generation component
→ final PDF generation
→ PDF returned to frontend
→ generated report displayed to user

## Client Feedback / Integration Dependencies

No unresolved client feedback currently prevents completion of the frontend prototype.

The following items depend on later integration or other development components and are therefore outside the current frontend implementation:

- Production database and participant-data integration
- Evaluation-data aggregation
- Final Insight, Influence and Impact score calculations
- Final benchmark data and calculations
- Final report-generation logic
- Backend processing
- Final frontend/report-generator integration

Representative frontend states and mock data are currently used where these components are unavailable.

## Handover Status

The frontend prototype is ready for handover following final testing and repository submission.

Mock data and prototype report-generation behaviour can be replaced during integration without recreating the existing frontend interaction model.