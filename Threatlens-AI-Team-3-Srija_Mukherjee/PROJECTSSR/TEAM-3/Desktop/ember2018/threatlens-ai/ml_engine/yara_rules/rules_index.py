from pathlib import Path


# Directory containing this file:
# ml_engine/yara_rules/
BASE_DIR = Path(__file__).resolve().parent

# YARA rules directory:
# ml_engine/yara_rules/yara/
RULE_DIR = BASE_DIR / "yara"


RULE_FILES = sorted(
    str(file)
    for file in RULE_DIR.glob("*.yar")
)

RULE_FILES.extend(
    sorted(
        str(file)
        for file in RULE_DIR.glob("*.yara")
    )
)