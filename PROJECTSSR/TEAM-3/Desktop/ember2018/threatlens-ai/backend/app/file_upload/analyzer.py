import hashlib
import uuid
import datetime
from pathlib import Path
from typing import Dict, Any


# ============================================================
# OPTIONAL YARA SCANNER
# ============================================================

try:
    from ml_engine.engine.yara_scanner import scan_with_yara

    HAS_YARA = True

except Exception as e:

    print("YARA scanner unavailable:", e)

    scan_with_yara = None
    HAS_YARA = False


# ============================================================
# FILE TYPE HELPERS
# ============================================================

EXECUTABLE_EXTENSIONS = {
    ".exe",
    ".dll",
    ".sys",
    ".scr",
    ".com",
    ".cpl",
    ".ocx",
}


def is_windows_executable(
    file_path: Path,
    file_bytes: bytes
) -> bool:
    """
    Determine whether the uploaded file should be treated
    as a Windows executable.

    Primary check:
        PE/MZ header

    Secondary check:
        Executable file extension.

    Returns:
        True  -> executable
        False -> non-executable
    """

    extension = file_path.suffix.lower()

    # --------------------------------------------------------
    # Real Windows PE files normally begin with MZ.
    # --------------------------------------------------------

    has_mz_header = file_bytes.startswith(b"MZ")

    # --------------------------------------------------------
    # Executable extension check.
    # --------------------------------------------------------

    has_executable_extension = (
        extension in EXECUTABLE_EXTENSIONS
    )

    # --------------------------------------------------------
    # Treat the file as executable when either:
    #
    # 1. It contains an MZ header, OR
    # 2. Its extension indicates a Windows executable.
    #
    # The actual PE validity is reported separately.
    # --------------------------------------------------------

    return (
        has_mz_header
        or has_executable_extension
    )


# ============================================================
# MAIN STATIC ANALYZER
# ============================================================

