from datetime import datetime


def generate_final_report(patient_id, soap, doctor_diagnosis, doctor_prescription, doctor_notes):

    date_str = datetime.utcnow().strftime("%d %B %Y")

    return f"""
====================================

CLARITYNOTE CLINICAL REPORT

====================================

Patient ID: {patient_id}
Date: {date_str}

====================================

SOAP NOTE SUMMARY

====================================

{soap}

====================================

FINAL DIAGNOSIS

====================================

{doctor_diagnosis}

====================================

PRESCRIPTION

====================================

{doctor_prescription}

====================================

DOCTOR NOTES

====================================

{doctor_notes}

====================================

Doctor Validated ✔
AI Assisted ✔

====================================
"""
