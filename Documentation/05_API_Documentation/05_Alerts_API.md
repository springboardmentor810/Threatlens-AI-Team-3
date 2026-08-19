# Alerts API

## Introduction

The Alerts API manages malware alerts and security notifications generated during file analysis.

---

# Base URL

```
http://localhost:8000/api/v1/alerts
```

---

# 1. Get All Alerts

### Endpoint

```
GET /alerts
```

### Description

Returns a list of all security alerts.

### Success Response

```json
[
  {
    "alert_id": 1,
    "severity": "High",
    "alert_type": "Malware Detected",
    "status": "Active"
  }
]
```

### Status Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 401 | Unauthorized |
| 500 | Internal Server Error |

---

# 2. Get Alert Details

### Endpoint

```
GET /alerts/{alert_id}
```

### Description

Returns detailed information for a specific alert.

### Success Response

```json
{
  "alert_id": 1,
  "severity": "High",
  "alert_type": "Trojan Detected",
  "description": "Potential Trojan malware identified.",
  "status": "Active"
}
```

---

# 3. Update Alert Status

### Endpoint

```
PUT /alerts/{alert_id}
```

### Description

Updates the status of an alert.

### Request Body

```json
{
  "status": "Resolved"
}
```

### Success Response

```json
{
  "message": "Alert updated successfully"
}
```

---

# Alerts API Summary

| API | Method | Purpose |
|-----|--------|---------|
| /alerts | GET | View all alerts |
| /alerts/{alert_id} | GET | View alert details |
| /alerts/{alert_id} | PUT | Update alert status |