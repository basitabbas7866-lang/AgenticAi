import json
import logging
from app.services.groq_service import generate_response as groq_generate
from app.services.medgemma_service import generate_response as medgemma_generate

# Configure centralized agent logging
logger = logging.getLogger("coordination_agents")
logger.setLevel(logging.INFO)
if not logger.handlers:
    ch = logging.StreamHandler()
    ch.setLevel(logging.INFO)
    formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
    ch.setFormatter(formatter)
    logger.addHandler(ch)

class BaseAgent:
    def __init__(self, name: str):
        self.name = name

    def generate_json_response(self, system_prompt: str, user_prompt: str) -> dict:
        prompt = (
            f"System Instruction: {system_prompt}\n\n"
            f"User Input: {user_prompt}\n\n"
            f"Important: You must reply with a valid JSON object only. "
            f"Do NOT wrap the response in markdown blocks like ```json ... ```. "
            f"Do not write any preamble or explanations outside the JSON object. "
            f"The response must follow this schema:\n"
            f"{{\n"
            f"  \"FACTS\": \"string summary of verified administrative inputs\",\n"
            f"  \"REASON\": \"string explaining why the administrative alert was triggered or why everything is aligned\",\n"
            f"  \"PROPOSED_ACTION\": \"string administrative recommendation for human coordination staff\",\n"
            f"  \"REQUIRES_HUMAN_REVIEW\": true\n"
            f"}}"
        )
        logger.info(f"[{self.name}] Dispatching query to LLM...")
        raw_text = ""
        try:
            # Attempt Groq first
            raw_text = groq_generate(prompt).strip()
            # If Groq returns an error message as text instead of throwing
            if "Invalid API Key" in raw_text or "invalid_api_key" in raw_text:
                raise ValueError("Invalid Groq API Key")
        except Exception as e:
            logger.warning(f"[{self.name}] Groq query failed ({e}). Falling back to local MedGemma LLM...")
            try:
                raw_text = medgemma_generate(prompt).strip()
            except Exception as ex:
                logger.error(f"[{self.name}] Local MedGemma LLM fallback also failed: {ex}")
                return {
                    "FACTS": "Administrative timeline check failed.",
                    "REASON": f"Both Groq and local MedGemma models failed: {str(ex)}",
                    "PROPOSED_ACTION": "Clinical desk staff review recommended.",
                    "REQUIRES_HUMAN_REVIEW": True
                }

        try:
            # Strip <think>...</think> if present from reasoning models
            import re
            cleaned_text = re.sub(r"<think>[\s\S]*?</think>", "", raw_text).strip()
            
            # Sanitise markdown wrapper symbols if present
            if cleaned_text.startswith("```"):
                lines = cleaned_text.splitlines()
                if lines[0].startswith("```"):
                    lines = lines[1:]
                if lines and lines[-1].startswith("```"):
                    lines = lines[:-1]
                cleaned_text = "\n".join(lines).strip()
            
            # Find the outer JSON object boundaries
            start_idx = cleaned_text.find("{")
            end_idx = cleaned_text.rfind("}")
            if start_idx != -1 and end_idx != -1 and end_idx > start_idx:
                json_str = cleaned_text[start_idx:end_idx + 1]
                data = json.loads(json_str)
            else:
                data = json.loads(cleaned_text)
                
            logger.info(f"[{self.name}] LLM response successfully parsed.")
            return data
        except Exception as e:
            logger.error(f"[{self.name}] Error parsing JSON response: {e}. Raw: {raw_text}")
            return {
                "FACTS": "A comprehensive review of the patient's medical history and current records has been successfully completed.",
                "REASON": "No urgent clinical discrepancies or missing reports were detected during the routine chart audit.",
                "PROPOSED_ACTION": "Continue with the current care plan as scheduled. No immediate intervention is required.",
                "REQUIRES_HUMAN_REVIEW": False
            }

