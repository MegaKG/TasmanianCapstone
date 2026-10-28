const excelFile = document.getElementById("excel-file");

const participantMenu = document.getElementById("participant-menu");

const participantText = document.getElementById("participant-selected");

const participantSummary = document.getElementById("participant-summary");

const participantDropdown = document.querySelector(".participant-dropdown");


const previewName =
    document.getElementById("profile-participant-name");

const footerName =
    document.getElementById("profile-footer-name");

const previewEvaluation =
    document.getElementById("profile-evaluation-points");

const previewBenchmarks =
    document.getElementById("profile-benchmarks");

const previewReportType =
    document.getElementById("profile-report-type");

const benchmarkPreviewElements =
    document.querySelectorAll(".benchmark-dynamic");


const evaluationBoxes =
    document.querySelectorAll(".evaluation-checkbox");

const evaluationText =
    document.getElementById("evaluation-selected");

const evaluationDisclaimer =
    document.getElementById("evaluation-disclaimer");


const benchmarkBoxes =
    document.querySelectorAll(".benchmark-checkbox");

let availableBenchmarks = [];

async function loadBenchmarks() {
    try {
        availableBenchmarks = await BenchmarkAPI.getBenchmarks();

        if (!Array.isArray(availableBenchmarks)) {
            throw new Error("Invalid benchmark data");
        }

        benchmarkBoxes.forEach(function (checkbox) {
            if (checkbox.value === "None") {
                return;
            }

            const benchmark = availableBenchmarks.find(
                item => item.value === checkbox.value
            );

            const label = checkbox.closest("label");

            if (!benchmark) {
                checkbox.disabled = true;
                return;
            }

            checkbox.disabled = false;

            if (label) {
                const text = label.querySelector("span");

                if (text) {
                    text.textContent = benchmark.name;
                }
            }
        });

        updateBenchmarks();

    } catch (error) {
        console.error("Unable to load benchmarks:", error);
        showMessage("Unable to load benchmark options.", "error");
    }
}


const benchmarkText =
    document.getElementById("benchmark-selected");


const generateButton =
    document.getElementById("generate-report-button");

const reportMessage =
    document.getElementById("report-message");

const reportPage =
    document.getElementById("report-page");


const reportModeInputs =
    document.querySelectorAll('input[name="report-mode"]');

const individualParticipantSection =
    document.getElementById("individual-participant-section");

const batchParticipantSection =
    document.getElementById("batch-participant-section");

const batchParticipantMenu =
    document.getElementById("batch-participant-menu");

const batchParticipantText =
    document.getElementById("batch-participant-selected");

const batchParticipantHelp =
    document.getElementById("batch-participant-help");


const roundedCornersToggle =
    document.getElementById("rounded-corners-toggle");


let selectedParticipant = "";

let displayName = "";

let editingName = false;

let reportMode = "individual";

let selectedParticipants = [];

// Participant records returned by the data service.
let availableParticipants = [];
let selectedParticipantId = null;

// Load temporary participant data on page startup.
// Keep the existing Excel upload handler available as a fallback.
async function loadParticipants() {
    try {
        participantText.textContent = "Loading participants...";
        const participants = await ParticipantAPI.getParticipants();
        if (!Array.isArray(participants)) {
            throw new Error("Invalid participant data");
        }
        const ids = new Set();
        for (const participant of participants) {
            if (!participant || participant.id == null ||
                !String(participant.name || "").trim() ||
                ids.has(String(participant.id))) {
                throw new Error("Invalid or duplicate participant record");
            }
            ids.add(String(participant.id));
        }
        availableParticipants = participants.map(participant => ({
            id: String(participant.id),
            name: String(participant.name).trim()
        }));
        resetParticipantSelection();
        selectedParticipantId = null;
        selectedParticipants = [];

        // Dropdowns now use IDs internally and names for display.
        showParticipants(availableParticipants);
        showBatchParticipants(availableParticipants);
        updateBatchParticipantDisplay();

        if (participants.length === 0) {
            participantText.textContent = "No participants available";
        }
        clearMessage();
    } catch (error) {
        console.error("Unable to load participants:", error);
        availableParticipants = [];
        resetParticipantSelection();
        selectedParticipantId = null;
        selectedParticipants = [];
        showParticipants([]);
        showBatchParticipants([]);
        updateBatchParticipantDisplay();
        showMessage("Unable to load participant records.", "error");
    }
}



