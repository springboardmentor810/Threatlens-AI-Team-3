from sqlalchemy import Column, Integer, String
from config.database import Base


class Alert(Base):
    __tablename__ = "alerts"

    alert_id = Column(Integer, primary_key=True, index=True)
    report_id = Column(Integer, nullable=False)
    alert_status = Column(String(50))