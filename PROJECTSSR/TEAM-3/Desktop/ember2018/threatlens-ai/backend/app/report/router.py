from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Report, File as FileModel


router = APIRouter(
    prefix="/api/reports",
    tags=["Reports"]
)


@router.post("/create")
def create_report(
    file_id: int,
    report_path: str,
    db: Session = Depends(get_db)
):
    """
    Create a report record for an uploaded file.
    """

    # Check whether the file exists
    file_record = (
        db.query(FileModel)
        .filter(FileModel.file_id == file_id)
        .first()
    )

    if not file_record:
        raise HTTPException(
            status_code=404,
            detail=f"File with ID {file_id} not found."
        )

    # Create Report record
    new_report = Report(
        file_id=file_id,
        report_path=report_path
    )

    try:
        db.add(new_report)
        db.commit()
        db.refresh(new_report)

    except Exception as e:
        db.rollback()

        raise HTTPException(
            status_code=500,
            detail=f"Database error while creating report: {str(e)}"
        )

    return {
        "status": "success",
        "message": "Report created successfully.",
        "report": {
            "report_id": new_report.report_id,
            "file_id": new_report.file_id,
            "report_path": new_report.report_path,
            "generated_at": new_report.generated_at
        }
    }


@router.get("/")
def list_reports(
    db: Session = Depends(get_db)
):
    """
    Retrieve all reports from PostgreSQL.
    """

    reports = (
        db.query(Report)
        .order_by(Report.generated_at.desc())
        .all()
    )

    return {
        "total_reports": len(reports),
        "reports": [
            {
                "report_id": report.report_id,
                "file_id": report.file_id,
                "report_path": report.report_path,
                "generated_at": report.generated_at
            }
            for report in reports
        ]
    }


@router.get("/{report_id}")
def get_report(
    report_id: int,
    db: Session = Depends(get_db)
):
    """
    Retrieve one report by report ID.
    """

    report = (
        db.query(Report)
        .filter(Report.report_id == report_id)
        .first()
    )

    if not report:
        raise HTTPException(
            status_code=404,
            detail=f"Report with ID {report_id} not found."
        )

    return {
        "status": "success",
        "report": {
            "report_id": report.report_id,
            "file_id": report.file_id,
            "report_path": report.report_path,
            "generated_at": report.generated_at
        }
    }