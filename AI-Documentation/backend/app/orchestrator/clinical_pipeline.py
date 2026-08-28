from app.services.query_builder import build_medical_query
from app.rag.retriever import retrieve_history, retrieve_session_history
from app.agents.soap_agent import generate_soap
from app.agents.insight_agent import generate_insights
from app.agents.validator_agent import validate_report


DEBUG_PIPELINE = True


def run_pipeline(conversation, patient_id):

    print("\n")
    print("=" * 80)
    print("PIPELINE START")
    print("=" * 80)

    print("\nPATIENT ID:")
    print(patient_id)

    print("\nCONVERSATION:")
    print(conversation)

    # --------------------------------------------------
    # Query Builder
    # --------------------------------------------------

    query = build_medical_query(conversation)

    if DEBUG_PIPELINE:
        print("\n")
        print("=" * 80)
        print("QUERY BUILDER OUTPUT")
        print("=" * 80)
        print(query)

    # --------------------------------------------------
    # RAG Retrieval
    # --------------------------------------------------

    history_context = retrieve_history(query, patient_id)
    session_context = retrieve_session_history(query, patient_id)

    context = f"""

===== KNOWN DIAGNOSES =====

{history_context}

===== PREVIOUS CLINICAL FACTS =====

{session_context}


"""

    if DEBUG_PIPELINE:
        print("\n")
        print("=" * 80)
        print("RAG CONTEXT")
        print("=" * 80)
        print(context)

    # --------------------------------------------------
    # AGENT 1: SOAP AGENT
    # --------------------------------------------------

    print("\n")
    print("=" * 80)
    print("AGENT 1 : SOAP AGENT")
    print("=" * 80)

    soap_note = generate_soap(conversation, context)

    if DEBUG_PIPELINE:
        print("\nSOAP OUTPUT:\n")
        print(soap_note)

    # --------------------------------------------------
    # AGENT 2: INSIGHT AGENT
    # --------------------------------------------------

    print("\n")
    print("=" * 80)
    print("AGENT 2 : INSIGHT AGENT")
    print("=" * 80)

    insights = generate_insights(soap_note, history_context, session_context)

    if DEBUG_PIPELINE:
        print("\nINSIGHT OUTPUT:\n")
        print(insights)

    # --------------------------------------------------
    # AGENT 3: VALIDATOR AGENT
    # --------------------------------------------------

    print("\n")
    print("=" * 80)
    print("AGENT 3 : VALIDATOR AGENT")
    print("=" * 80)

    validation = validate_report(conversation, soap_note, insights)

    if DEBUG_PIPELINE:
        print("\nVALIDATION OUTPUT:\n")
        print(validation)

    print("\n")
    print("=" * 80)
    print("PIPELINE COMPLETE")
    print("=" * 80)

    return {
        "soap": soap_note,
        "insights": insights,
        "validation": validation
    }
