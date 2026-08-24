import smtplib
import os
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), '..', '..', '.env'))

GMAIL_USER = os.getenv("GMAIL_USER")
GMAIL_APP_PASSWORD = os.getenv("GMAIL_APP_PASSWORD")

def send_email_alert(station_name: str, issue_type: str, severity_score: int, priority: str, department: str, description: str, user_lat: float, user_lng: float):
    """
    Sends a formatted HTML alert email to the civic station officer.
    """
    if not GMAIL_USER or not GMAIL_APP_PASSWORD:
        print("[Email Alert] Skipped: GMAIL_USER or GMAIL_APP_PASSWORD not set in .env")
        return False

    # In production, each station has its own email. For MVP we send to your own Gmail.
    RECIPIENT_EMAIL = os.getenv("STATION_ALERT_EMAIL", GMAIL_USER)

    # Priority color mapping
    color_map = {"Critical": "#ef4444", "High": "#f97316", "Medium": "#f59e0b", "Low": "#22c55e"}
    priority_color = color_map.get(priority, "#6b7280")

    subject = f"🚨 CivicShield ALERT [{priority}] — {issue_type}"

    html_body = f"""
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; background: #0f172a; color: #e2e8f0; border-radius: 12px; overflow: hidden;">
        <div style="background: linear-gradient(135deg, #1e40af, #7c3aed); padding: 24px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 22px;">🛡️ CivicShield AI — Station Alert</h1>
            <p style="color: #bfdbfe; margin: 4px 0 0 0; font-size: 14px;">Automated Civic Issue Notification</p>
        </div>
        <div style="padding: 24px;">
            <div style="background: {priority_color}22; border: 1px solid {priority_color}; border-radius: 8px; padding: 16px; margin-bottom: 20px; text-align: center;">
                <span style="color: {priority_color}; font-size: 18px; font-weight: bold;">⚠️ {priority.upper()} PRIORITY — AI Severity Score: {severity_score}/100</span>
            </div>
            <table style="width: 100%; border-collapse: collapse;">
                <tr style="border-bottom: 1px solid #334155;">
                    <td style="padding: 10px; color: #94a3b8; width: 40%;">Detected Issue</td>
                    <td style="padding: 10px; color: #f1f5f9; font-weight: bold;">{issue_type}</td>
                </tr>
                <tr style="border-bottom: 1px solid #334155;">
                    <td style="padding: 10px; color: #94a3b8;">Department</td>
                    <td style="padding: 10px; color: #60a5fa;">{department}</td>
                </tr>
                <tr style="border-bottom: 1px solid #334155;">
                    <td style="padding: 10px; color: #94a3b8;">Nearest Station</td>
                    <td style="padding: 10px; color: #a78bfa;">{station_name}</td>
                </tr>
                <tr style="border-bottom: 1px solid #334155;">
                    <td style="padding: 10px; color: #94a3b8;">Citizen Description</td>
                    <td style="padding: 10px; color: #f1f5f9; font-style: italic;">"{description}"</td>
                </tr>
                <tr>
                    <td style="padding: 10px; color: #94a3b8;">GPS Location</td>
                    <td style="padding: 10px;">
                        <a href="https://maps.google.com/?q={user_lat},{user_lng}" style="color: #34d399;">
                            📍 Open in Google Maps ({user_lat:.4f}, {user_lng:.4f})
                        </a>
                    </td>
                </tr>
            </table>
        </div>
        <div style="background: #1e293b; padding: 16px; text-align: center; font-size: 12px; color: #64748b;">
            This is an automated alert from CivicShield AI. Please respond within the SLA window.
        </div>
    </div>
    """

    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"] = GMAIL_USER
        msg["To"] = RECIPIENT_EMAIL
        msg.attach(MIMEText(html_body, "html"))

        with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
            server.login(GMAIL_USER, GMAIL_APP_PASSWORD)
            server.sendmail(GMAIL_USER, RECIPIENT_EMAIL, msg.as_string())

        print(f"[Email Alert] SUCCESS: Sent to {RECIPIENT_EMAIL}")
        return True

    except Exception as e:
        print(f"[Email Alert] FAILED: {e}")
        return False
