import os
from ultralytics import YOLO

# Resolve path relative to this file - works on any machine
_BASE_DIR = os.path.dirname(os.path.abspath(__file__))
BEST_WEIGHTS = os.path.join(_BASE_DIR, '..', '..', 'runs', 'detect', 'runs', 'detect', 'civicshield_v1', 'weights', 'best.pt')
BEST_WEIGHTS = os.path.normpath(BEST_WEIGHTS)

# Load model globally to avoid reloading on every request
model = None
if os.path.exists(BEST_WEIGHTS):
    model = YOLO(BEST_WEIGHTS)
else:
    print(f"Warning: Model weights not found at {BEST_WEIGHTS}. Fallback to generic yolov8n.")
    model = YOLO('yolov8n.pt')

# Master Class Mapping (from merge_datasets.py)
CLASS_NAMES = {
    0: "Garbage Pile",
    1: "Open Manhole",
    2: "Fallen Tree",
    3: "Water Leak"
}

def analyze_image_yolo(image_path: str):
    """
    Runs YOLOv8 on the uploaded image.
    Returns a dict with detected issue names and the top confidence score.
    """
    if not model:
        return {"detections": ["AI Model Offline"], "top_confidence": 0.0}

    results = model.predict(image_path, conf=0.25)
    
    detected_issues = []
    confidences = []

    for result in results:
        boxes = result.boxes
        for box in boxes:
            cls_id = int(box.cls[0].item())
            conf = round(float(box.conf[0].item()) * 100, 1)  # e.g. 87.3
            issue_name = CLASS_NAMES.get(cls_id, f"Unknown Object ({cls_id})")
            detected_issues.append(issue_name)
            confidences.append(conf)

    if not detected_issues:
        return {"detections": ["No specific civic issues detected visually"], "top_confidence": 0.0}

    # Return unique detections and the highest confidence score
    top_confidence = max(confidences) if confidences else 0.0
    return {"detections": list(set(detected_issues)), "top_confidence": top_confidence}
