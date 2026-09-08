from sqlalchemy import Column, Integer, String, DateTime
from config.database import Base
from datetime import datetime


class UploadedFile(Base):
    __tablename__ = "uploaded_files"

    file_id = Column(Integer, primary_key=True, index=True)
    file_name = Column(String(255), nullable=False)
    file_hash = Column(String(255))
    upload_date = Column(DateTime, default=datetime.utcnow)