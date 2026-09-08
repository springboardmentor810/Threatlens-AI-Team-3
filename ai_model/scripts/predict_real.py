import os
import numpy as np
import lightgbm as lgb

from real_extractor import extract_626_features


MODEL_PATH = os.path.join(
    os.path.dirname(os.path.dirname(__file__)),
    "saved_models",
    "threatlens_lgbm.txt"
)


def predict(file_path):

    if not os.path.isfile(file_path):
        print("\nERROR: File not found.")
        return

    print("\nLoading ThreatLens model...")

    model = lgb.Booster(model_file=MODEL_PATH)

    print("Model loaded.")
    print(f"Model expects: {model.num_feature()} features")

    features = extract_626_features(file_path)

    X = features.reshape(1, -1)

    print("\nRunning prediction...")

    probability = float(model.predict(X)[0])

    if probability >= 0.5:
        result = "MALWARE"
        confidence = probability
    else:
        result = "BENIGN"
        confidence = 1 - probability

    if confidence >= 0.90:
        risk = "HIGH"
    elif confidence >= 0.75:
        risk = "MEDIUM"
    else:
        risk = "LOW"

    print("\n" + "=" * 55)
    print("              THREATLENS ANALYSIS")
    print("=" * 55)

    print(f"File       : {os.path.basename(file_path)}")
    print(f"Prediction : {result}")
    print(f"Malware %  : {probability * 100:.2f}%")
    print(f"Confidence : {confidence * 100:.2f}%")
    print(f"Risk Level : {risk}")

    print("=" * 55)


if __name__ == "__main__":

    print("\n" + "=" * 55)
    print("                 THREATLENS AI")
    print("            Malware Detection System")
    print("=" * 55)

    file_path = input("\nEnter the full path of an EXE file: ").strip().strip('"')

    try:
        predict(file_path)

    except Exception as e:
        print("\nERROR during analysis:")
        print(e)