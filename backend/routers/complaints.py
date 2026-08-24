from fastapi import APIRouter, UploadFile, File, Form, HTTPException
import shutil
import os
import uuid
import datetime
from ai_engine.inference import analyze_image_yolo
from ai_engine.severity_api import calculate_severity_and_routing
import sys
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))
from utils.geospatial import get_nearest_station
from utils.email_alert import send_email_alert
from utils.whatsapp_alert import send_whatsapp_alert

router = APIRouter()

# Ensure uploads directory exists
UPLOAD_DIR = os.path.join(os.path.dirname(__file__), '..', 'uploads')
os.makedirs(UPLOAD_DIR, exist_ok=True)

def generate_ticket_id():
    """Generate a human-readable Tamil Nadu ticket ID like TN-20240824-A3F2"""
    date_str = datetime.datetime.now().strftime("%Y%m%d")
    unique_part = uuid.uuid4().hex[:4].upper()
    return f"TN-{date_str}-{unique_part}"

@router.post("/report")
async def report_issue(
    image: UploadFile = File(...),
    description: str = Form(...),
    location_lat: float = Form(0.0),
    location_lng: float = Form(0.0)
):
    try:
        # 1. Save uploaded image
        file_extension = image.filename.split('.')[-1]
        unique_filename = f"{uuid.uuid4().hex}.{file_extension}"
        file_path = os.path.join(UPLOAD_DIR, unique_filename)

        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(image.file, buffer)

        # 2. Tier 1: Local Vision AI (YOLOv8) — returns dict with detections + confidence
        yolo_result = analyze_image_yolo(file_path)
        yolo_detections = yolo_result["detections"]
        yolo_confidence = yolo_result["top_confidence"]

        # Cleanup: delete the uploaded image after YOLO is done
        if os.path.exists(file_path):
            os.remove(file_path)

        # 3. Tier 2: Cloud NLP Engine (Gemini)
        final_assessment = calculate_severity_and_routing(description, yolo_detections)

        # 4. Enrich with confidence score, ticket ID, timestamp
        final_assessment["yolo_confidence"] = yolo_confidence
        final_assessment["ticket_id"] = generate_ticket_id()
        final_assessment["submitted_at"] = datetime.datetime.now().strftime("%d %b %Y, %I:%M %p")

        # 5. Geospatial Routing
        nearest_station = get_nearest_station(location_lat, location_lng)
        final_assessment["nearest_station"] = nearest_station

        # 6. Fire Real Alerts (Gmail + WhatsApp)
        alert_data = {
            "station_name": nearest_station,
            "issue_type": final_assessment.get("issue_type", "Unknown Issue"),
            "severity_score": final_assessment.get("severity_score", 50),
            "priority": final_assessment.get("priority", "Medium"),
            "department": final_assessment.get("department", "General Dispatch"),
            "description": description,
            "user_lat": location_lat,
            "user_lng": location_lng,
        }

        send_email_alert(**alert_data)
        send_whatsapp_alert(
            station_name=alert_data["station_name"],
            issue_type=alert_data["issue_type"],
            severity_score=alert_data["severity_score"],
            priority=alert_data["priority"],
            department=alert_data["department"],
            user_lat=location_lat,
            user_lng=location_lng
        )

        return {
            "status": "success",
            "message": "AI Analysis complete. Alerts dispatched.",
            "data": final_assessment
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
