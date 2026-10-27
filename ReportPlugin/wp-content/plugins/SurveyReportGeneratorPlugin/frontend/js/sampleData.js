
/*
 * Sample ELF Evaluation Data
 * All scores use a 0–100 scale.
 * Values are illustrative, not actual participant results.
 */

const sampleData = {
    participantId: "101",
    participantName: "Sample Participant",

    insight: {
        labels: [
            "Clarity of Purpose",
            "Self-Compassion",
            "Balanced Processing",
            "Situational Awareness",
            "Social Awareness",
            "Self-Awareness",
            "Strategic Foresight"
        ],

        initial: [62, 68, 55, 64, 72, 68, 51],
        delayed: [78, 81, 70, 76, 85, 79, 67]
    },

    influence: {
        labels: [
            "Capacity for Collaboration",
            "Capacity for Informal Influence",
            "Tolerance for Complexity",
            "Tolerance for Ambiguity",
            "Capacity to Establish Networks",
            "Capacity for Creativity"
        ],

        initial: [65, 61, 58, 52, 60, 57],
        delayed: [75, 70, 78, 71, 85, 69]
    },

    impact: {
        labels: [
            "Belonging",
            "Place Attachment",
            "Extra-Role Behaviour",
            "Intrinsic Motivation"
        ],

        values: [72, 68, 81, 74]
    },

    scoringContext: {
        labels: [
            "Initial Evaluation",
            "Delayed Evaluation",
            "Cohort Average",
            "Tasmanian Benchmark"
        ],

        values: [61, 76, 70, 74]
    }
};

module.exports = sampleData;
