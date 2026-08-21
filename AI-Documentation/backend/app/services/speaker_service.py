from app.services.groq_service import generate_response

def identify_speakers(transcript):

    prompt = f"""
You are a medical consultation analyzer.

Determine who is speaking.

Classify each statement as:

Doctor:
Patient:

Transcript:

{transcript}

Return structured dialogue.
"""

    return generate_response(prompt)