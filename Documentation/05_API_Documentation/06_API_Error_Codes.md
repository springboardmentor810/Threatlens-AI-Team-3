# API Error Codes

## Introduction

This document describes the standard HTTP status codes and error responses used by the ThreatLens AI REST APIs.

---

# Success Responses

| Status Code | Description |
|-------------|-------------|
| 200 | Request completed successfully |
| 201 | Resource created successfully |
| 204 | Request successful, no content returned |

---

# Client Error Responses

| Status Code | Description |
|-------------|-------------|
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Resource Not Found |
| 405 | Method Not Allowed |
| 409 | Conflict |
| 413 | Payload Too Large |
| 415 | Unsupported Media Type |
| 422 | Validation Error |
| 429 | Too Many Requests |

---

# Server Error Responses

| Status Code | Description |
|-------------|-------------|
| 500 | Internal Server Error |
| 501 | Not Implemented |
| 502 | Bad Gateway |
| 503 | Service Unavailable |
| 504 | Gateway Timeout |

---

# Standard Error Response Format

```json
{
  "success": false,
  "status": 404,
  "error": "File Not Found",
  "message": "The requested file does not exist.",
  "timestamp": "2026-08-05T12:30:00Z"
}
```

---

# Common API Errors

| API | Possible Errors |
|-----|-----------------|
| Login API | 400, 401, 500 |
| Upload API | 400, 401, 413, 415 |
| Analysis API | 400, 404, 500 |
| Dashboard API | 401, 500 |
| Alerts API | 401, 404, 500 |

---

# Error Handling Guidelines

- Validate all input before processing.
- Return meaningful error messages.
- Do not expose sensitive system information.
- Log all server-side errors.
- Use standard HTTP status codes consistently.