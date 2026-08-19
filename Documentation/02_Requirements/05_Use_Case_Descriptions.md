# Use Case Descriptions

This document describes the primary use cases of the ThreatLens AI system.

---

# UC-01 User Login

| Attribute | Description |
|-----------|-------------|
| Use Case ID | UC-01 |
| Use Case Name | User Login |
| Primary Actor | All Users |
| Description | Authenticates users before granting system access. |
| Precondition | User account exists. |
| Postcondition | User is redirected to the dashboard. |

---

# UC-02 Upload Suspicious File

| Attribute | Description |
|-----------|-------------|
| Use Case ID | UC-02 |
| Use Case Name | Upload File |
| Primary Actor | Security Analyst, Researcher |
| Description | Uploads an executable file for malware analysis. |
| Precondition | User is logged in. |
| Postcondition | File is stored for analysis. |

---

# UC-03 Static File Analysis

| Attribute | Description |
|-----------|-------------|
| Use Case ID | UC-03 |
| Use Case Name | Static Analysis |
| Primary Actor | System |
| Description | Extracts hashes, metadata, PE header information, imports, and strings without executing the file. |
| Precondition | File uploaded successfully. |
| Postcondition | Static features are extracted. |

---

# UC-04 YARA Rule Matching

| Attribute | Description |
|-----------|-------------|
| Use Case ID | UC-04 |
| Use Case Name | YARA Detection |
| Primary Actor | System |
| Description | Scans uploaded files using YARA rules to detect known malware. |
| Precondition | Static analysis completed. |
| Postcondition | Matching rules are displayed. |

---

# UC-05 Machine Learning Classification

| Attribute | Description |
|-----------|-------------|
| Use Case ID | UC-05 |
| Use Case Name | ML Classification |
| Primary Actor | System |
| Description | Predicts malware family, confidence score, and risk score using the trained ML model. |
| Precondition | Feature extraction completed. |
| Postcondition | Prediction results are generated. |

---

# UC-06 Generate Report

| Attribute | Description |
|-----------|-------------|
| Use Case ID | UC-06 |
| Use Case Name | Generate Report |
| Primary Actor | Security Analyst |
| Description | Generates a malware analysis report containing scan results and predictions. |
| Precondition | Analysis completed. |
| Postcondition | Report is available for viewing or download. |

---

# UC-07 Dashboard

| Attribute | Description |
|-----------|-------------|
| Use Case ID | UC-07 |
| Use Case Name | View Dashboard |
| Primary Actor | All Authorized Users |
| Description | Displays malware statistics, alerts, recent scans, and analytics. |
| Precondition | User is authenticated. |
| Postcondition | Dashboard information is displayed. |

---

# UC-08 Alerts & Notifications

| Attribute | Description |
|-----------|-------------|
| Use Case ID | UC-08 |
| Use Case Name | Alerts |
| Primary Actor | Security Analyst, SOC Team |
| Description | Displays malware alerts and security notifications. |
| Precondition | Threat detected. |
| Postcondition | Alert is shown on the dashboard. |