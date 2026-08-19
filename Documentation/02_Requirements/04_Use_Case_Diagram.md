# Use Case Diagram

## Introduction

The Use Case Diagram illustrates the interactions between different users (actors) and the ThreatLens AI system. It represents the major functionalities available to each user role and helps visualize the overall behavior of the system.

---

# Actors

1. Administrator
2. Security Analyst
3. SOC Team Member
4. Researcher

---

# Use Cases

## Administrator

- Login
- Manage Users
- Assign Roles
- Configure System
- Manage YARA Rules
- View Dashboard
- View Reports
- Manage Alerts
- Logout

---

## Security Analyst

- Login
- Upload Suspicious File
- Perform Static Analysis
- View YARA Results
- View ML Prediction
- Generate Report
- View Dashboard
- View Alerts
- Logout

---

## SOC Team Member

- Login
- View Threat Dashboard
- Monitor Alerts
- View Reports
- Track Malware Incidents
- Logout

---

## Researcher

- Login
- Upload Malware Samples
- Analyze Malware
- View Classification Results
- Export Reports
- Logout

---

# Relationships

- Every actor must Login before accessing the system.
- File Upload includes Static Analysis.
- Static Analysis includes YARA Rule Matching.
- YARA Rule Matching extends Machine Learning Classification when no signature match is found.
- Malware Classification generates Risk Score and Confidence Score.
- Analysis Results are stored in the database.
- Reports and Dashboard retrieve information from stored analysis results.

---

# Diagram Tools

The Use Case Diagram can be created using:

- draw.io
- Lucidchart
- StarUML
- Visual Paradigm