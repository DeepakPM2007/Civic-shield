from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import complaints

app = FastAPI(
    title="CivicShield AI API",
    description="Backend API for Civic Complaint & Government Response System",
    version="1.0.0"
)

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
