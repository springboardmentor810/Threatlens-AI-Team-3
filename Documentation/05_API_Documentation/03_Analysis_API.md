# Analysis API

## Introduction

The Analysis API performs static malware analysis, YARA rule matching, and machine learning-based classification of uploaded executable files.

---

# Base URL

```
http://localhost:8000/api/v1/analysis
```

---

# 1. Start File Analysis

### Endpoint

```
POST /analyze/{file_id}
```

### Description

Starts malware analysis for the selected uploaded file.

### Success Response

```json
{
  "message": "Analysis Started",
  "file_id": 101,
  "status": "Processing"
}
```

### Status Codes

| Code | Description |
|------|-------------|
| 200 | Analysis Started |
| 400 | Invalid Request |
| 404 | File Not Found |
| 500 | Internal Server Error |

---

# 2. Get Analysis Result

### Endpoint

```
GET /analysis/{file_id}
```

### Description

Returns the complete malware analysis result.

### Success Response

```json
{
  "file_id": 101,
  "md5_hash": "xxxxxxxx",
  "sha256_hash": "xxxxxxxx",
  "yara_match": true,
  "malware_family": "Trojan",
  "risk_score": 91,
  "confidence_score": 97.8
}
```

---

# 3. Generate Analysis Report

### Endpoint

```
GET /analysis/{file_id}/report
```

### Description

Generates a detailed malware analysis report.

### Success Response

```json
{
  "report_id": 501,
  "status": "Generated"
}
```

---

# Analysis API Summary

| API | Method | Purpose |
|-----|--------|---------|
| /analyze/{file_id} | POST | Start malware analysis |
| /analysis/{file_id} | GET | View analysis result |
| /analysis/{file_id}/report | GET | Generate malware report |