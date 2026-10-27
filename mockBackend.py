from flask import Flask, request, jsonify
import random

app = Flask(__name__)

# Mock participant data
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
    results = []

    for entry in PARTICIPANTS:
        results.append({
            "id": int(entry["id"]),
            "form_id": int(entry["form_id"]),
            "name": f"{entry['first_name']} {entry['last_name']}".strip(),
            "first_name": entry["first_name"],
            "last_name": entry["last_name"]
        })

    return results




def score():
    return round(random.uniform(1.0, 5.0), 1)

def get_mock_scores(first_name, last_name, report):
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


@app.route('/5-2', methods=['GET'])
def report_handle_query():

    query_type = request.args.get("query")

    if not query_type:
        return jsonify({
            "error": "Missing query parameter"
        }), 400

    # Equivalent to ?query=participants
    if query_type == "participants":
        return jsonify(get_participants())

    # Equivalent to ?query=data
    if query_type == "data":
        report = request.args.get("report")
        first_name = request.args.get("first_name")
        last_name = request.args.get("last_name")

        if not report:
            return jsonify({
                "error": "Missing report parameter"
            }), 400

        response = get_mock_scores(
            first_name,
            last_name,
            report
        )

        return jsonify(response)

    return jsonify({
        "error": f"Unknown query type '{query_type}'"
    }), 400


if __name__ == "__main__":
    app.run(
        host="0.0.0.0",
        port=8881,
        debug=True
    )
