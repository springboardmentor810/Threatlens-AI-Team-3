import sys
import numpy as np
import lightgbm as lgb
from pathlib import Path
from ember.features import PEFeatureExtractor


BASE_DIR = Path(__file__).resolve().parent.parent

MODEL_FILE = BASE_DIR / "saved_models" / "threatlens_lgbm.txt"


def extract_exe_features(exe_path):
    """Extract EMBER features from a real PE/EXE file."""

    print("Extracting EMBER features...")

    with open(exe_path, "rb") as f:
        raw_bytes = f.read()

    extractor = PEFeatureExtractor(
        feature_version=2
    )

    features = extractor.feature_vector(raw_bytes)

    features = np.asarray(
        features,
        dtype=np.float32
    )

    print(f"Extracted features: {features.shape}")

    return features


def predict(exe_path):

    # Load trained model
    print("Loading ThreatLens model...")

    model = lgb.Booster(
        model_file=str(MODEL_FILE)
    )

    # Extract features
    features = extract_exe_features(exe_path)

    # Make sure the feature count matches training
    if features.shape[0] != 626:
        raise ValueError(
            f"Feature mismatch! "
            f"Expected 626 features, "
            f"but got {features.shape[0]}"
        )

    # Convert into one-row matrix
    X = features.reshape(1, -1)

    # Get malware probability
    probability = float(
        model.predict(X)[0]
    )

    if probability >= 0.5:
        prediction = "MALWARE"
    else:
        prediction = "BENIGN"

    return prediction, probability


def main():

    if len(sys.argv) < 2:

        print(
            "Usage:"
        )

        print(
            "python .\\scripts\\predict.py <path_to_exe>"
        )

        return

    exe_path = Path(sys.argv[1])

    if not exe_path.exists():

        print(
            f"ERROR: File not found:\n{exe_path}"
        )

        return

    if not MODEL_FILE.exists():

        print(
            f"ERROR: Model not found:\n{MODEL_FILE}"
        )

        return

    print("\n" + "=" * 55)
    print("THREATLENS AI - FILE ANALYSIS")
    print("=" * 55)

    print(f"\nFile: {exe_path.name}")
    print(f"Size: {exe_path.stat().st_size / 1024:.2f} KB")

    try:

        prediction, probability = predict(
            exe_path
        )

        print("\n" + "=" * 55)
        print("RESULT")
        print("=" * 55)

        print(
            f"\nPrediction: {prediction}"
        )

        print(
            f"Malware probability: "
            f"{probability * 100:.2f}%"
        )

        print(
            f"Benign probability: "
            f"{(1 - probability) * 100:.2f}%"
        )

        print("\n" + "=" * 55)

    except Exception as e:

        print(
            f"\nERROR during analysis:\n{e}"
        )


if __name__ == "__main__":
    main()