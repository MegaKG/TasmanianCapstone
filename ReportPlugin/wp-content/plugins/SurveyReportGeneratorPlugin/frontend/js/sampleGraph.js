
const { ChartJSNodeCanvas } = require('chartjs-node-canvas');
const fs = require('fs');
const path = require('path');
const sampleData = require('./sampleData');

// Output directory
const outputDirectory = path.join(__dirname, 'output');

// Chart colours
const COLORS = {
    blue: '#4388E8',
    darkBlue: '#176A8A',
    orange: '#F0783C',
    pink: '#FFB2B2',
    purple: '#B57B98',
    darkPurple: '#46374F',
    redOrange: '#FF4B23'
};

// Validate individual scores (0–100)
function validateScores(scores) {
    if (
        !Array.isArray(scores) ||
        scores.length === 0 ||
        scores.some(score =>
            !Number.isFinite(score) ||
            score < 0 ||
            score > 100
        )
    ) {
        throw new Error(
            'Scores must be numbers between 0 and 100.'
        );
    }
}

// Format numeric labels
function formatScore(value) {
    return Number(value.toFixed(1)).toString();
}

// Custom Chart.js plugin to display numeric labels
const numericLabelsPlugin = {
    id: 'numericLabels',

    afterDatasetsDraw(chart) {
        const { ctx, chartArea } = chart;

        ctx.save();

        ctx.font = 'bold 15px Arial';
        ctx.textBaseline = 'middle';

        chart.data.datasets.forEach((dataset, datasetIndex) => {
            const meta = chart.getDatasetMeta(datasetIndex);

            if (meta.hidden) return;

            meta.data.forEach((element, index) => {
                const value = dataset.data[index];

                if (!Number.isFinite(value)) return;

                const label = formatScore(value);

                // Horizontal and vertical bar charts
                if (chart.config.type === 'bar') {
                    const horizontal =
                        chart.options.indexAxis === 'y';

                    ctx.fillStyle = '#222222';

                    if (horizontal) {
                        const labelWidth = ctx.measureText(label).width;
                        const rightSpace =
                            chartArea.right - element.x;

                        if (rightSpace >= labelWidth + 10) {
                            ctx.textAlign = 'left';

                            ctx.fillText(
                                label,
                                element.x + 8,
                                element.y
                            );
                        } else {
                            // Keep labels visible for scores near 100
                            ctx.textAlign = 'right';

                            ctx.fillText(
                                label,
                                element.x - 8,
                                element.y
                            );
                        }
                    } else {
                        ctx.textAlign = 'center';

                        // Place label above the bar
                        const y = Math.max(
                            chartArea.top + 10,
                            element.y - 12
                        );

                        ctx.fillText(
                            label,
                            element.x,
                            y
                        );
                    }
                }

                // Doughnut chart
                if (chart.config.type === 'doughnut') {
                    const position = element.tooltipPosition();

                    ctx.textAlign = 'center';
                    ctx.fillStyle = '#FFFFFF';

                    ctx.fillText(
                        `${label}%`,
                        position.x,
                        position.y
                    );
                }
            });
        });

        ctx.restore();
    }
};

// Save a Chart.js graph as PNG
async function saveGraph(
    filename,
    configuration,
    width = 1000,
    height = 600
) {
    fs.mkdirSync(outputDirectory, {
        recursive: true
    });

    const renderer = new ChartJSNodeCanvas({
        width,
        height,
        backgroundColour: 'white',

        chartCallback: (ChartJS) => {
            ChartJS.register(numericLabelsPlugin);
        }
    });

    const image = await renderer.renderToBuffer(configuration);

    const outputPath = path.join(
        outputDirectory,
        filename
    );

    fs.writeFileSync(outputPath, image);

    console.log(`Generated: ${outputPath}`);
}

// Shared bar chart options
function barOptions(horizontal = false) {
    return {
        responsive: false,
        animation: false,
        indexAxis: horizontal ? 'y' : 'x',

        layout: {
            padding: {
                top: 20,
                right: horizontal ? 45 : 20
            }
        },

        plugins: {
            legend: {
                display: false
            }
        },

        scales: horizontal
            ? {
                x: {
                    min: 0,
                    max: 100,
                    ticks: {
                        stepSize: 20
                    },
                    title: {
                        display: true,
                        text: 'Score (0–100)'
                    }
                },

                y: {
                    grid: {
                        display: false
                    }
                }
            }
            : {
                x: {
                    grid: {
                        display: false
                    }
                },

                y: {
                    min: 0,
                    max: 100,
                    ticks: {
                        stepSize: 20
                    },
                    title: {
                        display: true,
                        text: 'Score (0–100)'
                    }
                }
            }
    };
}

// PAGE 3: Insight horizontal bar chart
// Evaluation point: initial OR delayed
async function generateInsight(evaluation = 'initial') {
    if (!['initial', 'delayed'].includes(evaluation)) {
        throw new Error(
            'Insight evaluation must be initial or delayed.'
        );
    }

    const { labels } = sampleData.insight;
    const scores = sampleData.insight[evaluation];

    validateScores(scores);

    const configuration = {
        type: 'bar',

        data: {
            labels,

            datasets: [{
                label: evaluation,
                data: scores,
                backgroundColor: COLORS.blue,
                borderRadius: 4
            }]
        },

        options: {
            ...barOptions(true),

            plugins: {
                legend: {
                    display: false
                },

                title: {
                    display: true,
                    text: `Insight - ${evaluation.toUpperCase()}`,
                    font: {
                        size: 22
                    }
                }
            }
        }
    };

    await saveGraph(
        `insight-${evaluation}.png`,
        configuration,
        1100,
        650
    );
}