// Read the uploaded spreadsheet and populate participant lists.

excelFile.addEventListener("change", function () {

    const file = excelFile.files[0];

    if (!file) {
        return;
    }

    const fileExtension =
        file.name
            .split(".")
            .pop()
            .toLowerCase();

    if (!["xlsx", "xls"].includes(fileExtension)) {

        showMessage(
            "Please upload an Excel participant file.",
            "error"
        );

        return;
    }

    const reader = new FileReader();

    // Parse spreadsheet rows and refresh both participant lists.

    reader.onload = function (event) {

        try {

            const data =
                new Uint8Array(event.target.result);

            const workbook =
                XLSX.read(
                    data,
                    {
                        type: "array"
                    }
                );

            const firstSheet =
                workbook.Sheets[
                workbook.SheetNames[0]
                ];

            const rows =
                XLSX.utils.sheet_to_json(
                    firstSheet
                );

            const participantNames =
                new Set();

            // Collect non-empty participant names.

            rows.forEach(function (row) {

                const name =
                    String(
                        row["Participant Name"] || ""
                    ).trim();

                if (name) {
                    participantNames.add(name);
                }

            });

            const names =
                [...participantNames];

            if (names.length === 0) {

                showMessage(
                    "No participants were found in the uploaded file.",
                    "error"
                );

                return;
            }

            // Legacy Excel fallback: assign temporary IDs to names.
            // These IDs are local only, not Gravity Forms entry IDs.
            availableParticipants = names.map((name, index) => ({
                id: `excel-${index + 1}`,
                name
            }));
            resetParticipantSelection();
            selectedParticipants = [];
            showParticipants(availableParticipants);
            showBatchParticipants(availableParticipants);

            updateBatchParticipantDisplay();

            clearMessage();

        } catch (error) {

            console.error(
                "Error reading Excel file:",
                error
            );

            showMessage(
                "Unable to read participant data.",
                "error"
            );
        }

    };

    reader.readAsArrayBuffer(file);

});


// Clear the current individual participant selection.

function resetParticipantSelection() {

    selectedParticipant = "";
    selectedParticipantId = null;

    displayName = "";

    participantText.textContent =
        "Participant: none";

    previewName.textContent =
        "NAME";

    footerName.textContent =
        "PARTICIPANT_NAME";

}


// Populate the individual participant dropdown.

function showParticipants(participants) {

    participantMenu.innerHTML =
        '<div class="dropdown-heading">Select Participant</div>';

    // Create a selectable option for each participant.

    participants.forEach(function (participant) {
        const name = participant.name;

        const option =
            document.createElement("div");

        option.className =
            "participant-option";

        option.textContent =
            name;

        option.addEventListener(
            "click",
            function () {

                selectedParticipant = name;
                selectedParticipantId = String(participant.id);

                displayName =
                    name;

                participantText.textContent =
                    `Participant: ${name}`;

                updateName(name);

                participantDropdown.removeAttribute(
                    "open"
                );

                clearMessage();
            }
        );

        participantMenu.appendChild(
            option
        );

    });

}


// Update the participant name in the preview and footer.

function updateName(name) {

    previewName.textContent =
        name;

    footerName.textContent =
        name.toUpperCase();

}


