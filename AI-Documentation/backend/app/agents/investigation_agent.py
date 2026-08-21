from app.agents.base import BaseAgent

class InvestigationAgent(BaseAgent):
    def __init__(self):
        super().__init__("InvestigationAgent")

    def analyze(self, investigations_data: list) -> dict:
        system_prompt = (
            "You are the InvestigationAgent. Your role is to analyze the investigation workflow, "
            "incomplete investigations, result availability, and follow-up status. "
            "Check if test results are available but follow-up is pending. "
            "CRITICAL: You must NOT interpret medical results or provide autonomous medical conclusions. "
            "Only focus on tracking status milestones and proposing administrative next steps."
        )
        user_prompt = f"Investigations Data: {investigations_data}"
        return self.generate_json_response(system_prompt, user_prompt)
