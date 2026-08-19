# Database Schema

## Introduction

The ThreatLens AI database schema defines the structure of the database, including tables, primary keys, foreign keys, and relationships used to manage malware analysis, user information, reports, and security events.

---

# Database Overview

**Database:** PostgreSQL

The database consists of the following tables:

- Users
- Uploaded_Files
- Analysis_Results
- YARA_Results
- ML_Predictions
- Reports
- Alerts
- Audit_Logs

---

# Schema Definition

## Users

| Column | Type | Constraint |
|--------|------|------------|
| user_id | SERIAL | Primary Key |
| name | VARCHAR(100) | NOT NULL |
| email | VARCHAR(100) | UNIQUE |
| password | VARCHAR(255) | NOT NULL |
| role | VARCHAR(50) | NOT NULL |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP |

---

## Uploaded_Files

| Column | Type | Constraint |
|--------|------|------------|
| file_id | SERIAL | Primary Key |
| user_id | INT | Foreign Key |
| file_name | VARCHAR(255) | NOT NULL |
| file_hash | VARCHAR(255) | UNIQUE |
| file_size | BIGINT | NOT NULL |
| upload_date | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP |

---

## Analysis_Results

| Column | Type | Constraint |
|--------|------|------------|
| analysis_id | SERIAL | Primary Key |
| file_id | INT | Foreign Key |
| md5_hash | VARCHAR(255) | NOT NULL |
| sha256_hash | VARCHAR(255) | NOT NULL |
| metadata | JSON | NULL |
| pe_header | JSON | NULL |
| strings | TEXT | NULL |

---

## YARA_Results

| Column | Type | Constraint |
|--------|------|------------|
| yara_id | SERIAL | Primary Key |
| file_id | INT | Foreign Key |
| rule_name | VARCHAR(100) | NULL |
| match_status | VARCHAR(20) | NOT NULL |
| detection_time | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP |

---

## ML_Predictions

| Column | Type | Constraint |
|--------|------|------------|
| prediction_id | SERIAL | Primary Key |
| file_id | INT | Foreign Key |
| malware_family | VARCHAR(100) | NOT NULL |
| confidence_score | FLOAT | NOT NULL |
| risk_score | FLOAT | NOT NULL |
| prediction_date | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP |

---

## Reports

| Column | Type | Constraint |
|--------|------|------------|
| report_id | SERIAL | Primary Key |
| file_id | INT | Foreign Key |
| report_name | VARCHAR(255) | NOT NULL |
| generated_date | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP |
| report_status | VARCHAR(20) | NOT NULL |

---

## Alerts

| Column | Type | Constraint |
|--------|------|------------|
| alert_id | SERIAL | Primary Key |
| file_id | INT | Foreign Key |
| severity | VARCHAR(20) | NOT NULL |
| alert_type | VARCHAR(100) | NOT NULL |
| status | VARCHAR(20) | NOT NULL |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP |

---

## Audit_Logs

| Column | Type | Constraint |
|--------|------|------------|
| log_id | SERIAL | Primary Key |
| user_id | INT | Foreign Key |
| activity | TEXT | NOT NULL |
| timestamp | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP |
| status | VARCHAR(20) | NOT NULL |

---

# Primary Keys

- user_id
- file_id
- analysis_id
- yara_id
- prediction_id
- report_id
- alert_id
- log_id

---

# Foreign Keys

- Uploaded_Files.user_id → Users.user_id
- Analysis_Results.file_id → Uploaded_Files.file_id
- YARA_Results.file_id → Uploaded_Files.file_id
- ML_Predictions.file_id → Uploaded_Files.file_id
- Reports.file_id → Uploaded_Files.file_id
- Alerts.file_id → Uploaded_Files.file_id
- Audit_Logs.user_id → Users.user_id

---

# Database Relationships

| Parent Table | Child Table | Relationship |
|--------------|-------------|--------------|
| Users | Uploaded_Files | One-to-Many |
| Users | Audit_Logs | One-to-Many |
| Uploaded_Files | Analysis_Results | One-to-One |
| Uploaded_Files | YARA_Results | One-to-One |
| Uploaded_Files | ML_Predictions | One-to-One |
| Uploaded_Files | Reports | One-to-One |
| Uploaded_Files | Alerts | One-to-Many |

---

# Summary

The ThreatLens AI database schema is designed to maintain secure and structured storage of user accounts, uploaded files, malware analysis results, YARA detections, machine learning predictions, reports, alerts, and audit logs. The relational structure ensures data consistency, efficient querying, and future scalability.