import sys
import hashlib
import numpy as np
from ember.features import PEFeatureExtractor


def extract_626_features(file_path):
    print(f"Analyzing: {file_path}")

    # Read the actual EXE
    with open(file_path, "rb") as f:
        bytez = f.read()

    print(f"File size: {len(bytez):,} bytes")

    # Use the real EMBER v2 extractor
    extractor = PEFeatureExtractor(2)

    raw = extractor.raw_features(bytez)

    # -------------------------
    # 256 Histogram features
    # -------------------------
    features = []

    histogram = raw["histogram"]
    features.extend(histogram)

    # -------------------------
    # 256 Byte-entropy features
    # -------------------------
    byteentropy = raw["byteentropy"]
    features.extend(byteentropy)

    # -------------------------
    # 8 String features
    # -------------------------
    strings = raw["strings"]

    features.extend([
        strings.get("numstrings", 0),
        strings.get("avlength", 0),
        strings.get("printables", 0),
        strings.get("entropy", 0),
        strings.get("paths", 0),
        strings.get("urls", 0),
        strings.get("registry", 0),
        strings.get("MZ", 0),
    ])

    # -------------------------
    # 96 Printable distribution
    # -------------------------
    printabledist = strings.get("printabledist", [])
    features.extend(printabledist)

    # -------------------------
    # 10 General PE features
    # -------------------------
    general = raw["general"]

    features.extend([
        general.get("size", 0),
        general.get("vsize", 0),
        general.get("has_debug", 0),
        general.get("exports", 0),
        general.get("imports", 0),
        general.get("has_relocations", 0),
        general.get("has_resources", 0),
        general.get("has_signature", 0),
        general.get("has_tls", 0),
        general.get("symbols", 0),
    ])

    vector = np.asarray(features, dtype=np.float32)

    print(f"Feature vector shape: {vector.shape}")
    print(f"Feature count: {len(vector)}")

    if len(vector) != 626:
        raise ValueError(
            f"Expected 626 features, but got {len(vector)}"
        )

    return vector


if __name__ == "__main__":

    if len(sys.argv) != 2:
        print("Usage:")
        print("python real_extractor.py <path_to_exe>")
        sys.exit(1)

    file_path = sys.argv[1]

    try:
        vector = extract_626_features(file_path)

        print("\nSUCCESS")
        print("626 EMBER-compatible features extracted.")

    except Exception as e:
        print("\nERROR during extraction:")
        print(e)
        sys.exit(1)