def run_basic_static_analysis(
    file_path: Path,
    filename: str,
    username: str
) -> Dict[str, Any]:
    """
    Perform basic static analysis on an uploaded file.

    Operations performed:

    1. Read file bytes
    2. Calculate MD5
    3. Calculate SHA-256
    4. Determine file size
    5. Determine file type
    6. Detect executable extensions
    7. Detect MZ/PE header
    8. Run optional YARA scanning
    9. Search for suspicious strings
    10. Calculate risk score
    11. Generate verdict
    12. Generate recommended action
    """

    # ========================================================
    # 1. READ FILE
    # ========================================================

    try:

        file_bytes = file_path.read_bytes()

    except Exception as e:

        raise RuntimeError(
            f"Unable to read file for static analysis: {e}"
        )

    if not file_bytes:

        raise ValueError(
            "Cannot analyze an empty file."
        )

    file_size = len(file_bytes)

    # ========================================================
    # 2. HASHING
    # ========================================================

    md5_hash = hashlib.md5(
        file_bytes
    ).hexdigest()

    sha256_hash = hashlib.sha256(
        file_bytes
    ).hexdigest()

    # ========================================================
    # 3. FILE EXTENSION
    # ========================================================

    extension = file_path.suffix.lower()

    # ========================================================
    # 4. WINDOWS EXECUTABLE DETECTION
    # ========================================================

    has_mz_header = file_bytes.startswith(
        b"MZ"
    )

    has_executable_extension = (
        extension in EXECUTABLE_EXTENSIONS
    )

    is_executable = (
        has_mz_header
        or has_executable_extension
    )

    # ========================================================
    # 5. FILE TYPE
    # ========================================================

    if is_executable:

        if extension:

            file_type = (
                f"Windows Executable ({extension})"
            )

        else:

            file_type = (
                "Windows Executable (PE)"
            )

    else:

        if extension:

            file_type = (
                f"File ({extension.upper()})"
            )

        else:

            file_type = "File (Binary)"

    # ========================================================
    # 6. BASIC PE VALIDATION
    # ========================================================

    pe_header_valid = False

    pe_header_error = None

    if has_mz_header:

        try:

            # ------------------------------------------------
            # DOS header contains e_lfanew at offset 0x3C.
            # It points to the PE header.
            # ------------------------------------------------

            if len(file_bytes) >= 0x40:

                pe_offset = int.from_bytes(
                    file_bytes[0x3C:0x40],
                    byteorder="little"
                )

                # --------------------------------------------
                # Verify PE signature.
                # --------------------------------------------

                if (
                    pe_offset + 4
                    <= len(file_bytes)
                ):

                    pe_signature = (
                        file_bytes[
                            pe_offset:
                            pe_offset + 4
                        ]
                    )

                    if pe_signature == b"PE\x00\x00":

                        pe_header_valid = True

        except Exception as e:

            pe_header_error = str(e)

    # ========================================================
    # 7. YARA SCANNING
    # ========================================================

    yara_matches = []

    if HAS_YARA and scan_with_yara:

        try:

            yara_result = scan_with_yara(
                str(file_path)
            )

            if yara_result:

                if yara_result.get(
                    "matched",
                    False
                ):

                    yara_matches = (
                        yara_result.get(
                            "matched_rules",
                            []
                        )
                    )

        except Exception as e:

            print(
                "YARA scan failed:",
                e
            )

            yara_matches = []

    # ========================================================
    # 8. BASIC STRING INDICATORS
    # ========================================================

    suspicious_indicators = []

    content_lower = file_bytes.lower()

    # --------------------------------------------------------
    # PowerShell
    # --------------------------------------------------------

    if (
        b"powershell" in content_lower
        or b"powershell.exe" in content_lower
    ):

        suspicious_indicators.append(
            "PowerShell execution string found"
        )

    # --------------------------------------------------------
    # Command shell
    # --------------------------------------------------------

    if (
        b"cmd.exe" in content_lower
        or b"command.com" in content_lower
    ):

        suspicious_indicators.append(
            "Command shell execution string found"
        )

    # --------------------------------------------------------
    # Ransomware-related commands
    # --------------------------------------------------------

    if (
        b"vssadmin" in content_lower
        or b"bcdedit" in content_lower
    ):

        suspicious_indicators.append(
            "Ransomware shadow copy removal string found"
        )

    # --------------------------------------------------------
    # Network URLs
    # --------------------------------------------------------

    if (
        b"http://" in content_lower
        or b"https://" in content_lower
    ):

        suspicious_indicators.append(
            "Embedded remote network URL found"
        )

    # --------------------------------------------------------
    # Download utilities
    # --------------------------------------------------------

    if (
        b"bitsadmin" in content_lower
        or b"certutil" in content_lower
        or b"wget" in content_lower
        or b"curl" in content_lower
    ):

        suspicious_indicators.append(
            "File download utility string found"
        )

    # --------------------------------------------------------
    # Common Windows scripting indicators
    # --------------------------------------------------------

    if (
        b"wscript" in content_lower
        or b"cscript" in content_lower
        or b"mshta" in content_lower
    ):

        suspicious_indicators.append(
            "Windows scripting execution string found"
        )

    # ========================================================
    # 9. RISK SCORING
    # ========================================================

    risk_score = 15

    verdict = "BENIGN"

    # --------------------------------------------------------
    # Strong indicators
    # --------------------------------------------------------

    if yara_matches:

        risk_score = 85

        verdict = "MALWARE"

    elif len(suspicious_indicators) >= 2:

        risk_score = 85

        verdict = "MALWARE"

    # --------------------------------------------------------
    # Executable + suspicious indicator
    # --------------------------------------------------------

    elif (
        is_executable
        and len(suspicious_indicators) >= 1
    ):

        risk_score = 65

        verdict = "SUSPICIOUS"

    # --------------------------------------------------------
    # Executable without suspicious strings
    #
    # Important:
    # A .exe file is not automatically malware.
    # --------------------------------------------------------

    elif is_executable:

        risk_score = 50

        verdict = "SUSPICIOUS"

    # --------------------------------------------------------
    # One suspicious indicator
    # --------------------------------------------------------

    elif len(suspicious_indicators) == 1:

        risk_score = 50

        verdict = "SUSPICIOUS"

    # --------------------------------------------------------
    # Otherwise benign
    # --------------------------------------------------------

    else:

        risk_score = 15

        verdict = "BENIGN"

    # ========================================================
    # 10. RECOMMENDED ACTION
    # ========================================================

    if risk_score >= 85:

        recommended_action = (
            "Quarantine File"
        )

    elif risk_score >= 50:

        recommended_action = (
            "Review File"
        )

    else:

        recommended_action = (
            "Allow Execution"
        )

    # ========================================================
    # 11. SCAN ID
    # ========================================================

    scan_id = (
        f"SCAN-{uuid.uuid4().hex[:6].upper()}"
    )

    # ========================================================
    # 12. TIMESTAMP
    # ========================================================

    now_str = (
        datetime.datetime.now().strftime(
            "%Y-%m-%d %H:%M:%S"
        )
    )

    # ========================================================
    # 13. RETURN ANALYSIS RESULT
    # ========================================================

    return {

        "scan_id":
            scan_id,

        "filename":
            filename,

        "file_size":
            file_size,

        "file_type":
            file_type,

        "hashes": {

            "md5":
                md5_hash,

            "sha256":
                sha256_hash
        },

        "static_analysis": {

            "yara_matches":
                yara_matches,

            "suspicious_indicators":
                suspicious_indicators,

            "is_executable":
                is_executable,

            "has_mz_header":
                has_mz_header,

            "pe_header_valid":
                pe_header_valid,

            "pe_header_error":
                pe_header_error
        },

        "detection": {

            "risk_score":
                risk_score,

            "verdict":
                verdict,

            "recommended_action":
                recommended_action
        },

        "uploaded_by":
            username,

        "timestamp":
            now_str
    }