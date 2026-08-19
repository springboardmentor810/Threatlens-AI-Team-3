# Entity Relationship (ER) Diagram

## Introduction

The Entity Relationship (ER) Diagram represents the database structure of the ThreatLens AI system. It illustrates the entities, their attributes, and the relationships between them.

---

# Entities

## 1. Users

Attributes

- user_id (PK)
- name
- email
- password
- role
- created_at

---

## 2. Uploaded_Files

Attributes

- file_id (PK)
- user_id (FK)
- file_name
- file_hash
- file_size
- upload_date

---

## 3. Analysis_Results

Attributes

- analysis_id (PK)
- file_id (FK)
- md5_hash
- sha256_hash
- metadata
- pe_header
- strings
- imported_apis

---

## 4. YARA_Results

Attributes

- yara_id (PK)
- file_id (FK)
- rule_name
- match_status
- detection_time

---

## 5. ML_Predictions

Attributes

- prediction_id (PK)
- file_id (FK)
- malware_family
- confidence_score
- risk_score
- prediction_date

---

## 6. Reports

Attributes

- report_id (PK)
- file_id (FK)
- report_name
- generated_date
- report_status

---

## 7. Alerts

Attributes

- alert_id (PK)
- file_id (FK)
- severity
- alert_type
- status
- created_at

---

## 8. Audit_Logs

Attributes

- log_id (PK)
- user_id (FK)
- activity
- timestamp
- status

---

# Relationships

- One User can upload many Files.
- One Uploaded File has one Analysis Result.
- One Uploaded File can have one YARA Result.
- One Uploaded File can have one ML Prediction.
- One Uploaded File can generate one Report.
- One Uploaded File can trigger multiple Alerts.
- One User can have multiple Audit Logs.

---

# Relationship Summary

| Parent Entity | Child Entity | Relationship |
|--------------|-------------|--------------|
| Users | Uploaded_Files | One-to-Many |
| Users | Audit_Logs | One-to-Many |
| Uploaded_Files | Analysis_Results | One-to-One |
| Uploaded_Files | YARA_Results | One-to-One |
| Uploaded_Files | ML_Predictions | One-to-One |
| Uploaded_Files | Reports | One-to-One |
| Uploaded_Files | Alerts | One-to-Many |

---

# ER Diagram Tools

The ER Diagram can be created using:

- draw.io
- dbdiagram.io
- MySQL Workbench
- Visual Paradigm
- Lucidchart