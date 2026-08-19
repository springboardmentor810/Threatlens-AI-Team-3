# API Testing

## Introduction

API testing verifies that all REST APIs in ThreatLens AI function correctly, return appropriate HTTP responses, validate inputs, and ensure secure communication between the frontend and backend.

---

## API-001 : User Login API

**Endpoint:** `/login`

**Method:** POST

**Objective:**
Verify that registered users can log in successfully.

**Request:**
Valid email and password.

**Expected Result:**
- JWT access token is generated.
- User login is successful.
- HTTP Status Code: **200 OK**

**Status:** ✅ Pass

---

## API-002 : Invalid Login API

**Endpoint:** `/login`

**Method:** POST

**Objective:**
Verify login validation for incorrect credentials.

**Request:**
Invalid email or password.

**Expected Result:**
- Login request is rejected.
- HTTP Status Code: **401 Unauthorized**

**Status:** ✅ Pass

---

## API-003 : User Registration API

**Endpoint:** `/register`

**Method:** POST

**Objective:**
Verify new user registration.

**Request:**
Valid registration details.

**Expected Result:**
- New user account is created.
- HTTP Status Code: **201 Created**

**Status:** ✅ Pass

---

## API-004 : File Upload API

**Endpoint:** `/upload`

**Method:** POST

**Objective:**
Verify successful malware file upload.

**Request:**
Valid executable (.exe) file.

**Expected Result:**
- File uploaded successfully.
- HTTP Status Code: **201 Created**

**Status:** ✅ Pass

---

## API-005 : Invalid File Upload API

**Endpoint:** `/upload`

**Method:** POST

**Objective:**
Verify unsupported file validation.

**Request:**
Unsupported file format.

**Expected Result:**
- Upload rejected.
- Validation error returned.
- HTTP Status Code: **400 Bad Request**

**Status:** ✅ Pass

---

## API-006 : Analysis Result API

**Endpoint:** `/analysis/{id}`

**Method:** GET

**Objective:**
Retrieve malware analysis results.

**Request:**
Valid File ID.

**Expected Result:**
- Analysis details returned successfully.
- HTTP Status Code: **200 OK**

**Status:** ✅ Pass

---

## API-007 : Report Generation API

**Endpoint:** `/analysis/{id}/report`

**Method:** GET

**Objective:**
Generate malware analysis report.

**Request:**
Valid File ID.

**Expected Result:**
- Report generated successfully.
- HTTP Status Code: **200 OK**

**Status:** ✅ Pass

---

## API-008 : Dashboard API

**Endpoint:** `/dashboard/summary`

**Method:** GET

**Objective:**
Retrieve dashboard statistics.

**Request:**
Authenticated request.

**Expected Result:**
- Dashboard analytics returned successfully.
- HTTP Status Code: **200 OK**

**Status:** ✅ Pass

---

## API-009 : Alerts API

**Endpoint:** `/alerts`

**Method:** GET

**Objective:**
Retrieve active security alerts.

**Request:**
Authenticated request.

**Expected Result:**
- Alert list returned successfully.
- HTTP Status Code: **200 OK**

**Status:** ✅ Pass

---

## API-010 : Logout API

**Endpoint:** `/logout`

**Method:** POST

**Objective:**
Verify secure user logout.

**Request:**
Authenticated user session.

**Expected Result:**
- User session terminated.
- JWT token invalidated.
- HTTP Status Code: **200 OK**

**Status:** ✅ Pass

---

# API Testing Summary

**Total APIs Tested:** 10

**Passed:** 10

**Failed:** 0

**Pending:** 0

---

# Tools Used

- Postman
- FastAPI / Flask
- JSON
- HTTP Status Codes

---

# Conclusion

All REST APIs were successfully verified for functionality, request validation, response handling, and security. Authentication, file upload, malware analysis, dashboard, reporting, and alert management APIs behaved as expected and returned the appropriate HTTP status codes.