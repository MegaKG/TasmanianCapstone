
/*
 * Participant Data Service
 * Temporary fixture until the Gravity Forms
 * backend endpoint is available.
 */

const ParticipantAPI = (() => {

    // Temporary participant records for testing.
    // These are NOT real Gravity Forms entries.
    const mockParticipants = [
        {
            id: "101",
            name: "Satyam"
        },
        {
            id: "102",
            name: "Kaelan"
        },
        {
            id: "103",
            name: "Minji"
        },
        {
            id: "104",
            name: "Rashad"
        }
    ];

    // Retrieve participant records.
    async function getParticipants() {

        // Return a copy to avoid accidental changes
        // to the original fixture.
        return mockParticipants.map(participant => ({
            ...participant
        }));

    }

    // Expose functions to script.js.
    return {
        getParticipants
    };

})();

const BenchmarkAPI = (() => {
    const mockBenchmarks = [
        {
            id: "all-participants",
            value: "All Participants",
            name: "All participants"
        },
        {
            id: "specific-program",
            value: "Specific Program",
            name: "Specific program"
        },
        {
            id: "program-across-years",
            value: "Program Across All Years",
            name: "Program across all years"
        }
    ];

    async function getBenchmarks() {
        return mockBenchmarks.map(benchmark => ({
            ...benchmark
        }));
    }

    return { getBenchmarks };
})();