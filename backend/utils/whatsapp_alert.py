import os
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), '..', '..', '.env'))

TWILIO_SID = os.getenv("TWILIO_ACCOUNT_SID")
TWILIO_TOKEN = os.getenv("TWILIO_AUTH_TOKEN")
TWILIO_FROM = os.getenv("TWILIO_WHATSAPP_FROM", "whatsapp:+14155238886")  # Twilio sandbox number
TWILIO_TO = os.getenv("TWILIO_WHATSAPP_TO")  # Officer's WhatsApp number

def send_whatsapp_alert(station_name: str, issue_type: str, severity_score: int, priority: str, department: str, user_lat: float, user_lng: float):
    """
    Sends a WhatsApp message to the station officer via Twilio.
    """
    if not TWILIO_SID or not TWILIO_TOKEN or not TWILIO_TO:
        print("[WhatsApp Alert] Skipped: Twilio credentials not set in .env")
        return False

    try:
        from twilio.rest import Client
        client = Client(TWILIO_SID, TWILIO_TOKEN)

        maps_link = f"https://maps.google.com/?q={user_lat},{user_lng}"

        # Priority emoji mapping
        emoji = {"Critical": "🔴", "High": "🟠", "Medium": "🟡", "Low": "🟢"}.get(priority, "⚪")

        message_body = (
            f"🛡️ *CivicShield AI — Station Alert*\n\n"
            f"{emoji} *Priority: {priority.upper()}*\n"
            f"━━━━━━━━━━━━━━━━\n"
            f"🔍 *Issue:* {issue_type}\n"
            f"📊 *AI Severity Score:* {severity_score}/100\n"
            f"🏛️ *Department:* {department}\n"
            f"📍 *Nearest Station:* {station_name}\n"
            f"━━━━━━━━━━━━━━━━\n"
            f"🗺️ *Location:* {maps_link}\n\n"
            f"_Please respond within SLA window._"
        )

        message = client.messages.create(
            body=message_body,
            from_=TWILIO_FROM,
            to=f"whatsapp:{TWILIO_TO}"
        )

        print(f"[WhatsApp Alert] SUCCESS: SID={message.sid}")
        return True

    except Exception as e:
        print(f"[WhatsApp Alert] FAILED: {e}")
        return False
