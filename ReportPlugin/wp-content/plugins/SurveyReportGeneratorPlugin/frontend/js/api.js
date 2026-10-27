/*
 * Participant Data Service
 * Temporary fixture until the Gravity Forms
 * backend endpoint is available.
 */

const ParticipantAPI = (() => {

    // Retrieve participant records.
    // async function getParticipants() {
    //     const endpoint = "/5-2/?query=participants";

    //     const response = await fetch(endpoint);

    //     if (!response.ok) {
    //         throw new Error(`HTTP ${response.status}`);
    //     }

    //     return await response.json();
    // }

    async function getParticipants() {
        return [
            { id: "1", name: "Test Participant 1" },
            { id: "2", name: "Test Participant 2" },
            { id: "3", name: "Test Participant 3" }
        ];
    }

    // Expose functions to script.js.
    return {
        getParticipants
    };

})();


/*
 * Benchmark Data Service
 * Temporary mock benchmarks.
 */

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

    return {
        getBenchmarks
    };

})();


// Make APIs accessible to other frontend scripts.
window.ParticipantAPI = ParticipantAPI;
window.BenchmarkAPI = BenchmarkAPI;