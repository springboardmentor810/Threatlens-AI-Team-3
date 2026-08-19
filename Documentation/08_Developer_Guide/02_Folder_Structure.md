# Folder Structure

## Introduction

The ThreatLens AI project follows a modular architecture where the Machine Learning Engine is the primary implementation completed in the current milestone. The Backend and Frontend directories are prepared for future integration as development progresses.

---

# Project Structure

```text
threatlens-ai/
│
├── backend/
│   ├── Dockerfile
│   ├── README.md
│   └── requirements.txt
│
├── frontend/
│   └── README.md
│
├── ml_engine/
│   │
│   ├── engine/
│   │   ├── __init__.py
│   │   ├── feature_extractor.py
│   │   ├── predictor.py
│   │   ├── scanner.py
│   │   └── yara_scanner.py
│   │
│   ├── model/
│   │   ├── lightgbm_model_v1.0.pkl
│   │   └── metadata.json
│   │
│   ├── training/
│   │   ├── build_dataset.py
│   │   ├── evaluate_model.py
│   │   ├── feature_importance.py
│   │   ├── merge_train.py
│   │   ├── remove_unlabeled.py
│   │   ├── train_lightgbm.py
│   │   ├── validate_dataset.py
│   │   └── verify_dataset.py
│   │
│   ├── tests/
│   │   ├── test_feature_extractor.py
│   │   ├── test_model.py
│   │   └── test_scanner.py
│   │
│   ├── yara_rules/
│   │   └── yara/
│   │       ├── __init__.py
│   │       └── rules_index.py
│   │
│   ├── API_DOCUMENTATION.md
│   ├── README.md
│   ├── requirements.txt
│   └── __init__.py
│
├── docker-compose.yml
├── README.md
└── .gitignore
```

---

# Folder Description

## backend/

Contains the initial backend setup for future API development.

**Files**
- Dockerfile
- README.md
- requirements.txt

---

## frontend/

Contains the initial frontend setup for future React-based user interface development.

**Files**
- README.md

---

## ml_engine/

Core module responsible for malware detection and machine learning operations.

---

### engine/

Implements the malware scanning workflow.

**Files**

- feature_extractor.py
- predictor.py
- scanner.py
- yara_scanner.py

**Responsibilities**

- Feature Extraction
- Malware Prediction
- File Scanning
- YARA Rule Matching

---

### model/

Stores trained machine learning models.

**Files**

- lightgbm_model_v1.0.pkl
- metadata.json

---

### training/

Contains scripts for dataset preparation, model training, validation, and evaluation.

**Files**

- build_dataset.py
- evaluate_model.py
- feature_importance.py
- merge_train.py
- remove_unlabeled.py
- train_lightgbm.py
- validate_dataset.py
- verify_dataset.py

---

### tests/

Contains unit tests for the Machine Learning Engine.

**Files**

- test_feature_extractor.py
- test_model.py
- test_scanner.py

---

### yara_rules/

Contains YARA rule definitions and indexing utilities.

**Files**

- __init__.py
- rules_index.py

---

## docker-compose.yml

Defines Docker services required to run the complete ThreatLens AI project.

---

## README.md

Provides project overview, setup instructions, architecture, and usage information.

---

## .gitignore

Lists files and folders excluded from Git version control.

---

# Current Repository Status

### Completed

- Machine Learning Engine
- Feature Extraction
- LightGBM Model
- YARA Integration
- Model Training Scripts
- Unit Tests
- API Documentation

### In Progress

- Backend Development
- Frontend Development

### Planned

- Dashboard Integration
- User Authentication
- Database Integration
- Deployment

---

# Summary

The current repository is organized around a modular Machine Learning Engine, with backend and frontend directories prepared for future implementation. This structure supports independent development, simplifies maintenance, and enables seamless integration of additional project modules as development progresses.