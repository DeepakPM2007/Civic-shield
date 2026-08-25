from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from routers import complaints
from database import engine, Base
import os

app = FastAPI(
    title="CivicShield AI API",
    description="Backend API for Civic Complaint & Government Response System",
    version="1.0.0"
)

# Initialize Database
Base.metadata.create_all(bind=engine)

# Mount uploads directory for static file serving
UPLOAD_DIR = os.path.join(os.path.dirname(__file__), 'uploads')
os.makedirs(UPLOAD_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

# CORS middleware for frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, restrict this to frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(complaints.router, prefix="/api/complaints", tags=["Complaints"])

@app.get("/")
def read_root():
    return {"message": "Welcome to CivicShield AI API"}
