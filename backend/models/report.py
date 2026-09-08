from sqlalchemy import Column, Integer, String, Float
from config.database import Base


class MalwareReport(Base):
    __tablename__ = "malware_reports"

    report_id = Column(Integer, primary_key=True, index=True)
    file_id = Column(Integer, nullable=False)
    classification = Column(String(100))
    risk_score = Column(Float)