# from app.services.groq_service import (
#     generate_response
# )
from app.services.medgemma_service import (
    generate_response
)

from app.services.query_builder import (
    build_medical_query
)

from app.rag.retriever import (
    retrieve_history,
    retrieve_session_history
)


def generate_soap(
    conversation,
    patient_id
):

    query = build_medical_query(
        conversation
    )

    history_context = (
        retrieve_history(
            query,
            patient_id
        )
    )

    session_context = (
        retrieve_session_history(
            query,
            patient_id
        )
    )

    context = f"""

===== HISTORICAL REPORTS =====

{history_context}

===== PREVIOUS SESSIONS =====

{session_context}

"""

    prompt = f"""
You are an expert AI Clinical Documentation Assistant.

PATIENT HISTORY:

{context}

CURRENT CONVERSATION:

{conversation}

IMPORTANT RULES:

1. ONLY use information explicitly provided.

2. NEVER invent:
   - Diagnoses
   - Medications
   - Lab Values
   - Vital Signs

3. Use previous history only when relevant.

4. If information is missing:
   write "Not provided"

5. Diagnosis suggestions are NOT medical advice.

Generate:

SOAP NOTE

Diagnosis Suggestions

Clinical Insights

Symptom Predictions
"""

    print("\n")
    print("=" * 80)
    print("FINAL DATA SENT TO GROQ")
    print("=" * 80)

    print("\nPATIENT ID:")
    print(patient_id)

    print("\nMEDICAL QUERY:")
    print(query)

    print("\nHISTORY DOCS:")
    print(history_context)

    print("\nSESSION DOCS:")
    print(session_context)

    print("\nCURRENT CONVERSATION:")
    print(conversation)

    print("\nPROMPT LENGTH:")
    print(len(prompt))

    print("\n" + "=" * 80)
    print("END")
    print("=" * 80)
    print("\n")

    return generate_response(
        prompt
    )