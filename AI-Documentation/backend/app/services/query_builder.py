from app.services.groq_service import (
    generate_response
)


def build_medical_query(
    conversation
):

    prompt = f"""
You are a medical query extraction engine.

Extract ONLY medical keywords.

Rules:

1. Return only keywords.
2. No explanations.
3. No bullet points.
4. No headings.
5. No sentences.
6. No markdown.

Example output:

fatigue
thirst
weight loss
blurred vision

Conversation:

{conversation}
"""

    result = generate_response(
        prompt
    )

    print(
        "\nMEDICAL QUERY:",
        result
    )

    return result