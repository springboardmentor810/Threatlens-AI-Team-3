# Dashboard API

## Introduction

The Dashboard API provides security analytics, malware statistics, recent scans, and threat monitoring data for the ThreatLens AI dashboard.

---

# Base URL

```
http://localhost:8000/api/v1/dashboard
```

---

# 1. Get Dashboard Summary

### Endpoint

```
GET /summary
```

### Description

Returns the overall dashboard statistics.

### Success Response

```json
{
  "total_files": 120,
  "malware_detected": 42,
  "clean_files": 78,
  "high_risk": 15
}
```

### Status Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 401 | Unauthorized |
| 500 | Internal Server Error |

---

# 2. Get Recent Analysis

### Endpoint

```
GET /recent-analysis
```

### Description

Returns recently analyzed files.

### Success Response

```json
[
  {
    "file_name": "sample.exe",
    "malware_family": "Trojan",
    "risk_score": 92
  }
]
```

---

# 3. Get Threat Statistics

### Endpoint

```
GET /statistics
```

### Description

Returns malware statistics and threat trends.

### Success Response

```json
{
  "trojan": 35,
  "ransomware": 12,
  "worm": 8,
  "spyware": 6
}
```

---

# Dashboard API Summary

| API | Method | Purpose |
|-----|--------|---------|
| /summary | GET | Dashboard summary |
| /recent-analysis | GET | Recent malware analyses |
| /statistics | GET | Threat statistics |