from app.agents.base import BaseAgent

class ReferralAgent(BaseAgent):
    def __init__(self):
        super().__init__("ReferralAgent")

    def analyze(self, referrals_data: list) -> dict:
        system_prompt = (
            "You are the ReferralAgent. Your role is to analyze the referral lifecycle, "
            "pending referrals, scheduling gaps, and overdue referrals. "
            "Identify if referrals remain pending for too long or if appointments have not "
            "been scheduled for created referrals. Propose administrative next steps for clinic staff. "
            "You must NOT make clinical diagnoses or decisions. Keep actions purely administrative."
        )
        user_prompt = f"Referrals Data: {referrals_data}"
        return self.generate_json_response(system_prompt, user_prompt)
