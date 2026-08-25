from app.services.groq_service import (
    generate_response
)
# from app.services.medgemma_service import (
#     generate_response
# )

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

    prompt = f"""You are an expert AI Clinical Documentation Assistant. Your job is to generate structured medical documentation based on the current conversation and history.

PATIENT HISTORY:
{context}

CURRENT CONVERSATION:
{conversation}

IMPORTANT RULES:
1. ONLY use information explicitly provided in the current conversation or relevant patient history.
2. NEVER invent diagnoses, medications, lab values, or vital signs.
3. If any section (S, O, A, or P) has no information in the conversation, write "Not provided".
4. Diagnosis suggestions are NOT medical advice.
5. Do NOT echo or print the rules, prompt instructions, patient history context, or the current conversation in your response. Start your output directly with the SOAP Note.

OUTPUT FORMAT:
Your output must follow this exact format:

SOAP Note:
S: [Subjective details here or "Not provided"]
O: [Objective details here or "Not provided"]
A: [Assessment details here or "Not provided"]
P: [Plan details here or "Not provided"]

Diagnosis Suggestions:
[Suggestions here or "Not provided"]

Clinical Insights:
[Insights here or "Not provided"]

Symptom Predictions:
[Predictions here or "Not provided"]
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