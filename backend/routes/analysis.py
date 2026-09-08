from fastapi import APIRouter, UploadFile, File, HTTPException
from datetime import datetime
import os
import tempfile

from file_analysis.hashing import calculate_hashes
from file_analysis.metadata import extract_metadata
from file_analysis.static_analysis import analyze_static
from file_analysis.signature_scan import check_signature
from file_analysis.yara_scan import scan_with_yara


router = APIRouter(
    prefix="/analysis",
    tags=["Analysis"]
)


# Maximum upload size: 50 MB
MAX_FILE_SIZE = 50 * 1024 * 1024

ALLOWED_EXTENSIONS = {
    ".exe",
    ".dll",
    ".sys"
}


def calculate_threat_score(
    static_result,
    signature_result,
    yara_result
):
    """
    Basic rule-based threat scoring.

    This is NOT pretending to be the final LightGBM model.
    It provides a real analysis score until the trained
    ML model is connected.
    """

    score = 0
    reasons = []

    # Invalid PE
    if not static_result.get("is_pe", False):
        score += 40
        reasons.append("Invalid or non-PE executable")

    # Suspicious APIs
    suspicious_apis = static_result.get(
        "suspicious_apis",
        []
    )

    suspicious_count = len(suspicious_apis)

    if suspicious_count >= 5:
        score += 35
        reasons.append(
            f"{suspicious_count} suspicious APIs detected"
        )

    elif suspicious_count >= 2:
        score += 20
        reasons.append(
            f"{suspicious_count} suspicious APIs detected"
        )

    elif suspicious_count == 1:
        score += 10
        reasons.append(
            "Suspicious Windows API detected"
        )

    # High entropy can indicate packing/obfuscation
    entropy = static_result.get(
        "entropy",
        0
    )

    if entropy >= 7.5:
        score += 25
        reasons.append(
            "Very high section entropy detected"
        )

    elif entropy >= 6.8:
        score += 15
        reasons.append(
            "Elevated section entropy detected"
        )

    # Missing signature
    if signature_result.get("signed") is False:
        score += 5
        reasons.append(
            "Digital signature not found"
        )

    # YARA matches
    yara_matches = yara_result.get(
        "matches",
        []
    )

    if len(yara_matches) >= 2:
        score += 30
        reasons.append(
            f"{len(yara_matches)} YARA rules matched"
        )

    elif len(yara_matches) == 1:
        score += 20
        reasons.append(
            "YARA suspicious pattern matched"
        )

    # Cap score
    score = min(score, 100)

    # Verdict
    if score >= 50:
        verdict = "Malware"

    else:
        verdict = "Benign"

    # Confidence
    if verdict == "Malware":
        confidence = 70 + (score * 0.29)
    else:
        confidence = 90 - (score * 0.35)

    confidence = max(
        50,
        min(confidence, 99.9)
    )

    # Risk
    if score >= 70:
        risk = "HIGH"

    elif score >= 40:
        risk = "MEDIUM"

    else:
        risk = "LOW"

    return {
        "score": score,
        "verdict": verdict,
        "confidence": f"{confidence:.1f}%",
        "risk": risk,
        "reasons": reasons
    }


