# System Architecture

## Introduction

ThreatLens AI follows a modular architecture that integrates frontend, backend, machine learning, cybersecurity analysis, and database components. Each module performs a specific task and communicates through secure REST APIs to provide an efficient malware detection workflow.

---

# Architecture Components

## 1. Frontend

The frontend provides the user interface for interacting with the system.

**Technologies**

- React.js
- Tailwind CSS

**Responsibilities**

- User Login
- Dashboard
- File Upload
- Reports
- Alerts
- Analytics

---

## 2. Backend

The backend manages business logic and API communication.

**Technologies**

- Python
- FastAPI / Flask

**Responsibilities**

- Authentication
- File Management
- Static Analysis
- YARA Integration
- ML Prediction
- Report Generation

---

## 3. AI/ML Engine

The AI engine performs malware classification.

**Technologies**

- LightGBM
- Scikit-learn
- Pandas
- NumPy

**Responsibilities**

- Feature Extraction
- Model Training
- Malware Prediction
- Risk Score Generation
- Confidence Score Generation

---

## 4. YARA Engine

The YARA engine detects known malware using signature-based rules.

**Responsibilities**

- Rule Matching
- Signature Detection
- Malware Identification

---

## 5. Database

The database stores application data.

**Technologies**

- PostgreSQL
- MongoDB

**Stores**

- Users
- Uploaded Files
- Analysis Results
- Reports
- Alerts
- Logs

---

# Overall Workflow

User

↓

Login

↓

Upload File

↓

Static Analysis

↓

YARA Rule Matching

↓

Machine Learning Prediction

↓

Risk Score Generation

↓

Store Results

↓

Dashboard & Reports

---

# Benefits

- Modular Design
- Scalable Architecture
- Secure Communication
- Easy Maintenance
- Future Expandability
