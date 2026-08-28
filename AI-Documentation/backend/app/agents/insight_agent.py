from app.services.medgemma_service import generate_response


def generate_insights(soap_note, history_context, session_context):

    prompt = f"""
You are a Clinical Insight Agent.

================================================

CURRENT SOAP NOTE
(HIGHEST PRIORITY)

================================================

{soap_note}

================================================

KNOWN DIAGNOSES
(BACKGROUND CONTEXT)

================================================

{history_context}

================================================

PREVIOUS CLINICAL FACTS
(BACKGROUND CONTEXT)

================================================

{session_context}

================================================

IMPORTANT RULES

1. CURRENT SOAP NOTE has highest priority.

2. Known Diagnoses are historical context only.

3. Do NOT assume previous diseases are causing
current symptoms unless current symptoms support it.

4. Focus primarily on the CURRENT VISIT.

5. Do NOT provide final diagnosis.

6. Do NOT prescribe medication.

Generate:

1. Possible Conditions

2. Risk Factors

3. Suggested Investigations

4. Clinical Correlations
"""

    return generate_response(prompt)
