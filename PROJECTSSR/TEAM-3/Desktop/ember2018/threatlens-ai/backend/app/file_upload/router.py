import sys
import uuid
from pathlib import Path

from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from app.config import UPLOAD_DIR
from app.database import get_db

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


# =============================================================
# PROJECT ROOT / ML ENGINE IMPORT
# =============================================================

PROJECT_ROOT = Path(__file__).resolve().parents[3]

if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))


# =============================================================
# EMBER ML ENGINE
# =============================================================

try:
    from ml_engine.engine.scanner import MalwareScanner

    ML_ENGINE_AVAILABLE = True

except Exception as e:

    print("EMBER ML engine import failed:", e)

    MalwareScanner = None
    ML_ENGINE_AVAILABLE = False


# =============================================================
# ROUTER
# =============================================================

router = APIRouter(
    prefix="/api/upload",
    tags=["File Upload & Static File Analysis"]
)


# =============================================================
# INITIALIZE ML SCANNER
# =============================================================

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


# =============================================================
# HELPER: FIND EXISTING FILE
# =============================================================

def find_existing_file(
    db: Session,
    file_hash: str
):
    """
    Search PostgreSQL for an existing file
    using SHA-256 hash.
    """

    return (
        db.query(FileModel)
        .filter(
            FileModel.file_hash == file_hash
        )
        .first()
    )


# =============================================================
# HELPER: SAVE BASIC ANALYSIS
# =============================================================

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


# =============================================================
# HELPER: DELETE TEMPORARY FILE
# =============================================================

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


# =============================================================
# HELPER: BUILD DUPLICATE RESPONSE
# =============================================================

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


    # =========================================================
    # STATIC ANALYSIS
    # =========================================================

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


        # =====================================================
        # EMBER FEATURES
        # =====================================================

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


            # =================================================
            # PREDICTION
            # =================================================

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


                # =============================================
                # THREAT LOGS
                # =============================================

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


                    # =========================================
                    # ALERTS
                    # =========================================

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


# =============================================================
# POST /api/upload/scan
# =============================================================

