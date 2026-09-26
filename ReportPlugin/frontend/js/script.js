const excelFile = document.getElementById("excel-file");
const participantMenu = document.getElementById("participant-menu");
const participantText = document.getElementById("participant-selected");
const participantSummary = document.getElementById("participant-summary");
const participantDropdown = document.querySelector(".participant-dropdown");

const previewName = document.getElementById("profile-participant-name");
const footerName = document.getElementById("profile-footer-name");

const previewEvaluation =
    document.getElementById("profile-evaluation-points");

const evaluationBoxes =
    document.querySelectorAll(".evaluation-checkbox");

const evaluationText =
    document.getElementById("evaluation-selected");

const evaluationDisclaimer =
    document.getElementById("evaluation-disclaimer");

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

            resetParticipantSelection();
            showParticipants(names);
            selectedParticipants = [];
            showBatchParticipants(names);
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
    displayName = "";
    participantText.textContent =
        "Participant: none";
    previewName.textContent =
        "Participant name";
    footerName.textContent =
        "PARTICIPANT NAME";

}

// Populate the individual participant dropdown.
function showParticipants(names) {

    participantMenu.innerHTML =
        '<div class="dropdown-heading">Select Participant</div>';
    // Create a selectable option for each participant.
    names.forEach(function (name) {
        const option =
            document.createElement("div");
        option.className =
            "participant-option";
        option.textContent =
            name;
        option.addEventListener(
            "click",
            // Select this participant for an individual report.
            function () {
                selectedParticipant =
                    name;
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
    // Allow the selected participant name to be edited inline.
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
            // Keep editor clicks from toggling the dropdown.
            function (event) {
                event.preventDefault();
                event.stopPropagation();
            }
        );
        input.addEventListener(
            "input",
            // Update the report preview as the name is edited.
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
            // Save on Enter or discard changes on Escape.
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
            // Save edits when the input loses focus.
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
    // Prevent opening the dropdown while the name is being edited.
    function (event) {
        if (editingName) {
            event.preventDefault();
        }

    }
);

reportModeInputs.forEach(
    // Register a change handler for each report mode option.
    function (input) {
        input.addEventListener(
            "change",
            // Apply the newly selected report mode.
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

    generateButton.textContent =
        "Generate Report";

}

// Populate the batch participant dropdown.
function showBatchParticipants(names) {

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
    names.forEach(function (name) {
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
        checkbox.value =
            name;
        const text =
            document.createElement("span");
        text.textContent =
            name;
        checkbox.addEventListener(
            "change",
            // Refresh batch selection after a checkbox changes.
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
        // Toggle every participant checkbox together.
        function () {
            const participantBoxes =
                document.querySelectorAll(
                    ".batch-participant-checkbox"
                );
            participantBoxes.forEach(
                // Match each participant checkbox to the select-all state.
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
                // Keep only checked participant boxes.
                function (checkbox) {
                    return checkbox.checked;
                }
            )
            .map(
                // Read each selected participant name.
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
    // Register a change handler for every evaluation point.
    function (checkbox) {
        checkbox.addEventListener(
            "change",
            // Enforce the selection limit and refresh report guidance.
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
            // Keep checked evaluation point boxes.
            function (checkbox) {
                return checkbox.checked;
            }
        )
        .map(
            // Extract the value for each selected evaluation point.
            function (checkbox) {
                return checkbox.value;
            }
        );

}

// Update evaluation labels and single-point or comparison guidance.
function updateEvaluation() {

    const selectedEvaluations =
        getEvaluations();
    if (
        selectedEvaluations.length === 0
    ) {
        evaluationText.textContent =
            "Evaluation Points: none";
        previewEvaluation.textContent =
            "Evaluation points (none)";
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
        selectedEvaluations.join(", ");
    evaluationText.textContent =
        `Evaluation Points: ${evaluationNames}`;
    previewEvaluation.textContent =
        `Evaluation points (${evaluationNames})`;
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

generateButton.addEventListener(
    "click",
    // Validate report selections and generate individual or batch PDFs.
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
                    const participant =
                        selectedParticipants[i];
                    previewName.textContent =
                        participant;
                    footerName.textContent =
                        participant.toUpperCase();
                    showMessage(
                        `Generating report ${i + 1} of ${selectedParticipants.length}: ${participant}`,
                        "success"
                    );
                    await new Promise(
                        // Let the updated participant preview render.
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
                        || `participant-${i + 1}`;
                    pdf.save(
                        `${safeName}-Individual-Participant-Report-Prototype.pdf`
                    );
                    await new Promise(
                        // Pause briefly between PDF downloads.
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
                || "participant";
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
        // Apply the selected corner style when the toggle changes.
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
