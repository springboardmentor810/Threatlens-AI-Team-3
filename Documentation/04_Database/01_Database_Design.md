# Database Design

## Introduction

The ThreatLens AI database is designed to securely store user information, uploaded files, malware analysis results, machine learning predictions, reports, alerts, and system logs. It uses a relational database (PostgreSQL) for structured data and can optionally integrate MongoDB for storing unstructured analysis data.

---

# Database Objectives

The database is designed to:

- Store user information securely.
- Manage uploaded malware samples.
- Store static analysis results.
- Store YARA scan results.
- Store machine learning predictions.
- Generate malware reports.
- Maintain alert history.
- Record system activity logs.

---

# Database Components

## Users

Stores user account information.

**Attributes**

- User ID
- Name
- Email
- Password
- Role
- Created Date

---

## Uploaded Files

Stores information about uploaded executable files.

**Attributes**

- File ID
- File Name
- File Hash
- File Size
- Upload Date
- Uploaded By

---

## Analysis Results

Stores static analysis information.

**Attributes**

- Analysis ID
- File ID
- MD5 Hash
- SHA-256 Hash
- PE Header
- Metadata
- Strings
- Imported APIs

---

## YARA Results

Stores YARA rule matching results.

**Attributes**

- Scan ID
- File ID
- Rule Name
- Match Status
- Detection Time

---

## ML Predictions

Stores machine learning prediction results.

**Attributes**

- Prediction ID
- File ID
- Malware Family
- Risk Score
- Confidence Score
- Prediction Date

---

## Reports

Stores generated malware analysis reports.

**Attributes**

- Report ID
- File ID
- Report Name
- Generated Date
- Report Status

---

## Alerts

Stores security alerts.

**Attributes**

- Alert ID
- Alert Type
- Severity
- Description
- Alert Time
- Status

---

## Audit Logs

Stores system activity logs.

**Attributes**

- Log ID
- User ID
- Activity
- Timestamp
- Status

---

# Database Summary

| Table | Purpose |
|--------|---------|
| Users | Store user information |
| Uploaded_Files | Store uploaded malware samples |
| Analysis_Results | Store static analysis data |
| YARA_Results | Store YARA detection results |
| ML_Predictions | Store malware predictions |
| Reports | Store generated reports |
| Alerts | Store security alerts |
| Audit_Logs | Store system activity logs |