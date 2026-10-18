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


## Unresolved UX Issues
- Awaiting access to exact client fonts, logos and visual assets.
- Final UX/frontend integration pending backend completion and merge.
- Final report visuals require client review and sign-off.
- V3 report prototype still to be completed/finalised.

## Recent Development Updates 11/10/26

- Added `api.js` to manage sample participant and benchmark data.
- Updated `script.js` to dynamically load participants and benchmarks.
- Added unique participant IDs for individual and batch selection.
- Preserved report preview and PDF generation functionality.
- Consolidated `script-dynamic.js` into `script.js`.
- Tested and pushed changes to GitHub.

## Developer Handover Notes

- `frontend/js/api.js` – Participant and benchmark data services.
- `frontend/js/script.js` – Frontend interactions, selections and PDF generation.
- `frontend/index.html` – Report interface; loads `api.js` before `script.js`.
- `mock-participants.xlsx` – Reference sample participant data.

**Pending integration:** Replace sample data with real Gravity Forms data, connect evaluation scores and benchmarks, and integrate final report generation.

## Recent Development Updates 18/10/26

- Merged `feature-reportGraphs` into `feature/individual-report-frontend`.
- Added `pdfGraphIntegration.js` to manage graph images in generated PDF reports.
- Integrated four existing graphs: Insight Initial, Insight Delayed, Self-Awareness Comparison and Influence Comparison.
- Updated `index.html` to load `pdfGraphIntegration.js`.
- Updated `script.js` to include graph images in individual and batch PDF generation.
- Fixed PDF formatting issues caused by the report preview being compressed during export.
- Preserved existing participant selection, evaluation-point selection, benchmark selection and report preview functionality.
- Tested PDF generation using the integrated graph images.

The integrated graphs currently use sample data. Final scoring calculations and dynamic graph generation remain dependent on backend integration.

## Developer Handover Notes – Additional Files

- `frontend/js/pdfGraphIntegration.js` – Loads graph images and adds them to generated PDF reports.
- `report-graphs/output/` – Contains the four sample graph images used in PDF generation.