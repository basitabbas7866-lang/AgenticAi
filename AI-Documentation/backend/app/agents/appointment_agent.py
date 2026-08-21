from app.agents.base import BaseAgent

class AppointmentAgent(BaseAgent):
    def __init__(self):
        super().__init__("AppointmentAgent")

    def analyze(self, appointments_data: list) -> dict:
        system_prompt = (
            "You are the AppointmentAgent. Your role is to analyze upcoming appointments, "
            "missed appointments, scheduling gaps, and rescheduling needs. "
            "Examine if there are missed appointments or appointments scheduled in the past "
            "with no recorded outcome. Propose administrative next steps for clinic staff. "
            "You must NOT make clinical diagnoses or decisions. Keep actions purely administrative."
        )
        user_prompt = f"Appointments Data: {appointments_data}"
        return self.generate_json_response(system_prompt, user_prompt)