// PAGE 4: Self-awareness vertical bar chart
async function generateSelfAwareness() {
    const index = sampleData.insight.labels.indexOf(
        'Self-Awareness'
    );

    if (index === -1) {
        throw new Error(
            'Self-Awareness capability not found.'
        );
    }

    const scores = [
        sampleData.insight.initial[index],
        sampleData.insight.delayed[index]
    ];

    validateScores(scores);

    const configuration = {
        type: 'bar',

        data: {
            labels: [
                'Initial',
                'Delayed'
            ],

            datasets: [{
                label: 'Self-Awareness',
                data: scores,
                backgroundColor: COLORS.blue,
                borderRadius: 5,
                maxBarThickness: 110
            }]
        },

        options: {
            ...barOptions(false),

            plugins: {
                legend: {
                    display: false
                },

                title: {
                    display: true,
                    text: 'Self-Awareness Comparison',
                    font: {
                        size: 22
                    }
                }
            }
        }
    };

    await saveGraph(
        'self-awareness.png',
        configuration
    );
}

// PAGE 5: Influence grouped horizontal bar chart
async function generateInfluence() {
    const {
        labels,
        initial,
        delayed
    } = sampleData.influence;

    validateScores(initial);
    validateScores(delayed);

    const configuration = {
        type: 'bar',

        data: {
            labels,

            datasets: [
                {
                    label: 'Initial',
                    data: initial,
                    backgroundColor: COLORS.darkBlue,
                    borderRadius: 3
                },

                {
                    label: 'Delayed',
                    data: delayed,
                    backgroundColor: COLORS.orange,
                    borderRadius: 3
                }
            ]
        },

        options: {
            ...barOptions(true),

            plugins: {
                legend: {
                    display: true,
                    position: 'bottom'
                },

                title: {
                    display: true,
                    text: 'Influence - Initial vs Delayed',
                    font: {
                        size: 22
                    }
                }
            }
        }
    };

    await saveGraph(
        'influence-comparison.png',
        configuration,
        1200,
        700
    );
}

// PAGE 7: Impact doughnut chart
async function generateImpact() {
    const {
        labels,
        values
    } = sampleData.impact;

    validateScores(values);

    // Doughnut segments represent relative shares,
    // not independent 0–100 capability scores.
    const total = values.reduce(
        (sum, value) => sum + value,
        0
    );

    if (total === 0) {
        throw new Error(
            'Impact values cannot all be zero.'
        );
    }

    const percentages = values.map(
        value => (value / total) * 100
    );

    const configuration = {
        type: 'doughnut',

        data: {
            labels,

            datasets: [{
                data: percentages,

                backgroundColor: [
                    COLORS.redOrange,
                    COLORS.darkPurple,
                    COLORS.purple,
                    COLORS.pink
                ],

                borderWidth: 0
            }]
        },

        options: {
            responsive: false,
            animation: false,
            cutout: '25%',

            plugins: {
                legend: {
                    display: true,
                    position: 'bottom'
                },

                title: {
                    display: true,
                    text: 'Impact Distribution',
                    font: {
                        size: 22
                    }
                }
            }
        }
    };

    await saveGraph(
        'impact-distribution.png',
        configuration,
        1000,
        650
    );
}

// PAGE 10: Scoring context vertical bar chart
async function generateScoringContext() {
    const {
        labels,
        values
    } = sampleData.scoringContext;

    validateScores(values);

    const configuration = {
        type: 'bar',

        data: {
            labels,

            datasets: [{
                label: 'Score',
                data: values,
                backgroundColor: COLORS.darkBlue,
                borderRadius: 4,
                maxBarThickness: 110
            }]
        },

        options: {
            ...barOptions(false),

            plugins: {
                legend: {
                    display: false
                },

                title: {
                    display: true,
                    text: 'Scoring Context Comparison',
                    font: {
                        size: 22
                    }
                }
            }
        }
    };

    await saveGraph(
        'scoring-context.png',
        configuration
    );
}

// Select which graph to generate
async function main() {
    const graphType = process.argv[2]?.toLowerCase();

    const evaluation =
        process.argv[3]?.toLowerCase() || 'initial';

    switch (graphType) {
        case 'insight':
            await generateInsight(evaluation);
            break;

        case 'self-awareness':
            await generateSelfAwareness();
            break;

        case 'influence':
            await generateInfluence();
            break;

        case 'impact':
            await generateImpact();
            break;

        case 'scoring-context':
            await generateScoringContext();
            break;

        default:
            console.log(`
Usage:
  node sampleGraph.js insight initial
  node sampleGraph.js insight delayed
  node sampleGraph.js self-awareness
  node sampleGraph.js influence
  node sampleGraph.js impact
  node sampleGraph.js scoring-context
            `);
    }
}

// Run only when executed directly
if (require.main === module) {
    main().catch(error => {
        console.error(
            'Graph generation failed:',
            error.message
        );

        process.exitCode = 1;
    });
}

// Export functions for future backend integration
module.exports = {
    generateInsight,
    generateSelfAwareness,
    generateInfluence,
    generateImpact,
    generateScoringContext
};
