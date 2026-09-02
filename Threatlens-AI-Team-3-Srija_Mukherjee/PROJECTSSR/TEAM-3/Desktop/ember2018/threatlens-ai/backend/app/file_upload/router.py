import sys
import uuid
from datetime import datetime, timezone
from pathlib import Path

from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from app.config import MAX_UPLOAD_BYTES, UPLOAD_DIR
from app.database import get_db
from app.security import get_current_user, is_administrator

from app.models import (
    File as FileModel,
    User,
    StaticAnalysis,
    EmberFeatures,
    Prediction,
    ThreatLog,
    Alert,
)

from app.file_upload.analyzer import run_basic_static_analysis





PROJECT_ROOT = Path(__file__).resolve().parents[3]

if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))




try:
    from ml_engine.engine.scanner import MalwareScanner

    ML_ENGINE_AVAILABLE = True

except Exception as e:

    print("EMBER ML engine import failed:", e)

    MalwareScanner = None
    ML_ENGINE_AVAILABLE = False




router = APIRouter(
    prefix="/api/upload",
    tags=["File Upload & Static File Analysis"]
)


malware_scanner = None

if ML_ENGINE_AVAILABLE:

    try:

        malware_scanner = MalwareScanner()

        print(
            "EMBER ML engine initialized successfully."
        )

    except Exception as e:

        print(
            "EMBER ML engine initialization failed:",
            e
        )

        malware_scanner = None
        ML_ENGINE_AVAILABLE = False




def find_existing_file(
    db: Session,
    user_id: int,
    file_hash: str
):
    """
    Search PostgreSQL for an existing file
    using SHA-256 hash.
    """

    return (
        db.query(FileModel)
        .filter(
            FileModel.user_id == user_id,
            FileModel.file_hash == file_hash
        )
        .first()
    )


def save_basic_analysis(
    db: Session,
    new_file: FileModel,
    new_analysis: StaticAnalysis
):
    """
    Save File and StaticAnalysis records.
    """

    try:

        db.add(new_file)
        db.add(new_analysis)

        db.commit()

        db.refresh(new_file)
        db.refresh(new_analysis)

    except Exception as e:

        db.rollback()

        raise e




def delete_temp_file(
    file_path: Path
):
    """
    Delete temporary uploaded file safely.
    """

    try:

        if file_path.exists():
            file_path.unlink()

    except Exception as e:

        print(
            "Unable to delete temporary file:",
            e
        )