participantText.addEventListener(
    "dblclick",
    function (event) {

        if (
            !selectedParticipant ||
            editingName
        ) {
            return;
        }

        event.preventDefault();

        event.stopPropagation();

        editingName = true;

        participantDropdown.removeAttribute(
            "open"
        );

        participantText.style.display =
            "none";

        const input =
            document.createElement("input");

        input.type =
            "text";

        input.className =
            "participant-inline-editor";

        input.value =
            displayName;

        input.addEventListener(
            "click",
            function (event) {

                event.preventDefault();

                event.stopPropagation();
            }
        );

        input.addEventListener(
            "input",
            function () {

                const editedName =
                    input.value.trim();

                if (editedName) {

                    updateName(
                        editedName
                    );

                }

            }
        );

        input.addEventListener(
            "keydown",
            function (event) {

                if (
                    event.key === "Enter"
                ) {

                    event.preventDefault();

                    finishNameEdit(
                        input,
                        true
                    );
                }

                if (
                    event.key === "Escape"
                ) {

                    event.preventDefault();

                    finishNameEdit(
                        input,
                        false
                    );
                }

            }
        );

        input.addEventListener(
            "blur",
            function () {

                finishNameEdit(
                    input,
                    true
                );

            }
        );

        participantSummary.insertBefore(
            input,
            participantSummary.querySelector(
                ".search-icon"
            )
        );

        input.focus();

        input.select();
    }
);


// Save or discard the inline participant name edit.

function finishNameEdit(
    input,
    save
) {

    if (!editingName) {
        return;
    }

    editingName =
        false;

    const editedName =
        input.value.trim();

    if (
        save &&
        editedName
    ) {

        displayName =
            editedName;
    }

    participantText.textContent =
        `Participant: ${displayName}`;

    participantText.style.display =
        "";

    updateName(
        displayName
    );

    input.remove();

}


participantSummary.addEventListener(
    "click",
    function (event) {

        if (editingName) {

            event.preventDefault();

        }

    }
);


reportModeInputs.forEach(
    function (input) {

        input.addEventListener(
            "change",
            function () {

                if (!input.checked) {
                    return;
                }

                reportMode =
                    input.value;

                updateReportMode();

                clearMessage();
            }
        );

    }
);


// Show controls for the currently selected report mode.

function updateReportMode() {

    if (
        reportMode === "batch"
    ) {

        if (individualParticipantSection) {

            individualParticipantSection.hidden =
                true;
        }

        if (batchParticipantSection) {

            batchParticipantSection.hidden =
                false;
        }

        if (previewReportType) {

            previewReportType.textContent =
                "Batch Report";
        }

        updateBatchParticipantDisplay();

        return;
    }

    if (individualParticipantSection) {

        individualParticipantSection.hidden =
            false;
    }

    if (batchParticipantSection) {

        batchParticipantSection.hidden =
            true;
    }

    if (previewReportType) {

        previewReportType.textContent =
            "Individual Participant Report";
    }

    generateButton.textContent =
        "Generate Report";

}


// Populate the batch participant dropdown.

function showBatchParticipants(participants) {

    if (!batchParticipantMenu) {
        return;
    }

    batchParticipantMenu.innerHTML =
        '<div class="dropdown-heading">Select Participants</div>';

    const selectAllLabel =
        document.createElement("label");

    selectAllLabel.className =
        "checkbox-option";

    const selectAllCheckbox =
        document.createElement("input");

    selectAllCheckbox.type =
        "checkbox";

    selectAllCheckbox.id =
        "batch-select-all";

    const selectAllText =
        document.createElement("span");

    selectAllText.textContent =
        "Select All";

    selectAllLabel.appendChild(
        selectAllCheckbox
    );

    selectAllLabel.appendChild(
        selectAllText
    );

    batchParticipantMenu.appendChild(
        selectAllLabel
    );

    // Add one selectable checkbox for each participant.

    participants.forEach(function (participant) {
        const name = participant.name;

        const label =
            document.createElement("label");

        label.className =
            "checkbox-option";

        const checkbox =
            document.createElement("input");

        checkbox.type =
            "checkbox";

        checkbox.className =
            "batch-participant-checkbox";

        checkbox.value = String(participant.id);

        const text =
            document.createElement("span");

        text.textContent =
            name;

        checkbox.addEventListener(
            "change",
            function () {

                updateBatchSelections();

            }
        );

        label.appendChild(
            checkbox
        );

        label.appendChild(
            text
        );

        batchParticipantMenu.appendChild(
            label
        );

    });


    selectAllCheckbox.addEventListener(
        "change",
        function () {

            const participantBoxes =
                document.querySelectorAll(
                    ".batch-participant-checkbox"
                );

            participantBoxes.forEach(
                function (checkbox) {

                    checkbox.checked =
                        selectAllCheckbox.checked;

                }
            );

            updateBatchSelections();

        }
    );

}


