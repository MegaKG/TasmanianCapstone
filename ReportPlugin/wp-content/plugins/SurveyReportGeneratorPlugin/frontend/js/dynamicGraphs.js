
const DynamicGraphs = (() => {

    const GRAPH_CONFIG = {
        width: 1000,
        height: 600,
        maxScore: 5,

        categories: [
            "Insight",
            "Influence",
            "Impact"
        ],

        colors: {
            initial: "#3949AB",
            delayed: "#26A69A",
            text: "#333333",
            grid: "#E5E7EB",
            white: "#FFFFFF"
        }
    };


    function validateScores(scores) {

        if (!scores || typeof scores !== "object") {
            throw new Error("Evaluation scores are missing.");
        }

        if (!scores.initial || !scores.delayed) {
            throw new Error(
                "Initial and delayed evaluations are required."
            );
        }

        for (const stage of ["initial", "delayed"]) {

            for (const category of [
                "insight",
                "influence",
                "impact"
            ]) {

                const value = scores[stage][category];

                if (
                    typeof value !== "number" ||
                    !Number.isFinite(value) ||
                    value < 0 ||
                    value > GRAPH_CONFIG.maxScore
                ) {
                    throw new Error(
                        `Invalid score: ${stage}.${category}`
                    );
                }
            }
        }

        return true;
    }


    function normalizeScores(apiData) {

        if (!apiData || typeof apiData !== "object") {
            throw new Error(
                "No evaluation data returned by the API."
            );
        }

        /**
         * Calculate the average of a category's
         * individual capability scores.
         *
         * Example:
         *
         * "Insight": {
         *     "Self Awareness": 3.5,
         *     "Social Awareness": 4.1
         * }
         *
         * Average = 3.8
         */
        function average(category) {

            if (
                !category ||
                typeof category !== "object" ||
                Array.isArray(category)
            ) {
                throw new Error(
                    "Missing or invalid evaluation category."
                );
            }

            const values = Object.values(category).map(
                value => Number(value)
            );

            if (
                values.length === 0 ||
                values.some(
                    value =>
                        !Number.isFinite(value) ||
                        value < 1 ||
                        value > GRAPH_CONFIG.maxScore
                )
            ) {
                throw new Error(
                    "Invalid capability scores received from API."
                );
            }

            const total = values.reduce(
                (sum, value) => sum + value,
                0
            );

            return Number(
                (total / values.length).toFixed(2)
            );
        }


        /**
         * Convert one Python evaluation into
         * Chart.js-compatible category averages.
         */
        function normalizeEvaluation(evaluation) {

            if (!evaluation) {
                throw new Error(
                    "Evaluation data is missing."
                );
            }

            return {
                insight: average(evaluation.Insight),
                influence: average(evaluation.Influence),
                impact: average(evaluation.Impact)
            };
        }


        const scores = {
            initial: normalizeEvaluation(apiData.initial),
            delayed: normalizeEvaluation(apiData.delayed)
        };

        validateScores(scores);

        return scores;
    }


    function createCanvas() {

        const canvas = document.createElement("canvas");

        canvas.width = GRAPH_CONFIG.width;
        canvas.height = GRAPH_CONFIG.height;

        return canvas;
    }


    function getChartOptions(title) {

        return {
            responsive: false,
            animation: false,
            devicePixelRatio: 2,

            plugins: {
                title: {
                    display: true,
                    text: title,
                    color: GRAPH_CONFIG.colors.text,

                    font: {
                        size: 24,
                        weight: "bold"
                    },

                    padding: 20
                },

                legend: {
                    display: true,
                    position: "bottom",

                    labels: {
                        font: {
                            size: 16
                        }
                    }
                }
            },

            scales: {
                y: {
                    beginAtZero: true,
                    max: GRAPH_CONFIG.maxScore,

                    ticks: {
                        stepSize: 1,
                        font: {
                            size: 14
                        }
                    },

                    grid: {
                        color: GRAPH_CONFIG.colors.grid
                    }
                },

                x: {
                    ticks: {
                        font: {
                            size: 16
                        }
                    },

                    grid: {
                        display: false
                    }
                }
            }
        };
    }


    async function renderChart(chartConfig) {

        if (typeof Chart === "undefined") {
            throw new Error(
                "Chart.js is not loaded. Check index.html."
            );
        }

        const canvas = createCanvas();

        /**
         * Ensure PNG graphs have a white background
         * when inserted into PDF documents.
         */
        const whiteBackgroundPlugin = {
            id: "pdfWhiteBackground",

            beforeDraw(chart) {

                const ctx = chart.ctx;

                ctx.save();

                ctx.globalCompositeOperation =
                    "destination-over";

                ctx.fillStyle =
                    GRAPH_CONFIG.colors.white;

                ctx.fillRect(
                    0,
                    0,
                    chart.width,
                    chart.height
                );

                ctx.restore();
            }
        };

        let chart = null;

        try {

            chart = new Chart(canvas, {
                ...chartConfig,

                plugins: [
                    ...(chartConfig.plugins || []),
                    whiteBackgroundPlugin
                ]
            });

            chart.update("none");

            const image = chart.toBase64Image(
                "image/png",
                1.0
            );

            if (
                !image ||
                !image.startsWith("data:image/png;base64,")
            ) {
                throw new Error(
                    "Failed to export Chart.js graph."
                );
            }

            return image;

        } finally {

            if (chart) {
                chart.destroy();
            }
        }
    }


    async function generateInitialGraph(scores) {

        validateScores(scores);

        return renderChart({
            type: "bar",

            data: {
                labels: GRAPH_CONFIG.categories,

                datasets: [{
                    label: "Initial Evaluation",

                    data: [
                        scores.initial.insight,
                        scores.initial.influence,
                        scores.initial.impact
                    ],

                    backgroundColor:
                        GRAPH_CONFIG.colors.initial,

                    borderRadius: 6
                }]
            },

            options: getChartOptions(
                "Initial Leadership Evaluation"
            )
        });
    }


    async function generateDelayedGraph(scores) {

        validateScores(scores);

        return renderChart({
            type: "bar",

            data: {
                labels: GRAPH_CONFIG.categories,

                datasets: [{
                    label: "Delayed Evaluation",

                    data: [
                        scores.delayed.insight,
                        scores.delayed.influence,
                        scores.delayed.impact
                    ],

                    backgroundColor:
                        GRAPH_CONFIG.colors.delayed,

                    borderRadius: 6
                }]
            },

            options: getChartOptions(
                "Delayed Leadership Evaluation"
            )
        });
    }


    async function generateComparisonGraph(scores) {

        validateScores(scores);

        return renderChart({
            type: "bar",

            data: {
                labels: GRAPH_CONFIG.categories,

                datasets: [
                    {
                        label: "Initial Evaluation",

                        data: [
                            scores.initial.insight,
                            scores.initial.influence,
                            scores.initial.impact
                        ],

                        backgroundColor:
                            GRAPH_CONFIG.colors.initial,

                        borderRadius: 6
                    },

                    {
                        label: "Delayed Evaluation",

                        data: [
                            scores.delayed.insight,
                            scores.delayed.influence,
                            scores.delayed.impact
                        ],

                        backgroundColor:
                            GRAPH_CONFIG.colors.delayed,

                        borderRadius: 6
                    }
                ]
            },

            options: getChartOptions(
                "Leadership Development Comparison"
            )
        });
    }


    async function generateRadarGraph(scores) {

        validateScores(scores);

        return renderChart({
            type: "radar",

            data: {
                labels: GRAPH_CONFIG.categories,

                datasets: [
                    {
                        label: "Initial Evaluation",

                        data: [
                            scores.initial.insight,
                            scores.initial.influence,
                            scores.initial.impact
                        ],

                        borderColor:
                            GRAPH_CONFIG.colors.initial,

                        backgroundColor:
                            "rgba(57, 73, 171, 0.2)",

                        pointBackgroundColor:
                            GRAPH_CONFIG.colors.initial,

                        fill: true
                    },

                    {
                        label: "Delayed Evaluation",

                        data: [
                            scores.delayed.insight,
                            scores.delayed.influence,
                            scores.delayed.impact
                        ],

                        borderColor:
                            GRAPH_CONFIG.colors.delayed,

                        backgroundColor:
                            "rgba(38, 166, 154, 0.2)",

                        pointBackgroundColor:
                            GRAPH_CONFIG.colors.delayed,

                        fill: true
                    }
                ]
            },

            options: {
                responsive: false,
                animation: false,
                devicePixelRatio: 2,

                plugins: {
                    title: {
                        display: true,
                        text: "Leadership Capability Profile",

                        font: {
                            size: 24,
                            weight: "bold"
                        }
                    },

                    legend: {
                        display: true,
                        position: "bottom"
                    }
                },

                scales: {
                    r: {
                        min: 0,
                        max: GRAPH_CONFIG.maxScore,

                        ticks: {
                            stepSize: 1,
                            backdropColor: "transparent"
                        }
                    }
                }
            }
        });
    }


    async function generateAllGraphs(scores) {

        validateScores(scores);

        const [
            initial,
            delayed,
            comparison,
            radar
        ] = await Promise.all([
            generateInitialGraph(scores),
            generateDelayedGraph(scores),
            generateComparisonGraph(scores),
            generateRadarGraph(scores)
        ]);

        return {
            initial,
            delayed,
            comparison,
            radar
        };
    }


    async function generateParticipantGraphs(participantId) {

        if (!window.ParticipantAPI) {
            throw new Error(
                "ParticipantAPI is unavailable. Load api.js first."
            );
        }

        /**
         * Fetch participant details and evaluation
         * data from the Python mock backend.
         */
        const reportData =
            await ParticipantAPI.getParticipantReportData(
                participantId
            );

        /**
         * Convert Python capability scores
         * into category averages.
         */
        const scores = normalizeScores(
            reportData.scores
        );

        /**
         * Generate four Chart.js graphs as PNGs.
         */
        const graphs = await generateAllGraphs(scores);

        return {
            participant: reportData.participant,
            scores,
            graphs
        };
    }


    return {
        normalizeScores,
        validateScores,
        generateInitialGraph,
        generateDelayedGraph,
        generateComparisonGraph,
        generateRadarGraph,
        generateAllGraphs,
        generateParticipantGraphs
    };

})();


window.DynamicGraphs = DynamicGraphs;

console.log("DynamicGraphs loaded successfully.");