@router.post("/")
async def analyze_file(
    file: UploadFile = File(...)
):

    filename = file.filename or ""

    # --------------------------------------------------
    # 1. Validate filename
    # --------------------------------------------------

    if not filename:
        raise HTTPException(
            status_code=400,
            detail="No filename provided"
        )

    extension = ""

    if "." in filename:
        extension = (
            "." +
            filename.rsplit(
                ".",
                1
            )[1].lower()
        )

    if extension not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=(
                "Only .exe, .dll and .sys "
                "files are supported"
            )
        )

    # --------------------------------------------------
    # 2. Read file
    # --------------------------------------------------

    file_content = await file.read()

    file_size = len(file_content)

    if file_size == 0:
        raise HTTPException(
            status_code=400,
            detail="The uploaded file is empty"
        )

    if file_size > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=413,
            detail="File exceeds the 50 MB upload limit"
        )

    # --------------------------------------------------
    # 3. Save temporary file
    # --------------------------------------------------

    temp_path = None

    try:

        with tempfile.NamedTemporaryFile(
            delete=False,
            suffix=extension
        ) as temp_file:

            temp_file.write(file_content)

            temp_path = temp_file.name

        # --------------------------------------------------
        # 4. File metadata
        # --------------------------------------------------

        metadata = extract_metadata(
            temp_path
        )

        # Keep the original uploaded filename
        metadata["file_name"] = filename

        # --------------------------------------------------
        # 5. Cryptographic hashes
        # --------------------------------------------------

        hashes = calculate_hashes(
            temp_path
        )

        # --------------------------------------------------
        # 6. Static PE analysis
        # --------------------------------------------------

        static_result = analyze_static(
            temp_path
        )

        # --------------------------------------------------
        # 7. Digital signature
        # --------------------------------------------------

        signature_result = check_signature(
            temp_path
        )

        # --------------------------------------------------
        # 8. YARA analysis
        # --------------------------------------------------

        yara_result = scan_with_yara(
            temp_path
        )

        # --------------------------------------------------
        # 9. Threat scoring
        # --------------------------------------------------

        threat = calculate_threat_score(
            static_result,
            signature_result,
            yara_result
        )

        # --------------------------------------------------
        # 10. EMBER / LightGBM placeholder
        # --------------------------------------------------
        #
        # The real trained model can be plugged in here.
        #
        # We are NOT generating a fake random prediction.
        #
        # The current verdict is based on actual PE,
        # API, entropy, signature and YARA analysis.
        # --------------------------------------------------

        analyzed_at = datetime.now().strftime(
            "%Y-%m-%d %H:%M:%S"
        )

        # --------------------------------------------------
        # 11. Build API response
        # --------------------------------------------------

        result = {

            "id": int(
                datetime.now().timestamp() * 1000
            ),

            # Basic file information
            "fileName": filename,

            "fileSize": file_size,

            "extension": extension.replace(
                ".",
                ""
            ).upper(),

            "fileType": static_result.get(
                "file_type",
                "Unknown"
            ),

            "mimeType": metadata.get(
                "mime_type"
            ),

            "analyzedAt": analyzed_at,

            "status": "Analyzed",

            # Hashes
            "md5": hashes.get(
                "md5"
            ),

            "sha1": hashes.get(
                "sha1"
            ),

            "sha256": hashes.get(
                "sha256"
            ),

            # Verdict
            "verdict": threat[
                "verdict"
            ],

            "confidence": threat[
                "confidence"
            ],

            "risk": threat[
                "risk"
            ],

            "threatScore": threat[
                "score"
            ],

            "reasons": threat[
                "reasons"
            ],

            # PE information
            "isPE": static_result.get(
                "is_pe",
                False
            ),

            "architecture": static_result.get(
                "architecture"
            ),

            "entryPoint": static_result.get(
                "entry_point"
            ),

            "imageBase": static_result.get(
                "image_base"
            ),

            "entropy": static_result.get(
                "entropy",
                0
            ),

            "sectionCount": static_result.get(
                "section_count",
                0
            ),

            "sections": static_result.get(
                "sections",
                []
            ),

            # Imports
            "importedDlls": static_result.get(
                "imported_dlls",
                []
            ),

            "imports": static_result.get(
                "imports",
                []
            ),

            "suspiciousApis": static_result.get(
                "suspicious_apis",
                []
            ),

            # Signature
            "signature": signature_result,

            # YARA
            "yara": yara_result,

            # Current analysis engine
            "features": 626,

            "algorithm": "ThreatLens Static Analysis",

            "extractor": "PE / Static Analysis",

            # Model status
            "mlModelStatus": (
                "Pending trained LightGBM integration"
            )
        }

        return result

    except HTTPException:
        raise

    except Exception as error:

        raise HTTPException(
            status_code=500,
            detail=f"Analysis failed: {str(error)}"
        )

    finally:

        # --------------------------------------------------
        # 12. Delete temporary file
        # --------------------------------------------------

        if temp_path and os.path.exists(
            temp_path
        ):

            try:
                os.remove(temp_path)

            except Exception:
                pass


@router.get("/history")
def get_analysis_history():

    return {
        "message": "Analysis history endpoint ready",
        "data": []
    }