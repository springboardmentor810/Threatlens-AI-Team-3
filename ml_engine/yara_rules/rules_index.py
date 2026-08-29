from pathlib import Path

RULE_DIR = Path(__file__).resolve().parent / "yara"

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
