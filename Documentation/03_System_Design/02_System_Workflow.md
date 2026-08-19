# System Workflow

## Introduction

The ThreatLens AI workflow describes the complete process of malware detection, from user authentication to threat analysis and report generation. The system combines static analysis, YARA rule matching, and machine learning to identify both known and unknown malware.

---

# Workflow Steps

## Step 1: User Authentication

- User logs into the system.
- Credentials are verified.
- Dashboard is displayed after successful authentication.

---

## Step 2: File Upload

- User uploads a suspicious executable (.exe) file.
- File type and size are validated.
- The file is securely stored for analysis.

---

## Step 3: Static File Analysis

The system extracts:

- File Metadata
- MD5 Hash
- SHA-256 Hash
- PE Header Information
- Imported APIs
- Embedded Strings
- Suspicious URLs and IP Addresses

---

## Step 4: YARA Rule Matching

- Uploaded file is scanned using predefined YARA rules.
- If a signature match is found, the malware is identified as known malware.

---

## Step 5: Machine Learning Classification

If no YARA match is found:

- Extract ML features
- Run the trained LightGBM model
- Predict malware family
- Generate confidence score
- Calculate threat risk score

---

## Step 6: Store Results

The system stores:

- File Details
- Static Analysis Results
- YARA Results
- ML Prediction
- Risk Score
- Confidence Score
- Logs

---

## Step 7: Report Generation

The system generates a detailed malware analysis report containing:

- File Information
- Static Analysis Results
- YARA Detection Results
- ML Prediction
- Risk Score
- Recommended Action

---

## Step 8: Dashboard & Alerts

The dashboard displays:

- Recent Scans
- Malware Statistics
- Threat Trends
- Active Alerts
- Analysis Reports

---

# Workflow Summary

User Login

↓

Upload Suspicious File

↓

Static File Analysis

↓

YARA Rule Matching

↓

Known Malware?
│
├── Yes → Generate Report
│
└── No
      ↓
Machine Learning Classification
      ↓
Risk Score & Confidence Score
      ↓
Store Results
      ↓
Dashboard & Alerts