# Functional Requirements

## Introduction

This document describes the functional requirements of the ThreatLens AI system. Functional requirements define the features and services that the system must provide to users. These requirements ensure that the platform supports malware detection, analysis, reporting, and threat monitoring effectively.

---

# FR-01 User Authentication

## Description

The system shall provide secure user authentication using username/email and password.

### Inputs

- Email or Username
- Password

### Outputs

- Successful login
- Authentication failure message

### Functional Requirements

- User registration (Administrator controlled)
- User login
- Password validation
- JWT token generation
- Secure logout

---

# FR-02 Role-Based Access Control

## Description

The system shall restrict access based on user roles.

### Supported Roles

- Administrator
- Security Analyst
- SOC Team Member
- Researcher

### Functional Requirements

- Assign roles to users
- Restrict unauthorized access
- Manage user permissions

---

# FR-03 File Upload

## Description

The system shall allow users to upload suspicious executable files for malware analysis.

### Inputs

- Windows Executable (.exe)

### Functional Requirements

- Validate uploaded file
- Store uploaded file securely
- Generate unique file identifier
- Display upload status

---

# FR-04 Static File Analysis

## Description

The system shall analyze uploaded files without executing them.

### Functional Requirements

- Generate MD5 hash
- Generate SHA-256 hash
- Extract file metadata
- Analyze PE Header
- Extract imported APIs
- Extract embedded strings
- Detect suspicious URLs and IP addresses

---

# FR-05 YARA Rule Matching

## Description

The system shall compare uploaded files against predefined YARA rules.

### Functional Requirements

- Load YARA rule set
- Scan uploaded files
- Display matched rules
- Generate signature detection results

---

# FR-06 Machine Learning Malware Classification

## Description

The system shall classify malware using a machine learning model trained on the EMBER dataset.

### Functional Requirements

- Extract model features
- Predict malware class
- Predict malware family
- Generate confidence score
- Generate risk score

---

# FR-07 Database Management

## Description

The system shall store all malware analysis information.

### Functional Requirements

- Store user information
- Store uploaded files
- Store analysis results
- Store prediction results
- Store reports
- Store alerts

---

# FR-08 Dashboard

## Description

The dashboard shall present analysis results visually.

### Functional Requirements

- Recent scans
- Malware statistics
- Threat trends
- Risk distribution
- Detection history

---

# FR-09 Reports

## Description

The system shall generate malware analysis reports.

### Functional Requirements

- View reports
- Download reports
- Search reports
- Filter reports
- Export reports

---

# FR-10 Alerts and Notifications

## Description

The system shall notify users about detected threats.

### Functional Requirements

- High-risk alerts
- Malware detection notifications
- Dashboard notifications
- Alert history

---

# FR-11 Analytics

## Description

The system shall provide security analytics.

### Functional Requirements

- Malware statistics
- Threat trends
- Detection rate
- Classification accuracy
- Risk analysis

---

# FR-12 Logging and Audit Trail

## Description

The system shall record important system activities.

### Functional Requirements

- User login logs
- Upload logs
- Malware analysis logs
- Prediction logs
- Error logs
- Security event logs

---

# Functional Requirement Summary
FR ID    Module                 Priority
-----------------------------------------
FR-01    Authentication         High
FR-02    Role Management        High
FR-03    File Upload            High
FR-04    Static Analysis        High
FR-05    YARA Detection         High
FR-06    ML Classification      High
FR-07    Database               High
FR-08    Dashboard              Medium
FR-09    Reports                Medium
FR-10    Alerts                 Medium
FR-11    Analytics              Medium
FR-12    Logging                Medium