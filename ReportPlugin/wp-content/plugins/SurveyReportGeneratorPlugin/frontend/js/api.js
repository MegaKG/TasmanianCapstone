
/*
 * Participant Data Service
 * Temporary fixture until the Gravity Forms
 * backend endpoint is available.
 */

const ParticipantAPI = (() => {


    // Retrieve participant records.
    async function getParticipants() {
        const endpoint = "/5-2?query=participants"

        const response = await fetch(endpoint);

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }
        //first and last name are stored in the first and last name fields of the form, respectively. The participant ID is stored in the "participant_id" field of the form.
        return await response.json();
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