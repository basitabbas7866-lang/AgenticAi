from app.agents.base import BaseAgent

class SummaryAgent(BaseAgent):
    def __init__(self):
        super().__init__("SummaryAgent")

    def analyze(self, patient_info: dict, all_data: dict) -> dict:
        system_prompt = (
            "You are the SummaryAgent. Your role is to generate a grounded patient journey summary "
            "based strictly on the verified patient records, database logs, and retrieved RAG context. "
            "You must NOT make clinical diagnoses or treatment recommendations. Keep it coordination-focused. "
            "Do NOT fabricate information; if something is missing, explicitly say it is 'unavailable'.\n\n"
            "Format the 'FACTS' value in the output JSON as a clean, highly readable Markdown block with "
            "the following 9 sections. Next to each fact, you must cite its source (e.g. [Source: RAG History], "
            "[Source: DB - Appointments], [Source: SOAP Consultation], etc.).\n\n"
            "Sections to include in 'FACTS':\n"
            "1. **Patient Journey Overview**: (E.g. Age, gender, chronic state, or background. Reference RAG History or Patient info)\n"
            "2. **Recent Events**: (Latest events logged. Reference DB - Journey Events)\n"
            "3. **Current Appointments**: (Upcoming scheduled slots. Reference DB - Appointments)\n"
            "4. **Referral Status**: (Referral logs, specialists, status. Reference DB - Referrals)\n"
            "5. **Investigation Workflow**: (Ordered, scheduled tests or results. Reference DB - Investigations)\n"
            "6. **Pending Actions**: (Administrative tasks. Reference DB or RAG)\n"
            "7. **Overdue Actions**: (Delayed tests, referrals, or appointments. Reference DB - Coordination Alerts)\n"
            "8. **Follow-up Status**: (Post-consultation plan. Reference SOAP notes/RAG Session)\n"
            "9. **Items Requiring Staff Attention**: (Critical coordination gaps needing review. Reference DB - Coordination Alerts)\n\n"
            "Keep the 'REASON' key focused on explaining any coordination conflicts or why human review is triggered. "
            "Keep 'PROPOSED_ACTION' as a bulleted list of administrative tasks for the staff. "
            "Set 'REQUIRES_HUMAN_REVIEW' to true."
        )
        
        user_prompt = (
            f"Patient Info: {patient_info}\n\n"
            f"Retrieved Historical PDF RAG Context: {all_data.get('rag_history', '')}\n\n"
            f"Retrieved Prior Sessions SOAP RAG Context: {all_data.get('rag_session', '')}\n\n"
            f"Database Appointments: {all_data.get('appointments', [])}\n\n"
            f"Database Referrals: {all_data.get('referrals', [])}\n\n"
            f"Database Investigations: {all_data.get('investigations', [])}\n\n"
            f"Database Journey Events: {all_data.get('journey_events', [])}\n\n"
            f"Database Consultations: {all_data.get('consultations', [])}\n\n"
            f"Database Coordination Alerts: {all_data.get('coordination_alerts', [])}"
        )
        return self.generate_json_response(system_prompt, user_prompt)

