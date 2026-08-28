from app.services.groq_service import generate_response
from app.services.query_builder import build_medical_query
from app.rag.retriever import (
    retrieve_history,
    retrieve_session_history,
    retrieve_history_details,
    retrieve_session_history_details
)


def generate_soap_with_rag(conversation, patient_id):
    query = build_medical_query(conversation)
    
    history_context, history_docs = retrieve_history_details(query, patient_id)
    session_context, session_docs = retrieve_session_history_details(query, patient_id)

    has_history = bool(history_context.strip() and history_context.strip() != 'No historical lab or imaging records found.')
    has_sessions = bool(session_context.strip() and session_context.strip() != 'No previous clinical encounter sessions found.')

    context = f"""
===== HISTORICAL REPORTS =====
{history_context if has_history else 'No historical lab or imaging records found.'}

===== PREVIOUS SESSIONS =====
{session_context if has_sessions else 'No previous clinical encounter sessions found.'}
"""

    historical_instruction = ""
    if has_history or has_sessions:
        historical_instruction = """
Historical Comparison:
- Previous Visit Summary: [1-line summary of the last related visit]
- Condition Then: [brief status at previous visit]
- Condition Now: [brief current status based on this conversation]
- Key Changes: [what has changed since last visit - improved/worsened/new symptoms]
- Continuity of Care: [medications or treatments continued from last visit]
"""
    else:
        historical_instruction = """
Historical Comparison:
No relevant prior visit found for this complaint.
"""

    prompt = f"""You are an expert AI Clinical Documentation Assistant with RAG (Retrieval-Augmented Generation) capability.
Your job is to generate concise, structured medical documentation in bullet-point format only.

PATIENT RETRIEVED HISTORY & CONTEXT:
{context}

CURRENT CONVERSATION:
{conversation}

IMPORTANT RULES:
1. Use ONLY concise bullet points. NO long paragraphs. Each bullet = one short line.
2. Ground assessment and plan on information from the conversation or retrieved history only.
3. NEVER invent diagnoses, medications, lab values, or vital signs not discussed.
4. If any SOAP section has no data, write "- Not provided".
5. Tag history-grounded findings with [H] at the end of the bullet.
6. Start output directly with "SOAP Note:" - do NOT echo instructions.

OUTPUT FORMAT:
SOAP Note:
S:
- [patient complaint bullet]

O:
- [clinical finding / vital bullet]

A:
- [diagnosis / assessment bullet]

P:
- [treatment / plan bullet]

Diagnosis Suggestions:
- [Diagnosis] (Confidence: X%)

Clinical Insights:
- [key takeaway bullet]

Symptom Predictions:
- [prediction bullet]

{historical_instruction}"""

    response_text = generate_response(prompt)

    rag_metadata = {
        "query": query,
        "history_count": len(history_docs),
        "session_count": len(session_docs),
        "history_docs": history_docs,
        "session_docs": session_docs,
        "is_rag_grounded": len(history_docs) > 0 or len(session_docs) > 0,
        "has_historical_comparison": has_history or has_sessions,
        "grounding_engine": "MedCPT-ChromaDB Vector Store"
    }

    return {
        "report": response_text,
        "rag_metadata": rag_metadata
    }


def generate_soap(conversation, patient_id):
    result = generate_soap_with_rag(conversation, patient_id)
    return result["report"]

def compile_final_report(soap_note, prescription, historical_comparison=""):
    prompt = f"""You are a helpful clinical documentation assistant.
Your task is to compile a "Final Patient Consultation & Care Plan Report" that a doctor can print and hand over to the patient.

Here is the Clinical SOAP Note (contains Subjective, Objective, Assessment, Plan details):
{soap_note}

Here is the Doctor's Custom Prescription & Advice:
{prescription}

Here is the Historical Visit Comparison (if any):
{historical_comparison if (historical_comparison and historical_comparison.strip()) else "No prior history comparisons."}

Please output a beautifully structured, comprehensive Patient Consultation Summary.
Format it using Markdown and standard headings, including:
1. Patient Care Summary (explain the assessment/diagnosis in simple words)
2. Prescribed Medications & Dosages (combine the doctor's custom prescription and active clinical plan items)
3. Diet & Lifestyle Guidelines (detailed bullet points for diet, exercise, and stress)
4. Follow-up & Next Steps (referrals, labs, next appointment details)
5. Historical Trends & Progress (briefly compare this visit with prior visits if relevant)

Make sure the tone is patient-friendly, reassuring, and highly clear. 
Start your response directly with the report content without any preamble or intro.
"""
    return generate_response(prompt)