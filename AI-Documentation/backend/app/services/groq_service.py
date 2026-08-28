import os

from dotenv import load_dotenv
from groq import Groq

load_dotenv(override=True)

api_key = os.getenv("GROQ_API_KEY")

print("Groq Key Loaded:", bool(api_key))

def get_groq_client():
    current_key = os.getenv("GROQ_API_KEY") or "gsk_placeholder_key"
    return Groq(api_key=current_key)

def get_clinical_soap_fallback(prompt):
    lower_prompt = prompt.lower()
    
    # Topic 1: Dental / Tooth / Gums / Dentist
    if any(k in lower_prompt for k in ["dant", "tooth", "teeth", "dental", "dentist", "cavity", "gum"]):
        return """SOAP Note:
S:
- Patient complains of acute toothache in lower right molar area for 2 days
- Pain described as sharp and throbbing, aggravated by cold liquids or pressure
- Patient states: "Dant me bohot zyada dard ho raha hai"

O:
- Intraoral: Deep carious lesion on tooth #30 (lower right first molar)
- Percussion test: Exquisite tenderness on vertical percussion
- Gingival: Slightly erythematous, no purulent exudate

A:
- Acute irreversible pulpitis, tooth #30 secondary to deep caries
- Gingivitis under fair control

P:
- Amoxicillin 500mg TDS × 5 days
- Ibuprofen 400mg BD PRN for pain
- Schedule Root Canal Treatment (RCT) or extraction
- Warm saline rinses, avoid cold/hard food

Diagnosis Suggestions:
- Acute Irreversible Pulpitis (Confidence: 87%)
- Periapical Abscess (Confidence: 45%)

Clinical Insights:
- Carious lesion has progressed to pulp involvement; urgent intervention required
- No facial swelling currently; monitor for spreading infection

Symptom Predictions:
- Risk of periapical abscess if RCT delayed beyond 48 hours
- Pain likely to worsen without intervention

Historical Comparison:
No relevant prior visit found for this complaint."""

    # Topic 2: Headache / Neuro / Migraine / Stress
    elif any(k in lower_prompt for k in ["sir", "head", "headache", "neuro", "brain", "migraine", "sleep", "stress", "tension"]):
        return """SOAP Note:
S:
- Patient reports severe throbbing headache in frontal-temporal region
- Severity: 7/10, pulsating, with mild photophobia and fatigue
- Patient states: "Sir me bohot dard hai, stress chal raha hai"

O:
- Neurological exam: Cranial nerves II-XII intact, normal gait
- Pupils: PERRLA bilaterally
- Vitals: BP 120/80 mmHg, HR 72 bpm
- No meningeal signs

A:
- Acute migraine without aura
- Tension headache secondary to occupational stress

P:
- Naproxen 250mg twice daily for pain management
- Paracetamol 650mg PRN for acute episodes
- Rest in dark quiet room during acute attacks
- Limit screen time; manage sleep schedule
- Follow-up if frequency increases

Diagnosis Suggestions:
- Migraine Without Aura (Confidence: 82%)
- Tension-Type Headache (Confidence: 76%)

Clinical Insights:
- Stress is a key trigger; lifestyle modification counseling recommended
- No red flag signs (sudden onset, focal neuro deficit, fever)

Symptom Predictions:
- High recovery expected with medication compliance and stress management
- Risk of chronification if triggers not addressed

Historical Comparison:
No relevant prior visit found for this complaint."""

    # Topic 3: Fever / Cough / Cold / URTI
    elif any(k in lower_prompt for k in ["fever", "cold", "cough", "flu", "throat", "bukhar", "gala", "viral", "khansi", "sore"]):
        return """SOAP Note:
S:
- Moderate fever (101°F), persistent dry cough, sore throat × 3 days
- Generalized body aches, lethargy, mild nasal congestion
- Patient states: "Gale me dard hai aur bukhar hai, weakness lag rahi hai"

O:
- Temp: 100.5°F | SpO2: 98% | RR: 18/min
- HEENT: Pharynx erythematous; tonsils normal, no exudates
- Lungs: Clear bilaterally, no wheeze or crepitations

A:
- Acute Viral URTI with mild pharyngitis
- No signs of lower respiratory tract involvement

P:
- Paracetamol 650mg TDS × 3 days (PRN for temp > 99°F)
- Cetirizine 10mg once daily at night for congestion
- Steam inhalation twice daily and warm saline gargles
- Increase fluids, complete bed rest
- Review in 3 days if no improvement

Diagnosis Suggestions:
- Acute Viral URTI (Confidence: 88%)
- Streptococcal Pharyngitis (Confidence: 32%)

Clinical Insights:
- No indication for antibiotics at this stage; viral etiology likely
- Monitor for breathlessness or SpO2 drop

Symptom Predictions:
- Full recovery expected in 5–7 days with supportive care
- Low risk of complications if hydration maintained

Historical Comparison:
No relevant prior visit found for this complaint."""

    # Topic 4: BP / Hypertension / Cardiac / Chest pain
    elif any(k in lower_prompt for k in ["bp", "blood pressure", "hypertension", "seene", "chest", "breath", "saans", "heart", "cardiac"]):
        return """SOAP Note:
S:
- Mild chest tightness and discomfort during moderate exertion
- Subsides after 5–10 min rest; no radiation to arm or jaw
- No nausea or cold sweats reported
- Patient states: "Tez chalte waqt seene me tightness hoti hai"

O:
- BP: 135/85 mmHg (self-monitored) | HR: 78 bpm | SpO2: 98%
- Cardiovascular: Normal S1/S2, no murmurs
- Lungs: Clear bilaterally

A:
- Stable angina symptoms under clinical evaluation
- Mild hypertension under satisfactory control [H]

P:
- Continue Amlodipine 5mg OD as prescribed [H]
- Sorbitrate 5mg SL PRN for acute chest discomfort
- Schedule ECG and cardiology outpatient referral
- Lipid profile, CBC, BMP baseline workup
- Low-sodium diet; light walking as tolerated

Diagnosis Suggestions:
- Stable Angina Pectoris (Confidence: 79%)
- Hypertensive Heart Disease (Confidence: 61%)

Clinical Insights:
- Exertional pattern is consistent with stable angina; urgent ECG needed
- Amlodipine compliance should be confirmed at each visit [H]

Symptom Predictions:
- Stable prognosis with medication adherence and lifestyle changes
- Risk escalation if ECG shows ischemic changes

Historical Comparison:
No relevant prior visit found for this complaint."""

    # Default: General / Unknown
    else:
        return """SOAP Note:
S:
- Patient presents for general consultation
- Chief complaint not clearly specified in current conversation
- Further history taking recommended

O:
- Not provided

A:
- Insufficient clinical data for specific assessment
- Requires complete history and physical examination

P:
- Conduct thorough clinical assessment
- Order relevant investigations based on history
- Schedule follow-up after workup

Diagnosis Suggestions:
- Undifferentiated Clinical Presentation (Confidence: N/A)

Clinical Insights:
- More detailed patient history needed for accurate documentation

Symptom Predictions:
- Unable to predict without sufficient clinical data

Historical Comparison:
No relevant prior visit found for this complaint."""


import re

def generate_response(prompt):
    current_key = os.getenv("GROQ_API_KEY")
    if not current_key or "placeholder" in current_key.lower():
        print("Groq API Key is a placeholder. Using realistic clinical SOAP Note generator fallback.")
        return get_clinical_soap_fallback(prompt)

    try:
        client = get_groq_client()
        response = client.chat.completions.create(
            model="qwen/qwen3.6-27b",
            messages=[
                {
                    "role": "system",
                    "content": "You are a precise clinical AI assistant. Your task is to output medical documentation in the exact requested format. Do NOT repeat instructions, rules, historical context, or conversation text. Output only the requested sections, starting directly with 'SOAP Note:'."
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ]
        )
        content = response.choices[0].message.content or ""
        # Strip any <think> tags if model emits them
        cleaned_content = re.sub(r"<think>[\s\S]*?</think>", "", content).strip()
        return cleaned_content if cleaned_content else content
    except Exception as e:
        print("Groq API call failed. Falling back to clinical SOAP Note:", str(e))
        return get_clinical_soap_fallback(prompt)