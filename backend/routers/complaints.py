from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel
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
from database import get_db, Complaint

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
    location_lng: float = Form(0.0),
    db: Session = Depends(get_db)
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

        # 3. Tier 2: Cloud NLP Engine (Gemini)
        final_assessment = calculate_severity_and_routing(description, yolo_detections)

        # 4. Enrich with confidence score, ticket ID, timestamp
        ticket_id = generate_ticket_id()
        submitted_at = datetime.datetime.now().strftime("%d %b %Y, %I:%M %p")

        # 5. Geospatial Routing
        nearest_station = get_nearest_station(location_lat, location_lng)

        # 6. Save to Database
        db_complaint = Complaint(
            ticket_id=ticket_id,
            issue_type=final_assessment.get("issue_type", "Unknown Issue"),
            severity_score=final_assessment.get("severity_score", 50),
            priority=final_assessment.get("priority", "Medium"),
            department=final_assessment.get("department", "General Dispatch"),
            nearest_station=nearest_station,
            lat=location_lat,
            lng=location_lng,
            image_filename=unique_filename,
            status="Pending",
            submitted_at=submitted_at,
            yolo_confidence=yolo_confidence
        )
        db.add(db_complaint)
        db.commit()
        db.refresh(db_complaint)

        # 7. Fire Real Alerts (Gmail + WhatsApp)
        alert_data = {
            "station_name": nearest_station,
            "issue_type": db_complaint.issue_type,
            "severity_score": db_complaint.severity_score,
            "priority": db_complaint.priority,
            "department": db_complaint.department,
            "description": description,
            "user_lat": location_lat,
            "user_lng": location_lng,
        }

        try:
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
        except Exception as e:
            print(f"Warning: Alert delivery failed: {e}")

        # Return dict expected by frontend
        response_data = {
            "ticket_id": db_complaint.ticket_id,
            "issue_type": db_complaint.issue_type,
            "severity_score": db_complaint.severity_score,
            "priority": db_complaint.priority,
            "department": db_complaint.department,
            "submitted_at": db_complaint.submitted_at,
            "yolo_confidence": db_complaint.yolo_confidence,
            "nearest_station": db_complaint.nearest_station,
            "lat": db_complaint.lat,
            "lng": db_complaint.lng,
            "status": db_complaint.status,
            "image_filename": db_complaint.image_filename
        }

        return {
            "status": "success",
            "message": "AI Analysis complete. Alerts dispatched.",
            "data": response_data
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/dashboard")
def get_all_complaints(db: Session = Depends(get_db)):
    complaints = db.query(Complaint).order_by(Complaint.id.desc()).all()
    return {"status": "success", "data": complaints}

@router.get("/track/{ticket_id}")
def track_complaint(ticket_id: str, db: Session = Depends(get_db)):
    complaint = db.query(Complaint).filter(Complaint.ticket_id == ticket_id).first()
    if not complaint:
        raise HTTPException(status_code=404, detail="Ticket not found")
    return {"status": "success", "data": complaint}

class StatusUpdate(BaseModel):
    status: str

@router.patch("/{ticket_id}/status")
def update_status(ticket_id: str, status_update: StatusUpdate, db: Session = Depends(get_db)):
    complaint = db.query(Complaint).filter(Complaint.ticket_id == ticket_id).first()
    if not complaint:
        raise HTTPException(status_code=404, detail="Ticket not found")
    
    complaint.status = status_update.status
    db.commit()
    db.refresh(complaint)
    return {"status": "success", "data": complaint}
