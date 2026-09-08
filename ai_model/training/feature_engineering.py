import json
import numpy as np
from pathlib import Path


BASE_DIR = Path(__file__).resolve().parent.parent

TRAIN_FILE = BASE_DIR / "processed" / "train.jsonl"
TEST_FILE = BASE_DIR / "processed" / "test.jsonl"

OUTPUT_DIR = BASE_DIR / "processed"

TRAIN_FEATURES = OUTPUT_DIR / "X_train.npy"
TRAIN_LABELS = OUTPUT_DIR / "y_train.npy"

TEST_FEATURES = OUTPUT_DIR / "X_test.npy"
TEST_LABELS = OUTPUT_DIR / "y_test.npy"


def extract_features(record):
    """
    Convert one already-extracted EMBER JSON record
    into a numerical feature vector.
    """

    features = []

    # -------------------------
    # Histogram: 256 values
    # -------------------------
    histogram = record.get("histogram", [])
    features.extend(histogram)

    # -------------------------
    # Byte entropy: 256 values
    # -------------------------
    byteentropy = record.get("byteentropy", [])
    features.extend(byteentropy)

    # -------------------------
    # Strings features
    # -------------------------
    strings = record.get("strings", {})

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

    # Printable distribution
    printabledist = strings.get("printabledist", [])
    features.extend(printabledist)

    # -------------------------
    # General PE features
    # -------------------------
    general = record.get("general", {})

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

    return np.asarray(features, dtype=np.float32)


def process_file(input_file, output_name):

    print(f"\nProcessing {output_name}...")

    features = []
    labels = []

    with open(input_file, "r", encoding="utf-8") as file:

        for index, line in enumerate(file):

            if not line.strip():
                continue

            record = json.loads(line)

            vector = extract_features(record)

            features.append(vector)
            labels.append(record["label"])

            if (index + 1) % 1000 == 0:
                print(
                    f"Processed {index + 1:,} records..."
                )

    X = np.asarray(features, dtype=np.float32)
    y = np.asarray(labels, dtype=np.int8)

    print(f"\n{output_name} feature matrix:")
    print(f"Shape: {X.shape}")

    return X, y


def main():

    OUTPUT_DIR.mkdir(exist_ok=True)

    # Training
    X_train, y_train = process_file(
        TRAIN_FILE,
        "Training"
    )

    np.save(TRAIN_FEATURES, X_train)
    np.save(TRAIN_LABELS, y_train)

    print("\nTraining features saved.")

    # Testing
    X_test, y_test = process_file(
        TEST_FILE,
        "Testing"
    )

    np.save(TEST_FEATURES, X_test)
    np.save(TEST_LABELS, y_test)

    print("\nTesting features saved.")

    print("\n" + "=" * 50)
    print("FEATURE ENGINEERING COMPLETE")
    print("=" * 50)


if __name__ == "__main__":
    main()