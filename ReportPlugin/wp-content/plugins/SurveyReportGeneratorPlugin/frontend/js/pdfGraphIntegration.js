
/**
 * PDF Graph Integration
 *
 * Generates dynamic Chart.js graphs and inserts
 * them into the existing jsPDF report.
 *
 * Requires:
 * - Chart.js
 * - api.js
 * - dynamicGraphs.js
 */

const PDFGraphIntegration = {

    /**
     * Generate graph images from evaluation scores.
     *
     * The evaluations argument must contain:
     * {
     *   initial: {
     *     insight: number,
     *     influence: number,
     *     impact: number
     *   },
     *   delayed: {
     *     insight: number,
     *     influence: number,
     *     impact: number
     *   }
     * }
     */
    async getGraphList(evaluations) {

        if (!window.DynamicGraphs) {
            throw new Error(
                "DynamicGraphs is not loaded. Check index.html."
            );
        }

        const scores = DynamicGraphs.normalizeScores(evaluations);

        const images = await DynamicGraphs.generateAllGraphs(scores);

        return [
            {
                title: "Initial Leadership Evaluation",
                imageData: images.initial
            },
            {
                title: "Delayed Leadership Evaluation",
                imageData: images.delayed
            },
            {
                title: "Leadership Development Comparison",
                imageData: images.comparison
            },
            {
                title: "Leadership Capability Profile",
                imageData: images.radar
            }
        ];
    },


    /**
     * Insert dynamically generated graphs into
     * the existing jsPDF document.
     *
     * One graph per new PDF page.
     */
    async addGraphsToPDF(pdf, evaluations) {

        const graphs = await this.getGraphList(evaluations);

        if (graphs.length === 0) {
            throw new Error(
                "No graphs available for the selected evaluations."
            );
        }

        for (const graph of graphs) {

            const imageData = graph.imageData;

            // Get actual image dimensions.
            const dimensions = pdf.getImageProperties(imageData);

            const pageWidth =
                pdf.internal.pageSize.getWidth();

            const pageHeight =
                pdf.internal.pageSize.getHeight();

            const margin = 15;
            const top = 35;
            const bottom = 25;

            const availableWidth =
                pageWidth - margin * 2;

            const availableHeight =
                pageHeight - top - bottom;

            const scale = Math.min(
                availableWidth / dimensions.width,
                availableHeight / dimensions.height
            );

            const imageWidth =
                dimensions.width * scale;

            const imageHeight =
                dimensions.height * scale;

            const imageX =
                (pageWidth - imageWidth) / 2;

            // Add a new page for each graph.
            pdf.addPage();

            // Graph title.
            pdf.setFontSize(16);
            pdf.setTextColor(0, 0, 0);

            pdf.text(
                graph.title,
                margin,
                20
            );

            // Insert Chart.js image.
            pdf.addImage(
                imageData,
                "PNG",
                imageX,
                top,
                imageWidth,
                imageHeight
            );

            // Mock backend data disclaimer.
            pdf.setFontSize(9);
            pdf.setTextColor(180, 50, 50);

            pdf.text(
                "DEMONSTRATION DATA - Not actual participant results",
                margin,
                pageHeight - 12
            );

            pdf.setTextColor(0, 0, 0);
        }
    },


    /**
     * Convenience method:
     * Fetch a participant's scores and insert
     * their graphs into an existing PDF.
     */
    async addParticipantGraphsToPDF(pdf, participantId) {

        if (!window.ParticipantAPI) {
            throw new Error(
                "ParticipantAPI is not loaded."
            );
        }

        const reportData =
            await ParticipantAPI.getParticipantReportData(
                participantId
            );

        await this.addGraphsToPDF(
            pdf,
            reportData.scores
        );

        return reportData;
    }
};


// Make available to other frontend scripts.
window.PDFGraphIntegration = PDFGraphIntegration;
