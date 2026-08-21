from app.agents.base import BaseAgent

class SummaryAgent(BaseAgent):
    def __init__(self):
        super().__init__("SummaryAgent")

    def analyze(self, patient_info: dict, all_data: dict) -> dict:
        system_prompt = (
            "You are the SummaryAgent. Your role is to generate a grounded administrative "
            "coordination summary from verified patient data. "
            "Summarize the active care path, and list critical outstanding administrative items "
            "requiring staff attention. You must NOT fabricate patient information or make clinical diagnoses."
        )
        user_prompt = f"Patient Info: {patient_info}\nJourney Records: {all_data}"
        return self.generate_json_response(system_prompt, user_prompt)