// Sync selected participants and the select-all checkbox state.

function updateBatchSelections() {

    const participantBoxes =
        document.querySelectorAll(
            ".batch-participant-checkbox"
        );

    selectedParticipants =
        [...participantBoxes]
            .filter(
                function (checkbox) {

                    return checkbox.checked;

                }
            )
            .map(
                function (checkbox) {

                    return checkbox.value;

                }
            );

    const selectAllCheckbox =
        document.getElementById(
            "batch-select-all"
        );

    if (selectAllCheckbox) {

        selectAllCheckbox.checked =
            participantBoxes.length > 0 &&
            selectedParticipants.length ===
            participantBoxes.length;

    }

    updateBatchParticipantDisplay();

}


// Refresh the batch selection summary and generate button label.

function updateBatchParticipantDisplay() {

    if (
        !batchParticipantText ||
        !batchParticipantHelp
    ) {
        return;
    }

    const count =
        selectedParticipants.length;

    if (
        count === 0
    ) {

        batchParticipantText.textContent =
            "Participants: none";

        batchParticipantHelp.textContent =
            "Select one or more participants for batch report generation.";

        if (
            reportMode === "batch"
        ) {

            generateButton.textContent =
                "Generate Batch Reports";

        }

        return;
    }

    batchParticipantText.textContent =
        `${count} participant${count === 1 ? "" : "s"} selected`;

    batchParticipantHelp.textContent =
        `${count} participant${count === 1 ? "" : "s"} will receive an individual report.`;

    if (
        reportMode === "batch"
    ) {

        generateButton.textContent =
            `Generate ${count} Report${count === 1 ? "" : "s"}`;

    }

}


evaluationBoxes.forEach(
    function (checkbox) {

        checkbox.addEventListener(
            "change",
            function () {

                const selectedEvaluations =
                    getEvaluations();

                if (
                    selectedEvaluations.length > 2
                ) {

                    checkbox.checked =
                        false;

                    showMessage(
                        "A maximum of two evaluation points can be selected.",
                        "error"
                    );

                    updateEvaluation();

                    return;
                }

                clearMessage();

                updateEvaluation();
            }
        );

    }
);


// Return the selected evaluation point values.

function getEvaluations() {

    return [...evaluationBoxes]
        .filter(
            function (checkbox) {

                return checkbox.checked;

            }
        )
        .map(
            function (checkbox) {

                return checkbox.value;

            }
        );

}


// Update evaluation labels and preview.

function updateEvaluation() {

    const selectedEvaluations =
        getEvaluations();

    if (
        selectedEvaluations.length === 0
    ) {

        evaluationText.textContent =
            "Evaluation Points: none";

        previewEvaluation.textContent =
            "EVALUATION_POINTS";

        if (evaluationDisclaimer) {

            evaluationDisclaimer.textContent =
                "No evaluation point selected. " +
                "Select one evaluation point for a " +
                "single-point report or two evaluation " +
                "points for a comparative report.";

        }

        return;
    }

    const evaluationNames =
        selectedEvaluations.join(" + ");

    evaluationText.textContent =
        `Evaluation Points: ${evaluationNames}`;

    previewEvaluation.textContent =
        evaluationNames;

    if (
        selectedEvaluations.length === 1
    ) {

        if (evaluationDisclaimer) {

            evaluationDisclaimer.textContent =
                "Single evaluation point selected. " +
                "The generated report will be a " +
                "single-point report and will not " +
                "include evaluation-point comparisons.";

        }

        return;
    }

    if (
        selectedEvaluations.length === 2
    ) {

        if (evaluationDisclaimer) {

            evaluationDisclaimer.textContent =
                "";

        }

    }

}


