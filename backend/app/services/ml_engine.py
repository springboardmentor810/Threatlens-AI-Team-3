import os
import time
import random
from typing import Dict, Any, Tuple

try:
    import joblib
    import numpy as np
    import pandas as pd
    from sklearn.ensemble import RandomForestClassifier
    from sklearn.preprocessing import StandardScaler
    HAS_SKLEARN = True
except ImportError:
    HAS_SKLEARN = False

from app.core.config import settings

MALWARE_FAMILIES = {
    "Clean": ["Clean.Standard", "Clean.SystemFile", "Clean.Installer"],
    "Ransomware": ["WannaCry", "LockBit", "REvil", "Ryuk"],
    "Trojan": ["AgentTesla", "Emotet", "TrickBot", "Qakbot"],
    "Spyware": ["Pegasus", "FinSpy", "KeyLogger.Generic"],
    "Worm": ["Mirai", "Conficker", "Stuxnet"],
    "Adware": ["Adware.Generic", "PopUpGenie", "BrowserHijacker"]
}

class MLClassificationEngine:
    def __init__(self, model_path: str = None):
        self.model_path = model_path or settings.MODEL_PATH
        self.model = None
        self.scaler = None
        self.classes = ["Clean", "Ransomware", "Trojan", "Spyware", "Worm", "Adware"]
        if HAS_SKLEARN:
            self.load_model()

    def extract_feature_vector(self, static_report: Dict[str, Any]):
        """Extract numeric features from static analysis output."""
        file_size = static_report.get("file_size", 0)
        entropy = static_report.get("entropy", 0.0)
        
        pe_header = static_report.get("pe_header", {})
        pe_sections_count = len(pe_header.get("sections", []))
        suspicious_imports_count = len(pe_header.get("suspicious_imports", []))
        is_pe = 1 if pe_header.get("is_pe", False) else 0

        iocs = static_report.get("iocs", {})
        urls_found_count = len(iocs.get("urls", []))
        ips_found_count = len(iocs.get("ips", []))

        yara_matches_count = len(static_report.get("yara_matches", []))
        total_strings_count = static_report.get("total_strings_count", 0)

        filename = static_report.get("filename", "").lower()
        has_suspicious_ext = 1 if any(filename.endswith(ext) for ext in [".exe", ".scr", ".vbs", ".dll", ".ps1", ".bat", ".php"]) else 0

        features = [
            file_size,
            entropy,
            pe_sections_count,
            suspicious_imports_count,
            urls_found_count,
            ips_found_count,
            yara_matches_count,
            is_pe,
            total_strings_count,
            has_suspicious_ext
        ]
        if HAS_SKLEARN:
            return np.array(features, dtype=np.float32).reshape(1, -1)
        return features

    def train_synthetic_model(self, save_path: str = None):
        """Train a Random Forest classifier on synthetic malware dataset for demo."""
        if not HAS_SKLEARN:
            return
        save_path = save_path or self.model_path
        os.makedirs(os.path.dirname(save_path), exist_ok=True)

        np.random.seed(42)
        n_samples_per_class = 200

        data = []
        labels = []

        for class_idx, label in enumerate(self.classes):
            for _ in range(n_samples_per_class):
                if label == "Clean":
                    file_size = np.random.randint(10000, 5000000)
                    entropy = np.random.uniform(2.5, 5.8)
                    pe_sections = np.random.randint(2, 5)
                    susp_imports = np.random.choice([0, 1], p=[0.95, 0.05])
                    urls = np.random.randint(0, 3)
                    ips = np.random.randint(0, 2)
                    yara = 0
                    is_pe = np.random.choice([0, 1])
                    strings = np.random.randint(20, 300)
                    susp_ext = np.random.choice([0, 1], p=[0.8, 0.2])
                elif label == "Ransomware":
                    file_size = np.random.randint(50000, 2000000)
                    entropy = np.random.uniform(6.8, 7.99)
                    pe_sections = np.random.randint(4, 9)
                    susp_imports = np.random.randint(3, 10)
                    urls = np.random.randint(1, 10)
                    ips = np.random.randint(0, 5)
                    yara = np.random.randint(1, 4)
                    is_pe = 1
                    strings = np.random.randint(50, 400)
                    susp_ext = 1
                elif label == "Trojan":
                    file_size = np.random.randint(100000, 10000000)
                    entropy = np.random.uniform(5.5, 7.5)
                    pe_sections = np.random.randint(3, 8)
                    susp_imports = np.random.randint(2, 8)
                    urls = np.random.randint(3, 15)
                    ips = np.random.randint(1, 8)
                    yara = np.random.randint(1, 3)
                    is_pe = 1
                    strings = np.random.randint(100, 600)
                    susp_ext = 1
                elif label == "Spyware":
                    file_size = np.random.randint(30000, 800000)
                    entropy = np.random.uniform(4.8, 6.9)
                    pe_sections = np.random.randint(2, 6)
                    susp_imports = np.random.randint(2, 6)
                    urls = np.random.randint(2, 8)
                    ips = np.random.randint(1, 5)
                    yara = np.random.randint(1, 3)
                    is_pe = 1
                    strings = np.random.randint(80, 500)
                    susp_ext = 1
                elif label == "Worm":
                    file_size = np.random.randint(20000, 500000)
                    entropy = np.random.uniform(5.0, 7.0)
                    pe_sections = np.random.randint(3, 7)
                    susp_imports = np.random.randint(2, 7)
                    urls = np.random.randint(4, 20)
                    ips = np.random.randint(3, 15)
                    yara = np.random.randint(1, 3)
                    is_pe = 1
                    strings = np.random.randint(50, 400)
                    susp_ext = 1
                else:  # Adware
                    file_size = np.random.randint(100000, 3000000)
                    entropy = np.random.uniform(4.0, 6.2)
                    pe_sections = np.random.randint(2, 5)
                    susp_imports = np.random.randint(0, 3)
                    urls = np.random.randint(5, 30)
                    ips = np.random.randint(1, 6)
                    yara = np.random.choice([0, 1])
                    is_pe = 1
                    strings = np.random.randint(150, 800)
                    susp_ext = 1

                data.append([file_size, entropy, pe_sections, susp_imports, urls, ips, yara, is_pe, strings, susp_ext])
                labels.append(class_idx)

        X = np.array(data, dtype=np.float32)
        y = np.array(labels, dtype=np.int32)

        scaler = StandardScaler()
        X_scaled = scaler.fit_transform(X)

        clf = RandomForestClassifier(n_estimators=100, random_state=42)
        clf.fit(X_scaled, y)

        joblib.dump({"model": clf, "scaler": scaler, "classes": self.classes}, save_path)
        self.model = clf
        self.scaler = scaler

    def load_model(self):
        if not HAS_SKLEARN:
            return
        if os.path.exists(self.model_path):
            try:
                artifacts = joblib.load(self.model_path)
                self.model = artifacts["model"]
                self.scaler = artifacts["scaler"]
                self.classes = artifacts["classes"]
            except Exception:
                self.train_synthetic_model()
        else:
            self.train_synthetic_model()

    def predict(self, static_report: Dict[str, Any]) -> Tuple[str, str, float, float]:
        """Runs model inference and returns (label, family, confidence, execution_time_ms)."""
        start_time = time.time()
        
        if HAS_SKLEARN and self.model is not None and self.scaler is not None:
            features = self.extract_feature_vector(static_report)
            scaled_features = self.scaler.transform(features)
            probs = self.model.predict_proba(scaled_features)[0]
            max_idx = int(np.argmax(probs))
            predicted_label = self.classes[max_idx]
            confidence = float(probs[max_idx])
        else:
            # Standalone rule heuristic calculation
            yara_count = len(static_report.get("yara_matches", []))
            entropy = static_report.get("entropy", 0.0)
            susp_imports = len(static_report.get("pe_header", {}).get("suspicious_imports", []))
            
            if yara_count > 0 or entropy > 7.0:
                if any("ransom" in str(m).lower() for m in static_report.get("yara_matches", [])) or entropy > 7.2:
                    predicted_label = "Ransomware"
                    confidence = 0.94
                else:
                    predicted_label = "Trojan"
                    confidence = 0.86
            elif susp_imports > 2:
                predicted_label = "Spyware"
                confidence = 0.78
            else:
                predicted_label = "Clean"
                confidence = 0.95

        families = MALWARE_FAMILIES.get(predicted_label, ["Generic"])
        malware_family = random.choice(families)

        execution_time_ms = round((time.time() - start_time) * 1000, 2)
        return predicted_label, malware_family, confidence, execution_time_ms

    def calculate_risk_score(self, static_report: Dict[str, Any], predicted_label: str, confidence: float) -> int:
        """Composite 0-100 risk score calculator."""
        score = 0.0

        if predicted_label != "Clean":
            score += confidence * 40.0
        else:
            score += (1.0 - confidence) * 15.0

        yara_matches = len(static_report.get("yara_matches", []))
        score += min(yara_matches * 15.0, 30.0)

        susp_imports = len(static_report.get("pe_header", {}).get("suspicious_imports", []))
        score += min(susp_imports * 3.0, 15.0)

        iocs = static_report.get("iocs", {})
        urls = len(iocs.get("urls", []))
        ips = len(iocs.get("ips", []))
        score += min((urls + ips) * 2.0, 10.0)

        entropy = static_report.get("entropy", 0.0)
        if entropy > 7.0:
            score += 5.0

        final_risk = int(round(min(max(score, 0.0), 100.0)))
        return final_risk

ml_engine = MLClassificationEngine()
