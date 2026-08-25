from sqlalchemy import create_engine, Column, Integer, String, Float
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

SQLALCHEMY_DATABASE_URL = "sqlite:///./civicshield.db"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

class Complaint(Base):
    __tablename__ = "complaints"

    id = Column(Integer, primary_key=True, index=True)
    ticket_id = Column(String, unique=True, index=True)
    issue_type = Column(String, index=True)
    severity_score = Column(Integer)
    priority = Column(String)
    department = Column(String)
    nearest_station = Column(String)
    lat = Column(Float)
    lng = Column(Float)
    image_filename = Column(String)
    status = Column(String, default="Pending")
    submitted_at = Column(String)
    yolo_confidence = Column(Float, default=0.0)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
