import numpy as np
import lightgbm as lgb
from pathlib import Path
from sklearn.metrics import (
    accuracy_score,
    classification_report,
    confusion_matrix
)


BASE_DIR = Path(__file__).resolve().parent.parent

X_TRAIN_FILE = BASE_DIR / "processed" / "X_train.npy"
Y_TRAIN_FILE = BASE_DIR / "processed" / "y_train.npy"

X_TEST_FILE = BASE_DIR / "processed" / "X_test.npy"
Y_TEST_FILE = BASE_DIR / "processed" / "y_test.npy"

MODEL_DIR = BASE_DIR / "saved_models"
MODEL_FILE = MODEL_DIR / "threatlens_lgbm.txt"


def main():

    print("=" * 55)
    print("THREATLENS AI - MODEL TRAINING")
    print("=" * 55)

    # -------------------------
    # Load data
    # -------------------------

    print("\nLoading training data...")

    X_train = np.load(X_TRAIN_FILE)
    y_train = np.load(Y_TRAIN_FILE)

    print(f"X_train shape: {X_train.shape}")
    print(f"y_train shape: {y_train.shape}")

    print("\nLoading testing data...")

    X_test = np.load(X_TEST_FILE)
    y_test = np.load(Y_TEST_FILE)

    print(f"X_test shape: {X_test.shape}")
    print(f"y_test shape: {y_test.shape}")

    # -------------------------
    # Create LightGBM model
    # -------------------------

    print("\nCreating LightGBM classifier...")

    model = lgb.LGBMClassifier(
        objective="binary",
        n_estimators=200,
        learning_rate=0.05,
        num_leaves=31,
        max_depth=-1,
        subsample=0.8,
        colsample_bytree=0.8,
        random_state=42,
        n_jobs=4
    )

    # -------------------------
    # Train
    # -------------------------

    print("\nStarting training...")
    print("Please wait...")

    model.fit(
        X_train,
        y_train
    )

    print("\nTraining completed.")

    # -------------------------
    # Predictions
    # -------------------------

    print("\nEvaluating model...")

    predictions = model.predict(X_test)

    accuracy = accuracy_score(
        y_test,
        predictions
    )

    print(
        f"\nAccuracy: {accuracy * 100:.2f}%"
    )

    print("\nClassification Report:")
    print(
        classification_report(
            y_test,
            predictions,
            target_names=[
                "Benign",
                "Malware"
            ]
        )
    )

    print("Confusion Matrix:")

    print(
        confusion_matrix(
            y_test,
            predictions
        )
    )

    # -------------------------
    # Save model
    # -------------------------

    MODEL_DIR.mkdir(
        parents=True,
        exist_ok=True
    )

    model.booster_.save_model(
        str(MODEL_FILE)
    )

    print(
        f"\nModel saved to:\n{MODEL_FILE}"
    )

    print("\n" + "=" * 55)
    print("THREATLENS MODEL TRAINING COMPLETE")
    print("=" * 55)


if __name__ == "__main__":
    main()