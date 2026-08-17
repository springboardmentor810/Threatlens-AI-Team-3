import hashlib
import json
from pathlib import Path

from .feature_extractor import extract_features
from .predictor import Predictor
from .yara_scanner import scan_with_yara


class MalwareScanner:

    def __init__(self):
        self.predictor = Predictor()

    def scan(self, file_path):
        """
        Perform EMBER ML prediction and YARA scanning.

        This scanner is intended for Windows PE/executable files.
        """

        file_path = Path(file_path)

        # ---------------------------------------------------------
        # 1. Extract EMBER features
        # ---------------------------------------------------------
        features = extract_features(file_path)

        # ---------------------------------------------------------
        # 2. Run LightGBM prediction
        # ---------------------------------------------------------
        prediction, probability = self.predictor.predict(features)

        # ---------------------------------------------------------
        # 3. Run YARA
        # ---------------------------------------------------------
        yara_result = scan_with_yara(file_path)

        # ---------------------------------------------------------
        # 4. Determine verdict
        # ---------------------------------------------------------
        if prediction == 1:
            verdict = "MALWARE"
        else:
            verdict = "BENIGN"

        malware_prob = probability * 100
        benign_prob = (1 - probability) * 100

        # ---------------------------------------------------------
        # 5. Convert NumPy feature vector to normal Python list
        #    so PostgreSQL JSONB can store it.
        # ---------------------------------------------------------
        feature_vector = features.tolist()

        return {
            "engine": {
                "name": "EMBER Malware Detection Engine",
                "version": "1.0.0",
                "model": "LightGBM",
                "yara_enabled": True,
            },

            "file": self._file_metadata(file_path),

            "ml": {
                "prediction": verdict,
                "prediction_value": prediction,
                "malware_probability": round(malware_prob, 2),
                "benign_probability": round(benign_prob, 2),
                "risk_level": self._risk_level(probability),
            },

            "ember_features": feature_vector,

            "yara": yara_result,

            "scan_status": "SUCCESS",
        }

    def _risk_level(self, probability):

        if probability >= 0.90:
            return "CRITICAL"

        if probability >= 0.70:
            return "HIGH"

        if probability >= 0.40:
            return "MEDIUM"

        return "LOW"

    def _file_metadata(self, file_path):

        path = Path(file_path)

        try:
            size_bytes = path.stat().st_size
        except FileNotFoundError:
            size_bytes = None

        try:
            sha256 = hashlib.sha256(
                path.read_bytes()
            ).hexdigest()
        except Exception:
            sha256 = None

        return {
            "name": path.name,
            "sha256": sha256,
            "size_bytes": size_bytes,
        }

    def scan_json(self, file_path):
        return json.dumps(
            self.scan(file_path),
            indent=2
        )