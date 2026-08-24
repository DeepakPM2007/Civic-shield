# 🛡️ CivicShield AI

> **Automated Civic Issue Reporting & Routing System** built for the DeepSprint Hackathon.

CivicShield AI empowers citizens to report civic infrastructure issues (potholes, water leaks, fallen trees, garbage) simply by snapping a photo. Our hybrid AI pipeline automatically identifies the issue, scores its severity, finds the nearest municipal station via geospatial routing, and dispatches real-time alerts to government officials.

---

## ✨ Key Features
- 🧠 **Hybrid AI Pipeline:** YOLOv8 (Local Vision AI) + Gemini 2.5 Flash (Cloud NLP)
- 📍 **Geospatial Routing:** Automatically routes issues to the nearest Tamil Nadu municipal station (Chennai / Madurai zones).
- 🚨 **Real-Time Alerts:** Automated **WhatsApp** (Twilio) and **Email** (Gmail SMTP) alerts to station officers.
- 📊 **Government Dashboard:** Next.js frontend with live feed, skeleton loading, and AI confidence badges.

---

## 🏗️ Architecture

1. **Citizen App (Next.js):** Uploads photo + GPS coordinates.
2. **Vision Engine (YOLOv8):** Scans image locally for specific civic issues.
3. **NLP Engine (Gemini 2.5 Flash):** Assesses severity, determines priority (Critical/High/Medium/Low), and assigns the correct department.
4. **Backend (FastAPI):** Orchestrates the AI pipeline, calculates Haversine distance, and fires async alerts.

---

## 🚀 Quick Setup (For the Team)

### 1. Clone the repository
```bash
git clone https://github.com/DeepakPM2007/Civic-shield.git
cd Civic-shield
```

### 2. Backend Setup (FastAPI & AI)
```bash
cd backend
python -m venv venv
venv\Scripts\activate   # (Windows)
pip install -r requirements.txt
```
**Environment Variables (`.env` in root folder):**
Create a `.env` file in the root directory with:
```env
GEMINI_API_KEY="your_api_key"
GMAIL_USER="your_email@gmail.com"
GMAIL_APP_PASSWORD="your_app_password"
STATION_ALERT_EMAIL="station_email@gmail.com"
TWILIO_ACCOUNT_SID="your_twilio_sid"
TWILIO_AUTH_TOKEN="your_twilio_token"
TWILIO_WHATSAPP_FROM="whatsapp:+14155238886"
TWILIO_WHATSAPP_TO="whatsapp:+91XXXXXXXXXX"
```

### 3. Frontend Setup (Next.js)
```bash
cd frontend
npm install
```

### 4. Run Both Servers (Windows)
Just double-click the `start_servers.bat` file in the root directory, or run manually:
- **Backend:** `cd backend && uvicorn main:app --reload`
- **Frontend:** `cd frontend && npm run dev`

---
*Built with ❤️ for DeepSprint Hackathon*