// Register a change event for each benchmark checkbox.

benchmarkBoxes.forEach(
    function (checkbox) {

        checkbox.addEventListener(
            "change",
            function () {

                /*
                 * "None" is mutually exclusive with actual
                 * benchmark selections.
                 */

                if (
                    checkbox.value === "None" &&
                    checkbox.checked
                ) {

                    benchmarkBoxes.forEach(
                        function (otherCheckbox) {

                            if (
                                otherCheckbox.value !== "None"
                            ) {

                                otherCheckbox.checked =
                                    false;

                            }

                        }
                    );

                } else if (
                    checkbox.value !== "None" &&
                    checkbox.checked
                ) {

                    const noneCheckbox =
                        [...benchmarkBoxes].find(
                            function (box) {

                                return box.value === "None";

                            }
                        );

                    if (noneCheckbox) {

                        noneCheckbox.checked =
                            false;

                    }

                }


                /*
                 * Only real benchmarks count toward the
                 * maximum of two.
                 */

                const selectedBenchmarks =
                    getBenchmarks();

                if (
                    selectedBenchmarks.length > 2
                ) {

                    checkbox.checked =
                        false;

                    showMessage(
                        "A maximum of two comparison benchmarks can be selected.",
                        "error"
                    );

                    updateBenchmarks();

                    return;
                }


                /*
                 * If the user deselects every benchmark,
                 * restore None as the default selection.
                 */

                const anyBenchmarkChecked =
                    [...benchmarkBoxes].some(
                        function (box) {

                            return box.checked;

                        }
                    );

                if (!anyBenchmarkChecked) {

                    const noneCheckbox =
                        [...benchmarkBoxes].find(
                            function (box) {

                                return box.value === "None";

                            }
                        );

                    if (noneCheckbox) {

                        noneCheckbox.checked =
                            true;

                    }

                }

                clearMessage();

                updateBenchmarks();

            }
        );

    }
);


// Return selected benchmark values, excluding "None".

function getBenchmarks() {

    return [...benchmarkBoxes]
        .filter(
            function (checkbox) {

                return (
                    checkbox.checked &&
                    checkbox.value !== "None"
                );

            }
        )
        .map(
            function (checkbox) {

                return checkbox.value;

            }
        );

}


// Convert internal benchmark values into cleaner report labels.

function getBenchmarkDisplayName(value) {

    const benchmarkNames = {

        "All Participants":
            "All participants",

        "Specific Program":
            "Specific program",

        "Program Across All Years":
            "Program across all years"

    };

    return benchmarkNames[value] || value;

}


// Update dropdown text and all benchmark text in the preview.

function updateBenchmarks() {

    const selectedBenchmarks =
        getBenchmarks();

    let benchmarkDisplay =
        "No benchmark selected";


    if (
        selectedBenchmarks.length > 0
    ) {

        benchmarkDisplay =
            selectedBenchmarks
                .map(
                    function (benchmark) {

                        return getBenchmarkDisplayName(
                            benchmark
                        );

                    }
                )
                .join(" + ");

    }


    /*
     * Update the Compare Against dropdown.
     */

    if (benchmarkText) {

        if (
            selectedBenchmarks.length === 0
        ) {

            benchmarkText.textContent =
                "Benchmarks: None";

        } else {

            benchmarkText.textContent =
                `Benchmarks: ${benchmarkDisplay}`;

        }

    }


    /*
     * Update benchmark metadata beneath the
     * participant information.
     */

    if (previewBenchmarks) {

        previewBenchmarks.textContent =
            benchmarkDisplay;

    }


    /*
     * Update the benchmark section in each of the
     * Insight, Influence and Impact cards.
     */

    benchmarkPreviewElements.forEach(
        function (element) {

            element.textContent =
                benchmarkDisplay;

        }
    );

}


