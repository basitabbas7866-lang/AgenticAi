import logging
import concurrent.futures
from sqlalchemy.orm import Session
from app.models.patient import Patient
from app.models.appointment import Appointment
from app.models.referral import Referral
from app.models.investigation import Investigation
from app.models.journey_event import JourneyEvent

from app.agents.appointment_agent import AppointmentAgent
from app.agents.referral_agent import ReferralAgent
from app.agents.investigation_agent import InvestigationAgent
from app.agents.followup_agent import FollowUpAgent
from app.agents.summary_agent import SummaryAgent
from app.models.consultation import Consultation
from app.services.coordination_monitor import detect_coordination_issues

logger = logging.getLogger("coordination_agents")

class PatientJourneyCoordinatorAgent:
    def __init__(self):
        self.appointment_agent = AppointmentAgent()
        self.referral_agent = ReferralAgent()
        self.investigation_agent = InvestigationAgent()
        self.followup_agent = FollowUpAgent()
        self.summary_agent = SummaryAgent()

    def run_analysis(self, db: Session, patient_id: str, auth_token: str | None = None) -> dict:
        logger.info(f"[PatientJourneyCoordinatorAgent] Starting multi-agent analysis for patient {patient_id}")
        
        # 0. Authorization check
        if auth_token != "clinical-workspace-token":
            logger.error("[PatientJourneyCoordinatorAgent] Unauthorized access block triggered.")
            return {"error": "Unauthorized access"}

        # 1. Fetch Patient Info
        patient = db.query(Patient).filter(Patient.patient_id == patient_id).first()
        if not patient:
            logger.error(f"[PatientJourneyCoordinatorAgent] Patient {patient_id} not found in DB.")
            return {"error": "Patient not found"}
        
        patient_info = {
            "patient_id": patient.patient_id,
            "name": patient.name,
            "age": patient.age,
            "gender": patient.gender,
            "phone": patient.phone
        }
        
        # 2. Fetch all journey events, appointments, referrals, investigations
        appointments = db.query(Appointment).filter(Appointment.patient_id == patient_id).all()
        referrals = db.query(Referral).filter(Referral.patient_id == patient_id).all()
        investigations = db.query(Investigation).filter(Investigation.patient_id == patient_id).all()
        events = db.query(JourneyEvent).filter(JourneyEvent.patient_id == patient_id).all()
        consultations = db.query(Consultation).filter(Consultation.patient_id == patient_id).all()
        
        # Serialize lists
        appts_list = [{
            "id": appt.appointment_id,
            "department": appt.department_service,
            "type": appt.appointment_type,
            "date": appt.appointment_date.isoformat(),
            "status": appt.status,
            "notes": appt.notes
        } for appt in appointments]
        
        refs_list = [{
            "id": ref.referral_id,
            "referring": ref.referring_department,
            "referred": ref.referred_department_specialist,
            "reason": ref.referral_reason,
            "priority": ref.priority,
            "status": ref.status,
            "date": ref.referral_date.isoformat(),
            "appointment_info": ref.appointment_info
        } for ref in referrals]
        
        invs_list = [{
            "id": inv.investigation_id,
            "test_name": inv.test_name,
            "status": inv.status,
            "ordered_date": inv.ordered_date.isoformat(),
            "scheduled_date": inv.scheduled_date.isoformat() if inv.scheduled_date else None,
            "result_available": inv.result_available,
            "result_reference": inv.result_reference,
            "notes": inv.notes
        } for inv in investigations]
        
        events_list = [{
            "id": ev.id,
            "type": ev.event_type,
            "title": ev.title,
            "description": ev.description,
            "status": ev.status,
            "timestamp": ev.timestamp.isoformat()
        } for ev in events]

        consultations_list = [{
            "id": c.consultation_id,
            "transcript": c.transcript[:400] if c.transcript else "",
            "report": c.report[:800] if c.report else "",
            "created_at": c.created_at.isoformat()
        } for c in consultations]
        
        # Fetch unresolved coordination issues/alerts
        alerts = detect_coordination_issues(db, patient_id=patient_id)
        
        # RAG retrieval checks with exception safety
        rag_history = ""
        rag_session = ""
        try:
            from app.rag.retriever import retrieve_history
            rag_history = retrieve_history("patient clinical background history diagnosis chronic conditions surgeries", patient_id)
        except Exception as e:
            logger.warning(f"[CoordinatorAgent] Chroma history retrieve failed or collection missing: {e}")
            rag_history = "Patient history documents unavailable in RAG."

        try:
            from app.rag.retriever import retrieve_session_history
            rag_session = retrieve_session_history("patient consultations SOAP notes transcripts latest reports", patient_id)
        except Exception as e:
            logger.warning(f"[CoordinatorAgent] Chroma session retrieve failed or collection missing: {e}")
            rag_session = "Prior consultation SOAP notes and reports unavailable in RAG."

        all_records = {
            "appointments": appts_list,
            "referrals": refs_list,
            "investigations": invs_list,
            "journey_events": events_list,
            "consultations": consultations_list,
            "coordination_alerts": alerts,
            "rag_history": rag_history,
            "rag_session": rag_session
        }
        
        # 3. Trigger Specialized Agents in parallel
        logger.info("[PatientJourneyCoordinatorAgent] Dispatching sub-agent queries in parallel...")
        
        with concurrent.futures.ThreadPoolExecutor(max_workers=5) as executor:
            future_appt = executor.submit(self.appointment_agent.analyze, appts_list)
            future_ref = executor.submit(self.referral_agent.analyze, refs_list)
            future_inv = executor.submit(self.investigation_agent.analyze, invs_list)
            future_followup = executor.submit(self.followup_agent.analyze, events_list)
            future_summary = executor.submit(self.summary_agent.analyze, patient_info, all_records)

            # Wait for all futures to resolve
            appt_analysis = future_appt.result()
            ref_analysis = future_ref.result()
            inv_analysis = future_inv.result()
            followup_analysis = future_followup.result()
            summary_analysis = future_summary.result()
        
        # 4. Consolidate results package
        coordination_package = {
            "patient_id": patient_id,
            "patient_name": patient.name,
            "summary": summary_analysis,
            "appointments": appt_analysis,
            "referrals": ref_analysis,
            "investigations": inv_analysis,
            "followups": followup_analysis
        }
        
        logger.info(f"[PatientJourneyCoordinatorAgent] Parallel analysis compiled for patient {patient_id}")
        return coordination_package
