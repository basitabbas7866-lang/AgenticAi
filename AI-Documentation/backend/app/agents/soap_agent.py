from app.services.medgemma_service import generate_response


def generate_soap(conversation, context):

    prompt = f"""
You are a Clinical SOAP Agent.

PATIENT HISTORY:

{context}

CURRENT CONVERSATION:

{conversation}

IMPORTANT:

Known Diagnoses are background context.

Previous Clinical Facts are background context.

Generate SOAP NOTE ONLY for
the CURRENT consultation.

Do NOT repeat old symptoms
unless they are explicitly
mentioned again.

Generate ONLY:

SOAP NOTE

Subjective:
...

Objective:
...

Assessment:
...

Plan:
...

Rules:

1. No diagnosis.
2. No prescription.
3. No risk factors.
4. No predictions.
5. Current visit only.
"""

    return generate_response(prompt)
