const excelFile = document.getElementById("excel-file");
const participantMenu = document.getElementById("participant-menu");
const participantText = document.getElementById("participant-selected");
const participantSummary = document.getElementById("participant-summary");
const participantDropdown = document.querySelector(".participant-dropdown");

const previewName = document.getElementById("profile-participant-name");
const footerName = document.getElementById("profile-footer-name");

const previewEvaluation = document.getElementById(
    "profile-evaluation-points"
);
const evaluationBoxes = document.querySelectorAll(".evaluation-checkbox");
const selectAll = document.getElementById("evaluation-select-all");
const evaluationText = document.getElementById("evaluation-selected");

const generateButton = document.getElementById("generate-report-button");
const reportMessage = document.getElementById("report-message");
const reportPage = document.getElementById("report-page");

let selectedParticipant = "";
let displayName = "";
let editingName = false;

excelFile.addEventListener("change", function () {
    const file = excelFile.files[0];

    if (!file) {
        return;
    }

    const fileExtension = file.name.split(".").pop().toLowerCase();

    if (!["xlsx", "xls"].includes(fileExtension)) {
        showMessage("Please upload an Excel participant file.", "error");
        return;
    }

    const reader = new FileReader();

    reader.onload = function (event) {
        try {
            const data = new Uint8Array(event.target.result);
            const workbook = XLSX.read(data, { type: "array" });
            const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
            const rows = XLSX.utils.sheet_to_json(firstSheet);
            const participantNames = new Set();

            rows.forEach(function (row) {
                const name = String(row["Participant Name"] || "").trim();

                if (name) {
                    participantNames.add(name);
                }
            });

            const names = [...participantNames];

            if (names.length === 0) {
                showMessage(
                    "No participants were found in the uploaded file.",
                    "error"
                );
                return;
            }

            resetParticipantSelection();
            showParticipants(names);
            clearMessage();
        } catch (error) {
            console.error("Error reading Excel file:", error);
            showMessage("Unable to read participant data.", "error");
        }
    };

    reader.readAsArrayBuffer(file);
});

function resetParticipantSelection() {
    selectedParticipant = "";
    displayName = "";

    participantText.textContent = "Participant: none";
    previewName.textContent = "Participant name";
    footerName.textContent = "PARTICIPANT NAME";
}

function showParticipants(names) {
    participantMenu.innerHTML =
        '<div class="dropdown-heading">Select Participant</div>';

    names.forEach(function (name) {
        const option = document.createElement("div");

        option.className = "participant-option";
        option.textContent = name;

        option.addEventListener("click", function () {
            selectedParticipant = name;
            displayName = name;

            participantText.textContent = `Participant: ${name}`;
            updateName(name);

            participantDropdown.removeAttribute("open");
            clearMessage();
        });

        participantMenu.appendChild(option);
    });
}

function updateName(name) {
    previewName.textContent = name;
    footerName.textContent = name.toUpperCase();
}

participantText.addEventListener("dblclick", function (event) {
    if (!selectedParticipant || editingName) {
        return;
    }

    event.preventDefault();
    event.stopPropagation();

    editingName = true;
    participantDropdown.removeAttribute("open");
    participantText.style.display = "none";

    const input = document.createElement("input");

    input.type = "text";
    input.className = "participant-inline-editor";
    input.value = displayName;

    participantSummary.insertBefore(
        input,
        participantSummary.querySelector(".search-icon")
    );

    input.addEventListener("click", function (event) {
        event.preventDefault();
        event.stopPropagation();
    });

    input.addEventListener("input", function () {
        const editedName = input.value.trim();

        if (editedName) {
            updateName(editedName);
        }
    });

    input.addEventListener("keydown", function (event) {
        if (event.key === "Enter") {
            event.preventDefault();
            finishNameEdit(input, true);
        }

        if (event.key === "Escape") {
            event.preventDefault();
            finishNameEdit(input, false);
        }
    });

    input.addEventListener("blur", function () {
        finishNameEdit(input, true);
    });

    input.focus();
    input.select();
});

