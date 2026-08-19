# Data Flow Diagram (DFD)

## Introduction

The Data Flow Diagram (DFD) illustrates how data moves through the ThreatLens AI system. It shows the flow of information between users, system processes, databases, and external components involved in malware analysis and threat detection.

---

# Level 0 DFD (Context Diagram)

External Entity:

- User

Main System:

- ThreatLens AI

Data Flows:

- Login Request
- File Upload
- Analysis Request
- Malware Report
- Dashboard Information
- Alerts & Notifications

---

# Level 1 DFD

## Process 1: User Authentication

**Input**

- User Credentials

**Output**

- Authentication Status
- User Session

---

## Process 2: File Upload

**Input**

- Executable (.exe) File

**Output**

- Stored File

---

## Process 3: Static Analysis

**Input**

- Uploaded File

**Output**

- File Metadata
- MD5 Hash
- SHA-256 Hash
- PE Header
- Imported APIs
- Strings

---

## Process 4: YARA Rule Matching

**Input**

- Static Analysis Results

**Output**

- YARA Match Result

---

## Process 5: Machine Learning Classification

**Input**

- Extracted Features

**Output**

- Malware Family
- Risk Score
- Confidence Score

---

## Process 6: Database Storage

**Stores**

- User Information
- Uploaded Files
- Analysis Results
- Reports
- Alerts
- Logs

---

## Process 7: Report Generation

**Input**

- Analysis Results

**Output**

- Malware Analysis Report

---

## Process 8: Dashboard

**Displays**

- Malware Statistics
- Threat Trends
- Recent Scans
- Active Alerts
- Reports

---

# Data Stores

- D1 – Users Database
- D2 – Uploaded Files
- D3 – Analysis Results
- D4 – Reports
- D5 – Alerts
- D6 – Audit Logs

---

# DFD Summary

| Process | Input | Output |
|---------|-------|--------|
| Authentication | User Credentials | User Session |
| File Upload | Executable File | Stored File |
| Static Analysis | Uploaded File | File Features |
| YARA Detection | File Features | Detection Result |
| ML Classification | Extracted Features | Malware Prediction |
| Database | Analysis Data | Stored Records |
| Report Generation | Analysis Results | Malware Report |
| Dashboard | Database Records | Analytics & Alerts |

---

# Recommended Tools

The Data Flow Diagram (DFD) can be created using:

- draw.io
- Lucidchart
- Microsoft Visio
- Visual Paradigm
- StarUML