def build_duplicate_response(
    existing_file: FileModel
):
    """
    Build complete response for an already-scanned file.
    """

    existing_analysis = (
        existing_file.static_analysis
    )

    response = {

        "status": "already_scanned",

        "message": (
            "This file has already been uploaded "
            "and analyzed."
        ),

        "duplicate": True,

        "file": {

            "file_id":
                existing_file.file_id,

            "user_id":
                existing_file.user_id,

            "filename":
                existing_file.filename,

            "file_hash":
                existing_file.file_hash,

            "file_size":
                existing_file.file_size,

            "file_type":
                existing_file.file_type,

            "status":
                existing_file.status,

            "upload_time":
                existing_file.upload_time
        },

        "database": {

            "analysis_id":
                (
                    existing_analysis.analysis_id
                    if existing_analysis
                    else None
                ),

            "saved_to_postgresql":
                True,

            "existing_record":
                True
        }
    }



    if existing_analysis:

        response["static_analysis"] = {

            "analysis_id":
                existing_analysis.analysis_id,

            "md5_hash":
                existing_analysis.md5_hash,

            "sha256_hash":
                existing_analysis.sha256_hash,

            "file_entropy":
                (
                    float(
                        existing_analysis.file_entropy
                    )
                    if existing_analysis.file_entropy
                    is not None
                    else None
                ),

            "risk_score":
                (
                    float(
                        existing_analysis.risk_score
                    )
                    if existing_analysis.risk_score
                    is not None
                    else None
                ),

            "pe_features":
                existing_analysis.pe_features,

            "strings":
                existing_analysis.strings,

            "urls":
                existing_analysis.urls,

            "metadata":
                existing_analysis.file_metadata,

            "created_at":
                existing_analysis.created_at
        }

        features = (
            existing_analysis.ember_features
        )

        if features:

            response["database"]["feature_id"] = (
                features.feature_id
            )

            response["ember_features"] = {

                "feature_id":
                    features.feature_id,

                "created_at":
                    features.created_at
            }



            prediction = features.prediction

            if prediction:

                response["database"]["prediction_id"] = (
                    prediction.prediction_id
                )

                response["prediction"] = {

                    "prediction_id":
                        prediction.prediction_id,

                    "model_name":
                        prediction.model_name,

                    "malware_family":
                        prediction.malware_family,

                    "prediction_label":
                        prediction.prediction_label,

                    "confidence":
                        (
                            float(
                                prediction.confidence
                            )
                            if prediction.confidence
                            is not None
                            else None
                        ),

                    "prediction_time":
                        prediction.prediction_time
                }



                threat_logs = []

                for log in prediction.threat_logs:

                    threat_data = {

                        "log_id":
                            log.log_id,

                        "severity":
                            log.severity,

                        "status":
                            log.status,

                        "description":
                            log.description,

                        "created_at":
                            log.created_at,

                        "alerts":
                            []
                    }



                    for alert in log.alerts:

                        threat_data["alerts"].append({

                            "alert_id":
                                alert.alert_id,

                            "message":
                                alert.message,

                            "is_read":
                                alert.is_read,

                            "created_at":
                                alert.created_at
                        })

                    threat_logs.append(
                        threat_data
                    )

                response["threat_logs"] = (
                    threat_logs
                )

    return response




