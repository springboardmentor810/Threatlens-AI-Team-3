# Sequence Diagrams

## Introduction

Sequence diagrams illustrate how different components of ThreatLens AI interact with each other during system execution. They show the order of communication between users, frontend, backend, AI engine, YARA engine, and the database.

---

# Sequence Diagram 1: User Login

User

↓

Frontend

↓

Authentication API

↓

Database

↓

Authentication Success

↓

Dashboard

---

# Sequence Diagram 2: Malware Analysis

User

↓

Upload File

↓

Frontend

↓

Backend API

↓

Static Analysis

↓

YARA Engine

↓

Known Malware?

├── Yes → Generate Report

└── No

↓

ML Engine

↓

Prediction

↓

Risk Score

↓

Database

↓

Dashboard

---

# Sequence Diagram 3: Report Generation

User

↓

Frontend

↓

Backend

↓

Database

↓

Analysis Results

↓

Generate Report

↓

Download Report

---

# Sequence Diagram 4: Dashboard

User

↓

Frontend

↓

Backend API

↓

Database

↓

Recent Analysis

↓

Threat Statistics

↓

Alerts

↓

Dashboard Display

---

# Participants

- User
- Frontend
- Backend API
- Authentication Service
- Static Analysis Engine
- YARA Engine
- Machine Learning Engine
- Database
- Dashboard
- Report Generator

---

# Diagram Tools

The sequence diagrams can be created using:

- draw.io
- Lucidchart
- StarUML
- Visual Paradigm