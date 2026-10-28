
const API_CONFIG = {

    // "mock" = Python Flask backend
    // "wordpress" = real WordPress backend
    mode: "mock",

    // Python backend address.
    mockBaseUrl: "http://localhost:8881",

    // Confirmed Python API route.
    mockParticipantsPath: "/5-2?query=participants",

    // Existing WordPress participant route.
    wordpressParticipantsUrl: "/5-2/?query=participants",

    // Python evaluation data route.
    mockEvaluationPath: "/5-2"
};


const ParticipantAPI = (() => {

    /**
     * Fetch JSON from an endpoint.
     */
    async function fetchJSON(endpoint) {

        const response = await fetch(endpoint, {
            method: "GET",
            headers: {
                "Accept": "application/json"
            },
            cache: "no-store"
        });

        if (!response.ok) {
            throw new Error(
                `HTTP ${response.status}: ${endpoint}`
            );
        }

        return await response.json();
    }


    /**
     * Fetch all participants.
     *
     * Example:
     * [
     *   {
     *     id: 1,
     *     form_id: 100,
     *     first_name: "Jody",
     *     last_name: "Maurer",
     *     name: "Jody Maurer"
     *   }
     * ]
     */
    async function getParticipants() {

        const endpoint =
            API_CONFIG.mode === "mock"
                ? API_CONFIG.mockBaseUrl +
                API_CONFIG.mockParticipantsPath
                : API_CONFIG.wordpressParticipantsUrl;

        const data = await fetchJSON(endpoint);

        if (!Array.isArray(data)) {
            throw new Error(
                "Invalid participant data: expected an array."
            );
        }

        return data.map(participant => ({
            ...participant,

            name:
                participant.name ||
                [
                    participant.first_name,
                    participant.last_name
                ]
                    .filter(Boolean)
                    .join(" ")
        }));
    }


    /**
     * Fetch evaluation scores for one participant.
     *
     * Uses the actual mockBackend.py endpoint:
     *
     * GET /5-2?query=data
     *     &report=initial
     *     &first_name=Jody
     *     &last_name=Maurer
     *
     * Returns:
     * {
     *   initial: {
     *     Insight: {...},
     *     Influence: {...},
     *     Impact: {...}
     *   },
     *   delayed: {
     *     Insight: {...},
     *     Influence: {...},
     *     Impact: {...}
     *   }
     * }
     */
    async function getParticipantScores(participantId) {

        if (
            participantId === undefined ||
            participantId === null ||
            participantId === ""
        ) {
            throw new Error(
                "A participant ID is required."
            );
        }

        // Find the selected participant.
        const participants = await getParticipants();

        const participant = participants.find(
            p => String(p.id) === String(participantId)
        );

        if (!participant) {
            throw new Error(
                `Participant ${participantId} not found.`
            );
        }

        /**
         * Fetch one evaluation from Python.
         */
        async function fetchEvaluation(report) {

            const params = new URLSearchParams({
                query: "data",
                report: report,
                first_name: participant.first_name,
                last_name: participant.last_name
            });

            const endpoint =
                API_CONFIG.mode === "mock"
                    ? API_CONFIG.mockBaseUrl +
                    API_CONFIG.mockEvaluationPath +
                    "?" +
                    params.toString()
                    : "/5-2/?" + params.toString();

            return await fetchJSON(endpoint);
        }

        // Fetch initial and delayed evaluations.
        const [initial, delayed] = await Promise.all([
            fetchEvaluation("initial"),
            fetchEvaluation("delayed")
        ]);

        return {
            initial,
            delayed
        };
    }


    /**
     * Fetch participant details and evaluation scores
     * together for PDF report generation.
     */
    async function getParticipantReportData(participantId) {

        const participants = await getParticipants();

        const participant = participants.find(
            p => String(p.id) === String(participantId)
        );

        if (!participant) {
            throw new Error(
                `Participant ${participantId} not found.`
            );
        }

        const scores = await getParticipantScores(
            participantId
        );

        return {
            participant,
            scores
        };
    }


    return {
        getParticipants,
        getParticipantScores,
        getParticipantReportData
    };

})();


const BenchmarkAPI = (() => {

    /**
     * Temporary benchmark selection options.
     *
     * These are not calculated benchmark scores.
     */
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


// Make APIs available to other frontend scripts.
window.ParticipantAPI = ParticipantAPI;
window.BenchmarkAPI = BenchmarkAPI;

console.log(
    "ParticipantAPI and BenchmarkAPI loaded."
);
