
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import random
import os


# ============================================================
# FRONTEND CONFIGURATION
# ============================================================

# Directory containing this Python file.
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# Absolute path to the frontend.
FRONTEND_DIR = os.path.join(
    BASE_DIR,
    "ReportPlugin",
    "wp-content",
    "plugins",
    "SurveyReportGeneratorPlugin",
    "frontend"
)

# Configure Flask to serve frontend files.
app = Flask(
    __name__,
    static_folder=FRONTEND_DIR,
    static_url_path=""
)

CORS(app)


# ============================================================
# MOCK PARTICIPANT DATA
# ============================================================

PARTICIPANTS = [
    {
        "id": 1,
        "form_id": 100,
        "first_name": "Jody",
        "last_name": "Maurer"
    },
    {
        "id": 2,
        "form_id": 100,
        "first_name": "John",
        "last_name": "Smith"
    },
    {
        "id": 3,
        "form_id": 100,
        "first_name": "Jane",
        "last_name": "Doe"
    }
]


def get_participants():
    """Return participants in Gravity Forms-compatible format."""

    results = []

    for entry in PARTICIPANTS:
        results.append({
            "id": int(entry["id"]),
            "form_id": int(entry["form_id"]),
            "name": (
                f"{entry['first_name']} "
                f"{entry['last_name']}"
            ).strip(),
            "first_name": entry["first_name"],
            "last_name": entry["last_name"]
        })

    return results


# ============================================================
# MOCK EVALUATION DATA
# ============================================================

def score():
    """Generate a random score between 1.0 and 5.0."""
    return round(random.uniform(1.0, 5.0), 1)


def get_mock_scores(first_name, last_name, report):
    """
    Generate mock leadership evaluation scores.

    Each API request generates fresh random values.

    The report parameter identifies the evaluation
    being requested (for example, initial or delayed).
    """

    return {
        "Insight": {
            "Self Awareness": score(),
            "Social Awareness": score(),
            "Clarity Of Purpose": score(),
            "Situational Awareness": score(),
            "Self Compassion": score(),
            "Strategic Foresight": score(),
            "Balanced Processing": score()
        },

        "Influence": {
            "Tolerance For Ambiguity": score(),
            "Tolerance For Complexity": score(),
            "Capacity For Informal Influence": score(),
            "Capacity To Establish Networks": score(),
            "Capacity For Collaboration": score(),
            "Creative Decision Making": score()
        },

        "Impact": {
            "Extra Role Behaviours": score(),
            "Capacity To Foster Belonging": score(),
            "Capacity To Foster Intrinsic Motivation": score(),
            "Place Attachment": score()
        }
    }


@app.route("/")
def index():
    """Serve the frontend index.html."""

    return send_from_directory(
        FRONTEND_DIR,
        "index.html"
    )


@app.route("/<path:path>")
def static_files(path):
    """Serve frontend CSS, JS, images, and other assets."""

    file_path = os.path.join(
        FRONTEND_DIR,
        path
    )

    if os.path.isfile(file_path):
        return send_from_directory(
            FRONTEND_DIR,
            path
        )

    return "Not Found", 404

@app.route(
    "/wp-content/plugins/"
    "SurveyReportGeneratorPlugin/frontend/<path:path>"
)
def wordpress_static(path):
    """Support frontend asset requests using WordPress paths."""

    return send_from_directory(
        FRONTEND_DIR,
        path
    )

@app.route("/5-2", methods=["GET"])
def report_handle_query():

    query_type = request.args.get("query")

    if not query_type:
        return jsonify({
            "error": "Missing query parameter"
        }), 400

    if query_type == "participants":
        return jsonify(
            get_participants()
        )

    if query_type == "data":

        report = request.args.get("report")
        first_name = request.args.get("first_name")
        last_name = request.args.get("last_name")

        if not report:
            return jsonify({
                "error": "Missing report parameter"
            }), 400

        if not first_name or not last_name:
            return jsonify({
                "error": (
                    "Missing first_name or last_name parameter"
                )
            }), 400

        # Confirm the participant exists.
        participant = next(
            (
                p for p in PARTICIPANTS
                if p["first_name"].lower() == first_name.lower()
                and p["last_name"].lower() == last_name.lower()
            ),
            None
        )

        if participant is None:
            return jsonify({
                "error": "Participant not found"
            }), 404

        # Generate fresh mock evaluation scores.
        return jsonify(
            get_mock_scores(
                first_name,
                last_name,
                report
            )
        )

    return jsonify({
        "error": f"Unknown query type '{query_type}'"
    }), 400

if __name__ == "__main__":

    print("")
    print("=" * 60)
    print("TASMANIAN LEADERS - MOCK GRAVITY FORMS BACKEND")
    print("=" * 60)

    print("")
    print("Frontend directory:")
    print(FRONTEND_DIR)

    print("")
    print("Frontend directory exists:")
    print(os.path.isdir(FRONTEND_DIR))

    print("")
    print("JavaScript file checks:")

    for filename in [
        "api.js",
        "dynamicGraphs.js",
        "pdfGraphIntegration.js",
        "script.js"
    ]:
        file_path = os.path.join(
            FRONTEND_DIR,
            "js",
            filename
        )

        print(
            f"  {filename}: "
            f"{'FOUND' if os.path.isfile(file_path) else 'MISSING'}"
        )

    print("")
    print("Frontend:")
    print("  http://localhost:8881/")

    print("")
    print("Participants API:")
    print(
        "  http://localhost:8881/"
        "5-2?query=participants"
    )

    print("")
    print("Example evaluation API:")
    print(
        "  http://localhost:8881/"
        "5-2?query=data&report=initial"
        "&first_name=Jody&last_name=Maurer"
    )

    print("")
    print("=" * 60)
    print("")

    app.run(
        host="127.0.0.1",
        port=8881,
        debug=True
    )