function finishNameEdit(input, save) {
    if (!editingName) {
        return;
    }

    editingName = false;

    const editedName = input.value.trim();

    if (save && editedName) {
        displayName = editedName;
    }

    participantText.textContent = `Participant: ${displayName}`;
    participantText.style.display = "";

    updateName(displayName);
    input.remove();
}

participantSummary.addEventListener("click", function (event) {
    if (editingName) {
        event.preventDefault();
    }
});

evaluationBoxes.forEach(function (checkbox) {
    checkbox.addEventListener("change", updateEvaluation);
});

selectAll.addEventListener("change", function () {
    evaluationBoxes.forEach(function (checkbox) {
        checkbox.checked = selectAll.checked;
    });

    updateEvaluation();
});

function getEvaluations() {
    return [...evaluationBoxes]
        .filter(function (checkbox) {
            return checkbox.checked;
        })
        .map(function (checkbox) {
            return checkbox.value;
        });
}

function updateEvaluation() {
    const selectedEvaluations = getEvaluations();
    const allSelected =
        selectedEvaluations.length === evaluationBoxes.length;

    selectAll.checked = allSelected;

    selectAll.indeterminate =
        selectedEvaluations.length > 0 && !allSelected;

    if (selectedEvaluations.length === 0) {
        evaluationText.textContent = "Evaluation Points: none";
        previewEvaluation.textContent = "Evaluation points (none)";
        return;
    }

    const evaluationNames = selectedEvaluations.join(", ");

    evaluationText.textContent = `Evaluation Points: ${evaluationNames}`;
    previewEvaluation.textContent =
        `Evaluation points (${evaluationNames})`;
}

// FOR BACKEND: This is where the selected participant and evaluation points would be sent to the backend for processing
generateButton.addEventListener("click", async function () {
    const evaluations = getEvaluations();

    if (!selectedParticipant) {
        showMessage(
            "Please select a participant before generating the report.",
            "error"
        );
        return;
    }

    if (evaluations.length === 0) {
        showMessage(
            "Please select at least one evaluation point.",
            "error"
        );
        return;
    }

    try {
        generateButton.disabled = true;
        generateButton.textContent = "Generating PDF...";

        showMessage(
            "Generating representative report...",
            "success"
        );

        // FOR BACKEND: Send the selected participant and evaluation points to the backend for processing
        const canvas = await html2canvas(reportPage, {
            scale: 2,
            backgroundColor: "#ffffff"
        });

        const { jsPDF } = window.jspdf;

        const pdf = new jsPDF({
            orientation: "portrait",
            unit: "mm",
            format: "a4"
        });

        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();

        const image = canvas.toDataURL("image/png");
        const canvasRatio = canvas.width / canvas.height;
        const pageRatio = pageWidth / pageHeight;

        let imageWidth;
        let imageHeight;

        if (canvasRatio > pageRatio) {
            imageWidth = pageWidth;
            imageHeight = pageWidth / canvasRatio;
        } else {
            imageHeight = pageHeight;
            imageWidth = pageHeight * canvasRatio;
        }

        const imageX = (pageWidth - imageWidth) / 2;
        const imageY = (pageHeight - imageHeight) / 2;

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
                .replace(/[^a-z0-9]+/gi, "-")
                .replace(/^-|-$/g, "") || "participant";

        pdf.save(
            `${safeName}-Individual-Participant-Report-Prototype.pdf`
        );
        // FOR BACKEND: Here you would handle the response from the backend after generating the PDF
        showMessage(
            "Representative report PDF generated successfully.",
            "success"
        );
    } catch (error) {
        console.error("Error generating PDF:", error);
        showMessage(
            "Unable to generate the representative PDF.",
            "error"
        );
    } finally {
        generateButton.disabled = false;
        generateButton.textContent = "Generate Report";
    }
});

function showMessage(message, type) {
    reportMessage.textContent = message;
    reportMessage.className = `report-message ${type}`;
}

function clearMessage() {
    reportMessage.textContent = "";
    reportMessage.className = "report-message";
}

updateEvaluation();