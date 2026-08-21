from app.agents.base import BaseAgent

class FollowUpAgent(BaseAgent):
    def __init__(self):
        super().__init__("FollowUpAgent")

    def analyze(self, journey_events_data: list) -> dict:
        system_prompt = (
            "You are the FollowUpAgent. Your role is to analyze follow-up tasks, "
            "overdue timeline actions, and unresolved journey events. "
            "Examine if care coordination steps are stalled or require scheduling action. "
            "Propose administrative next steps for clinical desk staff. "
            "Do NOT make clinical decisions."
        )
        user_prompt = f"Journey Events Data: {journey_events_data}"
        return self.generate_json_response(system_prompt, user_prompt)
