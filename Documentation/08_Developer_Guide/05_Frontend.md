# Frontend Development Guide

## Introduction

The frontend of ThreatLens AI provides a responsive and user-friendly interface for interacting with the malware detection system. It enables users to upload files, view malware analysis results, monitor alerts, and access reports through an intuitive web application.

---

# Technologies Used

- React.js
- Tailwind CSS
- JavaScript (ES6+)
- Axios
- React Router
- HTML5
- CSS3

---

# Frontend Architecture

```
Frontend
│
├── Login
├── Dashboard
├── Upload
├── Reports
├── Analytics
├── Alerts
├── Profile
├── Components
└── Services
```

---

# Pages

## Login

Responsibilities:

- User Authentication
- Login Validation
- JWT Token Storage

---

## Dashboard

Responsibilities:

- Display Malware Statistics
- Recent Analysis
- Active Alerts
- Quick Navigation

---

## Upload

Responsibilities:

- Select Executable File
- Validate File
- Upload File
- Display Upload Status

---

## Reports

Responsibilities:

- View Reports
- Search Reports
- Download Reports
- Export Reports

---

## Analytics

Responsibilities:

- Malware Statistics
- Threat Trends
- Risk Distribution
- Detection Summary

---

## Alerts

Responsibilities:

- View Active Alerts
- Alert History
- Alert Status

---

## Profile

Responsibilities:

- View User Information
- Update Profile
- Change Password
- Logout

---

# Reusable Components

- Navbar
- Sidebar
- Footer
- Loader
- Button
- Card
- Modal
- Table
- Alert Message

---

# Services

| Service | Purpose |
|----------|---------|
| authService.js | Authentication APIs |
| uploadService.js | File Upload APIs |
| reportService.js | Report APIs |
| api.js | API Configuration |

---

# Frontend Workflow

1. User Login
2. Dashboard Display
3. Upload File
4. View Analysis Results
5. Monitor Alerts
6. Generate Reports
7. Logout

---

# Best Practices

- Use reusable components.
- Keep UI responsive.
- Separate API logic from UI.
- Validate user inputs.
- Display loading indicators.
- Handle API errors gracefully.

---

# Summary

The frontend provides an intuitive and responsive interface that enables users to securely interact with the ThreatLens AI platform, manage malware analysis, monitor threats, and access reports efficiently.