@router.post("/scan")
async def scan_file(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Upload and analyze a file.

    SHA-256 is used to detect duplicate files.

    If the same file already exists:
        - no duplicate File record is created
        - missing StaticAnalysis is restored
        - existing analysis is returned
    """


    if not file.filename:

        raise HTTPException(
            status_code=400,
            detail="Filename cannot be empty."
        )

    # Never use a client-controlled path as a filesystem path. Keep only the
    # name so uploads cannot escape UPLOAD_DIR.
    original_filename = Path(file.filename).name

    if original_filename in {"", ".", ".."}:
        raise HTTPException(status_code=400, detail="Filename is invalid.")


   

    try:

        file_bytes = await file.read()

        if not file_bytes:

            raise HTTPException(
                status_code=400,
                detail="Uploaded file is empty."
            )

        if len(file_bytes) > MAX_UPLOAD_BYTES:
            raise HTTPException(
                status_code=413,
                detail=f"Uploaded file exceeds the {MAX_UPLOAD_BYTES} byte limit."
            )

    except HTTPException:
        raise

    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail=(
                "Unable to read uploaded file: "
                f"{str(e)}"
            )
        )

    saved_filename = (
        f"{uuid.uuid4().hex[:6]}_{original_filename}"
    )

    file_path = UPLOAD_DIR / saved_filename



    try:

        file_path.write_bytes(
            file_bytes
        )

    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail=(
                "Unable to save uploaded file: "
                f"{str(e)}"
            )
        )




    try:

        result = run_basic_static_analysis(
            file_path,
            original_filename,
            current_user.name
        )

    except Exception as e:

        delete_temp_file(file_path)

        raise HTTPException(
            status_code=500,
            detail=(
                "File analysis error: "
                f"{str(e)}"
            )
        )



    hashes = result.get(
        "hashes",
        {}
    )

    sha256_hash = hashes.get(
        "sha256"
    )

    if not sha256_hash:

        delete_temp_file(file_path)

        raise HTTPException(
            status_code=500,
            detail=(
                "SHA-256 hash was not generated "
                "by the static analyzer."
            )
        )



    existing_file = find_existing_file(
        db,
        current_user.user_id,
        sha256_hash
    )



    if existing_file:

        existing_analysis = (
            existing_file.static_analysis
        )



        if existing_analysis is None:

            static_data = result.get(
                "static_analysis",
                {}
            )

            suspicious_indicators = (
                static_data.get(
                    "suspicious_indicators",
                    []
                )
            )

            yara_matches = (
                static_data.get(
                    "yara_matches",
                    []
                )
            )

            is_executable = (
                static_data.get(
                    "is_executable",
                    False
                )
            )

            detection_data = (
                result.get(
                    "detection",
                    {}
                )
            )

            try:

                existing_analysis = StaticAnalysis(

                    file=existing_file,

                    md5_hash=hashes.get(
                        "md5"
                    ),

                    sha256_hash=sha256_hash,

                    risk_score=detection_data.get(
                        "risk_score"
                    ),

                    strings="\n".join(
                        str(item)
                        for item in suspicious_indicators
                    ),

                    urls=[],

                    pe_features={
                        "is_executable":
                            is_executable
                    },

                    file_metadata={

                        "filename":
                            result["filename"],

                        "file_type":
                            result["file_type"],

                        "uploaded_by":
                            current_user.name,

                        "verdict":
                            detection_data.get(
                                "verdict"
                            ),

                        "recommended_action":
                            detection_data.get(
                                "recommended_action"
                            ),

                        "yara_matches":
                            yara_matches
                    }
                )

                db.add(
                    existing_analysis
                )

                db.commit()

                db.refresh(
                    existing_file
                )

                db.refresh(
                    existing_analysis
                )

            except Exception as e:

                db.rollback()

                delete_temp_file(
                    file_path
                )

                raise HTTPException(
                    status_code=500,
                    detail=(
                        "Duplicate file exists, but "
                        "StaticAnalysis could not be created: "
                        f"{str(e)}"
                    )
                )



        delete_temp_file(
            file_path
        )



        return build_duplicate_response(
            existing_file
        )



    static_data = result.get(
        "static_analysis",
        {}
    )

    suspicious_indicators = (
        static_data.get(
            "suspicious_indicators",
            []
        )
    )

    yara_matches = (
        static_data.get(
            "yara_matches",
            []
        )
    )

    is_executable = (
        static_data.get(
            "is_executable",
            False
        )
    )

    detection_data = (
        result.get(
            "detection",
            {}
        )
    )




    new_file = FileModel(

        user_id=current_user.user_id,

        filename=result["filename"],

        file_hash=sha256_hash,

        file_size=result["file_size"],

        file_type=result["file_type"],

        status="Analysis Completed"
    )


    new_analysis = StaticAnalysis(

        file=new_file,

        md5_hash=hashes.get(
            "md5"
        ),

        sha256_hash=sha256_hash,

        risk_score=detection_data.get(
            "risk_score"
        ),

        strings="\n".join(
            str(item)
            for item in suspicious_indicators
        ),

        urls=[],

        pe_features={
            "is_executable":
                is_executable
        },

        file_metadata={

            "filename":
                result["filename"],

            "file_type":
                result["file_type"],

            "uploaded_by":
                current_user.name,

            "verdict":
                detection_data.get(
                    "verdict"
                ),

            "recommended_action":
                detection_data.get(
                    "recommended_action"
                ),

            "yara_matches":
                yara_matches
        }
    )




    ember_result = None

    new_features = None

    new_prediction = None

    new_threat_log = None

    new_alert = None



    if (
        is_executable
        and ML_ENGINE_AVAILABLE
        and malware_scanner is not None
    ):

        try:

            print(
                "Running EMBER ML analysis for: "
                f"{result['filename']}"
            )



            ember_result = (
                malware_scanner.scan(
                    file_path
                )
            )



            ml_data = ember_result.get(
                "ml",
                {}
            )

            ml_prediction = (
                ml_data.get(
                    "prediction"
                )
            )

            malware_probability = (
                ml_data.get(
                    "malware_probability"
                )
            )

            risk_level = (
                ml_data.get(
                    "risk_level"
                )
            )


            feature_vector = None

            try:

                from ml_engine.engine.feature_extractor import (
                    extract_features
                )

                feature_vector = (
                    extract_features(
                        file_path
                    )
                )

                if hasattr(
                    feature_vector,
                    "tolist"
                ):

                    feature_vector = (
                        feature_vector.tolist()
                    )

            except Exception as feature_error:

                print(
                    "EMBER feature extraction failed:",
                    feature_error
                )

                feature_vector = None




            new_features = EmberFeatures(

                analysis=new_analysis,

                byte_features=feature_vector,

                histogram_features=None,

                string_features=None,

                general_features=None,

                header_features=None,

                section_features=None,

                import_features=None,

                export_features=None
            )



            new_prediction = Prediction(

                feature=new_features,

                model_name=(
                    "LightGBM EMBER v1.0"
                ),

                malware_family=None,

                prediction_label=(
                    ml_prediction
                    if ml_prediction
                    else "UNKNOWN"
                ),

                confidence=(
                    malware_probability
                )
            )




            if (
                ml_prediction == "MALWARE"
                or risk_level in (
                    "HIGH",
                    "CRITICAL"
                )
            ):

                severity = (
                    risk_level
                    if risk_level
                    else "HIGH"
                )

                description = (
                    "EMBER ML engine classified "
                    f"'{result['filename']}' as "
                    f"{ml_prediction}. "
                    "Malware probability: "
                    f"{malware_probability}%."
                )

                new_threat_log = ThreatLog(

                    prediction=new_prediction,

                    severity=severity,

                    status="Detected",

                    description=description
                )



                new_alert = Alert(

                    threat_log=new_threat_log,

                    message=(
                        "Threat detected in file "
                        f"'{result['filename']}'. "
                        f"Severity: {severity}. "
                        "ML prediction: "
                        f"{ml_prediction}."
                    ),

                    is_read=False
                )



            db.add(new_file)

            db.add(new_analysis)

            db.add(new_features)

            db.add(new_prediction)

            if new_threat_log:

                db.add(
                    new_threat_log
                )

            if new_alert:

                db.add(
                    new_alert
                )


            try:

                db.commit()

            except IntegrityError:

                db.rollback()

                duplicate_file = (
                    find_existing_file(
                        db,
                        current_user.user_id,
                        sha256_hash
                    )
                )

                if duplicate_file:

                    delete_temp_file(
                        file_path
                    )

                    return build_duplicate_response(
                        duplicate_file
                    )

                raise




            db.refresh(
                new_file
            )

            db.refresh(
                new_analysis
            )

            db.refresh(
                new_features
            )

            db.refresh(
                new_prediction
            )

            if new_threat_log:

                db.refresh(
                    new_threat_log
                )

            if new_alert:

                db.refresh(
                    new_alert
                )

            print(
                "EMBER ML analysis completed successfully."
            )


        except HTTPException:
            raise

        except Exception as e:

            db.rollback()

            print(
                "EMBER ML analysis failed:",
                e
            )

            ember_result = {

                "scan_status":
                    "ML_ENGINE_ERROR",

                "error":
                    str(e)
            }

            new_features = None

            new_prediction = None

            new_threat_log = None

            new_alert = None



            try:

                save_basic_analysis(
                    db,
                    new_file,
                    new_analysis
                )

            except IntegrityError:

                duplicate_file = (
                    find_existing_file(
                        db,
                        current_user.user_id,
                        sha256_hash
                    )
                )

                if duplicate_file:

                    delete_temp_file(
                        file_path
                    )

                    return build_duplicate_response(
                        duplicate_file
                    )

                raise HTTPException(
                    status_code=500,
                    detail=(
                        "Database integrity error while "
                        "saving file analysis."
                    )
                )



    else:

        try:

            save_basic_analysis(
                db,
                new_file,
                new_analysis
            )

        except IntegrityError:

            duplicate_file = (
                find_existing_file(
                    db,
                    current_user.user_id,
                    sha256_hash
                )
            )

            if duplicate_file:

                delete_temp_file(
                    file_path
                )

                return build_duplicate_response(
                    duplicate_file
                )

            raise HTTPException(
                status_code=500,
                detail=(
                    "Database integrity error while "
                    "saving file analysis."
                )
            )


        if not is_executable:

            ember_result = {

                "scan_status":
                    "SKIPPED",

                "reason": (
                    "EMBER analysis is only "
                    "performed for Windows "
                    "executable files."
                )
            }

        else:

            ember_result = {

                "scan_status":
                    "SKIPPED",

                "reason": (
                    "EMBER ML engine is "
                    "currently unavailable."
                )
            }




    delete_temp_file(
        file_path
    )


    response = {

        "status":
            "success",

        "message": (
            "File uploaded and analyzed "
            "successfully."
        ),

        "duplicate":
            False,

        "file": {

            "file_id":
                new_file.file_id,

            "user_id":
                new_file.user_id,

            "filename":
                new_file.filename,

            "file_hash":
                new_file.file_hash,

            "file_size":
                new_file.file_size,

            "file_type":
                new_file.file_type,

            "status":
                new_file.status,

            "upload_time":
                new_file.upload_time
        },

        "static_analysis":
            result,

        "ember_analysis":
            ember_result,

        "database": {

            "analysis_id":
                new_analysis.analysis_id,

            "saved_to_postgresql":
                True,

            "existing_record":
                False
        }
    }



    if new_prediction:

        response["database"]["feature_id"] = (
            new_features.feature_id
        )

        response["database"]["prediction_id"] = (
            new_prediction.prediction_id
        )

        response["prediction"] = {

            "prediction_id":
                new_prediction.prediction_id,

            "model_name":
                new_prediction.model_name,

            "malware_family":
                new_prediction.malware_family,

            "prediction_label":
                new_prediction.prediction_label,

            "confidence":

                (
                    float(
                        new_prediction.confidence
                    )
                    if new_prediction.confidence
                    is not None
                    else None
                )
        }



    if new_threat_log:

        response["database"]["threat_log_id"] = (
            new_threat_log.log_id
        )

        response["threat"] = {

            "log_id":
                new_threat_log.log_id,

            "severity":
                new_threat_log.severity,

            "status":
                new_threat_log.status,

            "description":
                new_threat_log.description
        }




    if new_alert:

        response["database"]["alert_id"] = (
            new_alert.alert_id
        )

        response["alert"] = {

            "alert_id":
                new_alert.alert_id,

            "message":
                new_alert.message,

            "is_read":
                new_alert.is_read
        }




    return response




@router.get("/scans")
def list_scans(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Retrieve all uploaded file scans.
    """

    query = db.query(FileModel).filter(FileModel.deleted_at.is_(None))
    if not is_administrator(current_user):
        query = query.filter(FileModel.user_id == current_user.user_id)
    files = query.order_by(FileModel.upload_time.desc()).all()

    scans = []

    for item in files:

        analysis = (
            item.static_analysis
        )

        scans.append({

            "file_id":
                item.file_id,

            "user_id":
                item.user_id,

            "filename":
                item.filename,

            "file_hash":
                item.file_hash,

            "file_size":
                item.file_size,

            "file_type":
                item.file_type,

            "upload_time":
                item.upload_time,

            "status":
                item.status,

            "analysis_id":
                (
                    analysis.analysis_id
                    if analysis
                    else None
                ),

            "risk_score":
                (
                    float(
                        analysis.risk_score
                    )
                    if (
                        analysis
                        and
                        analysis.risk_score
                        is not None
                    )
                    else None
                )
        })

    return {

        "total_scans":
            len(scans),

        "scans":
            scans
    }



@router.get("/scans/{file_id}")
def get_scan_details(
    file_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Retrieve complete analysis information
    for one uploaded file.
    """

    file_record = (
        db.query(FileModel)
        .filter(
            FileModel.file_id == file_id
        )
        .first()
    )

    if (
        not file_record
        or file_record.deleted_at is not None
        or (
            file_record.user_id != current_user.user_id
            and not is_administrator(current_user)
        )
    ):

        raise HTTPException(
            status_code=404,
            detail=(
                f"File with ID {file_id} "
                "not found."
            )
        )

    analysis = (
        file_record.static_analysis
    )

    result = {

        "file": {

            "file_id":
                file_record.file_id,

            "user_id":
                file_record.user_id,

            "filename":
                file_record.filename,

            "file_hash":
                file_record.file_hash,

            "file_size":
                file_record.file_size,

            "file_type":
                file_record.file_type,

            "status":
                file_record.status,

            "upload_time":
                file_record.upload_time
        },

        "static_analysis":
            None,

        "ember_features":
            None,

        "prediction":
            None,

        "threat_logs":
            []
    }



    if analysis:

        result["static_analysis"] = {

            "analysis_id":
                analysis.analysis_id,

            "md5_hash":
                analysis.md5_hash,

            "sha256_hash":
                analysis.sha256_hash,

            "file_entropy":
                (
                    float(
                        analysis.file_entropy
                    )
                    if analysis.file_entropy
                    is not None
                    else None
                ),

            "risk_score":
                (
                    float(
                        analysis.risk_score
                    )
                    if analysis.risk_score
                    is not None
                    else None
                ),

            "pe_features":
                analysis.pe_features,

            "strings":
                analysis.strings,

            "urls":
                analysis.urls,

            "metadata":
                analysis.file_metadata,

            "created_at":
                analysis.created_at
        }


        if analysis.ember_features:

            features = (
                analysis.ember_features
            )

            result["ember_features"] = {

                "feature_id":
                    features.feature_id,

                "created_at":
                    features.created_at
            }



            if features.prediction:

                prediction = (
                    features.prediction
                )

                result["prediction"] = {

                    "prediction_id":
                        prediction.prediction_id,

                    "model_name":
                        prediction.model_name,

                    "malware_family":
                        prediction.malware_family,

                    "prediction_label":
                        prediction.prediction_label,

                    "confidence":
                        (
                            float(
                                prediction.confidence
                            )
                            if prediction.confidence
                            is not None
                            else None
                        ),

                    "prediction_time":
                        prediction.prediction_time
                }



                for log in prediction.threat_logs:

                    threat_data = {

                        "log_id":
                            log.log_id,

                        "severity":
                            log.severity,

                        "status":
                            log.status,

                        "description":
                            log.description,

                        "created_at":
                            log.created_at,

                        "alerts":
                            []
                    }



                    for alert in log.alerts:

                        threat_data[
                            "alerts"
                        ].append({

                            "alert_id":
                                alert.alert_id,

                            "message":
                                alert.message,

                            "is_read":
                                alert.is_read,

                            "created_at":
                                alert.created_at
                        })

                    result[
                        "threat_logs"
                    ].append(
                        threat_data
                    )

    return result


@router.delete("/scans/{file_id}")
def delete_scan(
    file_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Soft-delete a scan while keeping its audit trail in PostgreSQL."""
    file_record = db.get(FileModel, file_id)
    if (
        not file_record
        or file_record.deleted_at is not None
        or (
            file_record.user_id != current_user.user_id
            and not is_administrator(current_user)
        )
    ):
        raise HTTPException(status_code=404, detail=f"File with ID {file_id} not found.")

    file_record.deleted_at = datetime.now(timezone.utc)
    file_record.status = "Deleted"
    db.commit()
    return {"status": "success", "message": "Scan soft-deleted successfully.", "file_id": file_id}