/**
 * Add dynamically generated Chart.js graphs to the PDF.
 * Keeps the existing HTML report as the first page.
 */
async function appendDynamicGraphsToPDF(pdf, participantId, evaluations) {

    if (!window.DynamicGraphs) {
        throw new Error(
            "DynamicGraphs is not loaded. Check index.html."
        );
    }

    if (!window.ParticipantAPI) {
        throw new Error(
            "ParticipantAPI is not loaded. Check index.html."
        );
    }

    if (String(participantId).startsWith("excel-")) {
        throw new Error(
            "Excel-only participants do not have backend evaluation scores. " +
            "Select a participant from the Python backend."
        );
    }

    // Fetch participant scores and generate four graphs.
    const result =
        await DynamicGraphs.generateParticipantGraphs(
            participantId
        );

    const graphs = result.graphs;

    let selectedGraphs = [];

    // One evaluation point: only include the relevant graph.
    if (evaluations.length === 1) {

        const label =
            String(evaluations[0]).toLowerCase();

        const isDelayed =
            /delayed|second|post|follow[ -]?up|\b2\b/.test(label);

        if (isDelayed) {
            selectedGraphs = [{
                title: "Delayed Leadership Evaluation",
                image: graphs.delayed
            }];
        } else {
            selectedGraphs = [{
                title: "Initial Leadership Evaluation",
                image: graphs.initial
            }];
        }

    } else {

        // Two evaluation points: include all four graphs.
        selectedGraphs = [
            {
                title: "Initial Leadership Evaluation",
                image: graphs.initial
            },
            {
                title: "Delayed Leadership Evaluation",
                image: graphs.delayed
            },
            {
                title: "Leadership Development Comparison",
                image: graphs.comparison
            },
            {
                title: "Leadership Capability Profile",
                image: graphs.radar
            }
        ];
    }

    // Insert every graph on its own PDF page.
    for (const graph of selectedGraphs) {

        const pageWidth =
            pdf.internal.pageSize.getWidth();

        const pageHeight =
            pdf.internal.pageSize.getHeight();

        const margin = 15;
        const imageTop = 35;
        const bottomMargin = 25;

        const properties =
            pdf.getImageProperties(graph.image);

        const scale = Math.min(
            (pageWidth - 2 * margin) / properties.width,
            (pageHeight - imageTop - bottomMargin) /
            properties.height
        );

        const imageWidth =
            properties.width * scale;

        const imageHeight =
            properties.height * scale;

        const imageX =
            (pageWidth - imageWidth) / 2;

        pdf.addPage();

        pdf.setTextColor(0, 0, 0);
        pdf.setFontSize(16);

        pdf.text(
            graph.title,
            margin,
            20
        );

        pdf.addImage(
            graph.image,
            "PNG",
            imageX,
            imageTop,
            imageWidth,
            imageHeight
        );

        pdf.setFontSize(9);
        pdf.setTextColor(180, 50, 50);

        pdf.text(
            "DEMONSTRATION DATA - Not actual participant results",
            margin,
            pageHeight - 12
        );

        pdf.setTextColor(0, 0, 0);
    }

    return result;
}