@router.post("/scan")
async def scan_file(
    file: UploadFile = File(...),
    username: str = "analyst_demo",
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

    # =========================================================
    # 1. VALIDATE FILE NAME
    # =========================================================

    if not file.filename:

        raise HTTPException(
            status_code=400,
            detail="Filename cannot be empty."
        )

    original_filename = file.filename


    # =========================================================
    # 2. FIND USER
    # =========================================================

    user = (
        db.query(User)
        .filter(
            User.name == username
        )
        .first()
    )

    if not user:

        raise HTTPException(
            status_code=404,
            detail=f"User '{username}' not found."
        )


    # =========================================================
    # 3. READ FILE
    # =========================================================

    try:

        file_bytes = await file.read()

        if not file_bytes:

            raise HTTPException(
                status_code=400,
                detail="Uploaded file is empty."
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


    # =========================================================
    # 4. CREATE TEMPORARY FILE NAME
    # =========================================================

    saved_filename = (
        f"{uuid.uuid4().hex[:6]}_{original_filename}"
    )

    file_path = UPLOAD_DIR / saved_filename


    # =========================================================
    # 5. SAVE PHYSICAL FILE
    # =========================================================

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


    # =========================================================
    # 6. BASIC STATIC ANALYSIS
    # =========================================================

    try:

        result = run_basic_static_analysis(
            file_path,
            original_filename,
            username
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


    # =========================================================
    # 7. EXTRACT HASHES
    # =========================================================

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


    # =========================================================
    # 8. CHECK DUPLICATE FILE
    # =========================================================

    existing_file = find_existing_file(
        db,
        sha256_hash
    )


    # =========================================================
    # 8A. DUPLICATE FILE FOUND
    # =========================================================

    if existing_file:

        existing_analysis = (
            existing_file.static_analysis
        )


        # =====================================================
        # RESTORE MISSING STATIC ANALYSIS
        # =====================================================

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
                            username,

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


        # =====================================================
        # DELETE TEMPORARY DUPLICATE FILE
        # =====================================================

        delete_temp_file(
            file_path
        )


        # =====================================================
        # RETURN COMPLETE EXISTING RECORD
        # =====================================================

        return build_duplicate_response(
            existing_file
        )


    # =========================================================
    # 9. EXTRACT STATIC DATA
    # =========================================================

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


    # =========================================================
    # 10. CREATE FILE RECORD
    # =========================================================

    new_file = FileModel(

        user_id=user.user_id,

        filename=result["filename"],

        file_hash=sha256_hash,

        file_size=result["file_size"],

        file_type=result["file_type"],

        status="Analysis Completed"
    )


    # =========================================================
    # 11. CREATE STATIC ANALYSIS
    # =========================================================

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
                username,

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


    # =========================================================
    # 12. INITIALIZE EMBER VARIABLES
    # =========================================================

    ember_result = None

    new_features = None

    new_prediction = None

    new_threat_log = None

    new_alert = None


    # =========================================================
    # 13. RUN EMBER ML
    # =========================================================

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


            # -------------------------------------------------
            # RUN SCANNER
            # -------------------------------------------------

            ember_result = (
                malware_scanner.scan(
                    file_path
                )
            )


            # -------------------------------------------------
            # EXTRACT ML DATA
            # -------------------------------------------------

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


            # -------------------------------------------------
            # EXTRACT EMBER FEATURES
            # -------------------------------------------------

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


            # -------------------------------------------------
            # CREATE EMBER FEATURES
            # -------------------------------------------------

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


            # -------------------------------------------------
            # CREATE PREDICTION
            # -------------------------------------------------

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


            # -------------------------------------------------
            # CREATE THREAT LOG
            # -------------------------------------------------

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


                # ---------------------------------------------
                # CREATE ALERT
                # ---------------------------------------------

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


            # -------------------------------------------------
            # ADD DATABASE OBJECTS
            # -------------------------------------------------

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


            # -------------------------------------------------
            # COMMIT
            # -------------------------------------------------

            try:

                db.commit()

            except IntegrityError:

                db.rollback()

                duplicate_file = (
                    find_existing_file(
                        db,
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


            # -------------------------------------------------
            # REFRESH
            # -------------------------------------------------

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


            # -------------------------------------------------
            # SAVE BASIC ANALYSIS
            # -------------------------------------------------

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


    # =========================================================
    # 14. NON-EXECUTABLE / ML UNAVAILABLE
    # =========================================================

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


    # =========================================================
    # 15. DELETE TEMPORARY FILE
    # =========================================================

    delete_temp_file(
        file_path
    )


    # =========================================================
    # 16. BUILD SUCCESS RESPONSE
    # =========================================================

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


    # =========================================================
    # 17. PREDICTION RESPONSE
    # =========================================================

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


    # =========================================================
    # 18. THREAT RESPONSE
    # =========================================================

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


    # =========================================================
    # 19. ALERT RESPONSE
    # =========================================================

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


    # =========================================================
    # 20. RETURN SUCCESS
    # =========================================================

    return response


# =============================================================
# GET ALL FILE SCANS
# =============================================================

@router.get("/scans")
def list_scans(
    db: Session = Depends(get_db)
):
    """
    Retrieve all uploaded file scans.
    """

    files = (
        db.query(FileModel)
        .order_by(
            FileModel.upload_time.desc()
        )
        .all()
    )

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


# =============================================================
# GET COMPLETE ANALYSIS FOR ONE FILE
# =============================================================

@router.get("/scans/{file_id}")
def get_scan_details(
    file_id: int,
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

    if not file_record:

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


    # =========================================================
    # STATIC ANALYSIS
    # =========================================================

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


        # =====================================================
        # EMBER FEATURES
        # =====================================================

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


            # =================================================
            # PREDICTION
            # =================================================

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


                # =================================================
                # THREAT LOGS
                # =================================================

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


                    # =============================================
                    # ALERTS
                    # =============================================

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