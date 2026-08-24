import os
import json
from google import genai
from dotenv import load_dotenv

# Load env variables (API key)
load_dotenv(os.path.join(os.path.dirname(__file__), '..', '..', '.env'))

API_KEY = os.getenv("GEMINI_API_KEY")
client = None
if API_KEY:
    client = genai.Client(api_key=API_KEY)

def calculate_severity_and_routing(user_description: str, yolo_detections: list):
    """
    Tier 2 AI: Uses Gemini to calculate severity based on visual evidence + text context.
    """
    if not API_KEY or not client:
        return {
            "issue_type": " + ".join(yolo_detections) if yolo_detections else "Unknown",
            "severity_score": 75,
            "department": "General Public Works (Fallback Mode)",
            "priority": "Medium"
        }
    
    prompt = f"""
    You are the central intelligence engine for CivicShield, a smart city management platform.
    A citizen has submitted a complaint.
    
    1. Visual Evidence (AI Image Scanner found): {', '.join(yolo_detections)}
    2. Citizen's Text Description: "{user_description}"
    
    Analyze the situation and return a strict JSON response (no markdown blocks, just raw JSON) with the following keys:
    - "issue_type": A short, clean summary of the actual issue (e.g., "Dangerous Pothole near School").
    - "severity_score": An integer from 1 to 100 representing how critical this is (100 is life-threatening/urgent).
    - "priority": "Low", "Medium", "High", or "Critical".
    - "department": Which municipal department should handle this (e.g., "Water & Sewage", "Roads & Highways", "Parks & Recreation", "Sanitation").
    """
    
    try:
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt
        )
        text_resp = response.text.replace("```json", "").replace("```", "").strip()
        result = json.loads(text_resp)
        return result
    except Exception as e:
        print(f"Gemini API Error: {e}")
        return {
            "issue_type": "Error analyzing issue",
            "severity_score": 50,
            "department": "General Dispatch",
            "priority": "Medium"
        }