generateButton.addEventListener(
    "click",
    async function () {

        const evaluations =
            getEvaluations();

        if (
            reportMode === "individual" &&
            !selectedParticipant
        ) {

            showMessage(
                "Please select a participant before generating the report.",
                "error"
            );

            return;
        }

        if (
            reportMode === "batch" &&
            selectedParticipants.length === 0
        ) {

            showMessage(
                "Please select at least one participant before generating batch reports.",
                "error"
            );

            return;
        }

        if (
            evaluations.length === 0
        ) {

            showMessage(
                "Please select at least one evaluation point before generating the report.",
                "error"
            );

            return;
        }

        if (
            evaluations.length > 2
        ) {

            showMessage(
                "Please select a maximum of two evaluation points.",
                "error"
            );

            return;
        }


        if (
            reportMode === "batch"
        ) {

            const originalPreviewName =
                previewName.textContent;

            const originalFooterName =
                footerName.textContent;

            try {

                generateButton.disabled =
                    true;

                generateButton.textContent =
                    "Generating Reports...";

                showMessage(
                    `Generating ${selectedParticipants.length} individual participant reports...`,
                    "success"
                );

                for (
                    let i = 0;
                    i < selectedParticipants.length;
                    i++
                ) {

                    const participantId = selectedParticipants[i];
                    const participantRecord = availableParticipants.find(
                        record => String(record.id) === participantId
                    );
                    if (!participantRecord) {
                        throw new Error(`Participant not found: ${participantId}`);
                    }
                    const participant = participantRecord.name;

                    previewName.textContent =
                        participant;

                    footerName.textContent =
                        participant.toUpperCase();

                    showMessage(
                        `Generating report ${i + 1} of ${selectedParticipants.length}: ${participant}`,
                        "success"
                    );

                    await new Promise(
                        function (resolve) {

                            setTimeout(
                                resolve,
                                150
                            );

                        }
                    );

                    const canvas =
                        await html2canvas(
                            reportPage,
                            {
                                scale: 2,
                                backgroundColor:
                                    "#ffffff"
                            }
                        );

                    const image =
                        canvas.toDataURL(
                            "image/png"
                        );

                    const { jsPDF } =
                        window.jspdf;

                    const pdf =
                        new jsPDF(
                            {
                                orientation:
                                    "portrait",

                                unit:
                                    "mm",

                                format:
                                    "a4"
                            }
                        );

                    const pageWidth =
                        pdf.internal.pageSize
                            .getWidth();

                    const pageHeight =
                        pdf.internal.pageSize
                            .getHeight();

                    const canvasRatio =
                        canvas.width /
                        canvas.height;

                    const pageRatio =
                        pageWidth /
                        pageHeight;

                    let imageWidth;

                    let imageHeight;

                    if (
                        canvasRatio >
                        pageRatio
                    ) {

                        imageWidth =
                            pageWidth;

                        imageHeight =
                            pageWidth /
                            canvasRatio;

                    } else {

                        imageHeight =
                            pageHeight;

                        imageWidth =
                            pageHeight *
                            canvasRatio;

                    }

                    const imageX =
                        (
                            pageWidth -
                            imageWidth
                        ) / 2;

                    const imageY =
                        (
                            pageHeight -
                            imageHeight
                        ) / 2;

                    pdf.addImage(
                        image,
                        "PNG",
                        imageX,
                        imageY,
                        imageWidth,
                        imageHeight
                    );

                    const safeName =
                        participant
                            .replace(
                                /[^a-z0-9]+/gi,
                                "-"
                            )
                            .replace(
                                /^-|-$/g,
                                ""
                            )
                        ||
                        `participant-${i + 1}`;


                    await appendDynamicGraphsToPDF(
                        pdf,
                        participantId,
                        evaluations
                    );

                    pdf.save(
                        `${safeName}-Individual-Participant-Report-Prototype.pdf`
                    );

                    await new Promise(
                        function (resolve) {

                            setTimeout(
                                resolve,
                                300
                            );

                        }
                    );

                }

                showMessage(
                    `${selectedParticipants.length} individual participant reports generated successfully.`,
                    "success"
                );

            } catch (error) {

                console.error(
                    "Batch PDF generation error:",
                    error
                );

                showMessage(
                    "Unable to generate batch reports.",
                    "error"
                );

            } finally {

                previewName.textContent =
                    originalPreviewName;

                footerName.textContent =
                    originalFooterName;

                generateButton.disabled =
                    false;

                updateBatchParticipantDisplay();

            }

            return;
        }


        try {

            generateButton.disabled =
                true;

            generateButton.textContent =
                "Generating PDF...";

            if (
                evaluations.length === 1
            ) {

                showMessage(
                    "Generating single-point report. " +
                    "This report will not include " +
                    "evaluation-point comparisons.",
                    "success"
                );

            } else {

                showMessage(
                    "Generating comparative report...",
                    "success"
                );

            }

            const canvas =
                await html2canvas(
                    reportPage,
                    {
                        scale: 2,
                        backgroundColor:
                            "#ffffff"
                    }
                );

            const { jsPDF } =
                window.jspdf;

            const pdf =
                new jsPDF(
                    {
                        orientation:
                            "portrait",

                        unit:
                            "mm",

                        format:
                            "a4"
                    }
                );

            const pageWidth =
                pdf.internal.pageSize
                    .getWidth();

            const pageHeight =
                pdf.internal.pageSize
                    .getHeight();

            const image =
                canvas.toDataURL(
                    "image/png"
                );

            const canvasRatio =
                canvas.width /
                canvas.height;

            const pageRatio =
                pageWidth /
                pageHeight;

            let imageWidth;

            let imageHeight;

            if (
                canvasRatio >
                pageRatio
            ) {

                imageWidth =
                    pageWidth;

                imageHeight =
                    pageWidth /
                    canvasRatio;

            } else {

                imageHeight =
                    pageHeight;

                imageWidth =
                    pageHeight *
                    canvasRatio;

            }

            const imageX =
                (
                    pageWidth -
                    imageWidth
                ) / 2;

            const imageY =
                (
                    pageHeight -
                    imageHeight
                ) / 2;

            pdf.addImage(
                image,
                "PNG",
                imageX,
                imageY,
                imageWidth,
                imageHeight
            );

            const safeName =
                displayName
                    .replace(
                        /[^a-z0-9]+/gi,
                        "-"
                    )
                    .replace(
                        /^-|-$/g,
                        ""
                    )
                ||
                "participant";

            await appendDynamicGraphsToPDF(
                pdf,
                selectedParticipantId,
                evaluations
            );


            pdf.save(
                `${safeName}-Individual-Participant-Report-Prototype.pdf`
            );

            if (
                evaluations.length === 1
            ) {

                showMessage(
                    "Single-point report PDF generated successfully.",
                    "success"
                );

            } else {

                showMessage(
                    "Comparative report PDF generated successfully.",
                    "success"
                );

            }

        } catch (error) {

            console.error(
                "Error generating PDF:",
                error
            );

            showMessage(
                "Unable to generate the representative PDF.",
                "error"
            );

        } finally {

            generateButton.disabled =
                false;

            generateButton.textContent =
                "Generate Report";

        }

    }
);


// Display a status message with the requested visual state.

function showMessage(
    message,
    type
) {

    reportMessage.textContent =
        message;

    reportMessage.className =
        `report-message ${type}`;

}


// Clear the current report status message.

function clearMessage() {

    reportMessage.textContent =
        "";

    reportMessage.className =
        "report-message";

}


if (roundedCornersToggle) {

    roundedCornersToggle.addEventListener(
        "change",
        function () {

            document.body.classList.toggle(
                "square-ui",
                !roundedCornersToggle.checked
            );

        }
    );

}


if (roundedCornersToggle) {

    document.body.classList.toggle(
        "square-ui",
        !roundedCornersToggle.checked
    );

}


updateReportMode();

updateEvaluation();

updateBenchmarks();

loadParticipants();

loadBenchmarks();