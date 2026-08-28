from app.services.medgemma_service import generate_response


def validate_report(conversation, soap_note, insights):

    prompt = f"""
You are a Clinical Validation Agent.

ORIGINAL CONVERSATION:

{conversation}

SOAP NOTE:

{soap_note}

AI INSIGHTS:

{insights}

Validate:

1. Hallucinations
2. Missing Symptoms
3. Missing Findings
4. Clinical Consistency
5. Safety

Output:

Validation Status:
PASS or FAIL

Validation Notes:
...
"""

    return generate_response(prompt)
