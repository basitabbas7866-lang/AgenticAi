from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from app.models.patient import Patient
from app.models.appointment import Appointment
from app.models.referral import Referral
from app.models.investigation import Investigation
from app.models.journey_event import JourneyEvent

def detect_coordination_issues(db: Session, patient_id: str | None = None):
    alerts = []
    
    # Fetch patients
    if patient_id:
        patients = db.query(Patient).filter(Patient.patient_id == patient_id).all()
    else:
        patients = db.query(Patient).all()
        
    now = datetime.utcnow()
    
    for pat in patients:
        p_id = pat.patient_id
        p_name = pat.name
        
        # 1. Missed Appointments check
        appointments = db.query(Appointment).filter(Appointment.patient_id == p_id).all()
        for appt in appointments:
            if appt.status == "MISSED":
                alerts.append({
                    "patient_id": p_id,
                    "patient_name": p_name,
                    "issue_type": "missed_appointment",
                    "severity": "High",
                    "detected_at": now.isoformat(),
                    "related_entity": {
                        "type": "appointment",
                        "id": str(appt.appointment_id)
                    },
                    "explanation": f"Appointment for {appt.appointment_type} in {appt.department_service} was marked as missed.",
                    "recommended_action": "Contact patient to reschedule the missed slot.",
                    "requires_human_review": True
                })
            elif appt.status == "SCHEDULED" and appt.appointment_date < now:
                alerts.append({
                    "patient_id": p_id,
                    "patient_name": p_name,
                    "issue_type": "missed_appointment",
                    "severity": "High",
                    "detected_at": now.isoformat(),
                    "related_entity": {
                        "type": "appointment",
                        "id": str(appt.appointment_id)
                    },
                    "explanation": f"Appointment for {appt.appointment_type} with {appt.department_service} was scheduled for {appt.appointment_date.strftime('%b %d, %Y')}, but has not been updated with an outcome.",
                    "recommended_action": "Verify if the patient attended the session and mark completed or reschedule.",
                    "requires_human_review": True
                })
                
        # 2. Referrals check
        referrals = db.query(Referral).filter(Referral.patient_id == p_id).all()
        for ref in referrals:
            # Check unscheduled referral
            if ref.status in ["CREATED", "SENT"] and not ref.appointment_info:
                alerts.append({
                    "patient_id": p_id,
                    "patient_name": p_name,
                    "issue_type": "unscheduled_referral",
                    "severity": "Medium",
                    "detected_at": now.isoformat(),
                    "related_entity": {
                        "type": "referral",
                        "id": str(ref.referral_id)
                    },
                    "explanation": f"Referral to {ref.referred_department_specialist} was issued on {ref.referral_date.strftime('%b %d, %Y')}, but no appointment has been scheduled.",
                    "recommended_action": "Coordinate with referred clinic to schedule appointment slots.",
                    "requires_human_review": True
                })
            # Check pending referral stalled
            if ref.status in ["CREATED", "SENT"] and ref.referral_date < now - timedelta(hours=48):
                alerts.append({
                    "patient_id": p_id,
                    "patient_name": p_name,
                    "issue_type": "pending_referral",
                    "severity": "High",
                    "detected_at": now.isoformat(),
                    "related_entity": {
                        "type": "referral",
                        "id": str(ref.referral_id)
                    },
                    "explanation": f"Referral to {ref.referred_department_specialist} has remained in status '{ref.status}' beyond the 48-hour administrative threshold.",
                    "recommended_action": "Follow up with receiving clinic to verify referral transmission status.",
                    "requires_human_review": True
                })
                
        # 3. Investigations check
        investigations = db.query(Investigation).filter(Investigation.patient_id == p_id).all()
        for inv in investigations:
            # Check stalled investigation
            if inv.status in ["ORDERED", "SCHEDULED"] and inv.ordered_date < now - timedelta(hours=48):
                alerts.append({
                    "patient_id": p_id,
                    "patient_name": p_name,
                    "issue_type": "pending_investigation",
                    "severity": "Medium",
                    "detected_at": now.isoformat(),
                    "related_entity": {
                        "type": "investigation",
                        "id": str(inv.investigation_id)
                    },
                    "explanation": f"Investigation for {inv.test_name} was ordered on {inv.ordered_date.strftime('%b %d, %Y')}, but has not been scheduled or processed after 48 hours.",
                    "recommended_action": "Contact diagnostics center to verify scheduling status.",
                    "requires_human_review": True
                })
            # Check available results without follow-up recorded
            if inv.status == "RESULT_AVAILABLE":
                # Check for subsequent consultations or documentation
                has_followup = db.query(JourneyEvent).filter(
                    JourneyEvent.patient_id == p_id,
                    JourneyEvent.event_type.in_(["consultation", "documentation"]),
                    JourneyEvent.timestamp > inv.updated_at
                ).first() is not None
                
                # Check if result is available for > 24 hours
                stalled_result = inv.updated_at < now - timedelta(hours=24)
                
                if not has_followup or stalled_result:
                    alerts.append({
                        "patient_id": p_id,
                        "patient_name": p_name,
                        "issue_type": "unresolved_results",
                        "severity": "Critical" if not has_followup else "High",
                        "detected_at": now.isoformat(),
                        "related_entity": {
                            "type": "investigation",
                            "id": str(inv.investigation_id)
                        },
                        "explanation": f"Diagnostic results for {inv.test_name} are available, but no follow-up action or consultation has been documented.",
                        "recommended_action": "Review lab reports and schedule follow-up consultation with the patient.",
                        "requires_human_review": True
                    })
                    
    return alerts
