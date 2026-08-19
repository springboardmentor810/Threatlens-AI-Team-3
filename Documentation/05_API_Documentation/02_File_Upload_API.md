# File Upload API

## Introduction

The File Upload API allows authenticated users to upload suspicious executable (.exe) files for malware analysis.

---

# Base URL

```
http://localhost:8000/api/v1/files
```

---

# 1. Upload File

### Endpoint

```
POST /upload
```

### Description

Uploads a suspicious executable file and stores it for static analysis.

### Request

**Content-Type**

```
multipart/form-data
```

**Parameters**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| file | File | Yes | Executable (.exe) file |

### Success Response

```json
{
  "message": "File uploaded successfully",
  "file_id": 101,
  "status": "Uploaded"
}
```

### Status Codes

| Code | Description |
|------|-------------|
| 201 | File Uploaded Successfully |
| 400 | Invalid File |
| 401 | Unauthorized |
| 413 | File Too Large |
| 500 | Internal Server Error |

---

# 2. Get Uploaded Files

### Endpoint

```
GET /files
```

### Description

Returns a list of uploaded files.

### Success Response

```json
[
  {
    "file_id": 101,
    "file_name": "sample.exe",
    "upload_date": "2026-08-05"
  }
]
```

---

# 3. Get File Details

### Endpoint

```
GET /files/{file_id}
```

### Description

Returns details of a specific uploaded file.

### Success Response

```json
{
  "file_id": 101,
  "file_name": "sample.exe",
  "file_size": "2.4 MB",
  "upload_date": "2026-08-05"
}
```

---

# File Upload API Summary

| API | Method | Purpose |
|-----|--------|---------|
| /upload | POST | Upload malware sample |
| /files | GET | View uploaded files |
| /files/{file_id} | GET | View file details |