# Authentication API

## Introduction

The Authentication API manages user authentication, authorization, and session management for the ThreatLens AI system.

---

# Base URL

```
http://localhost:8000/api/v1/auth
```

---

# 1. User Login

### Endpoint

```
POST /login
```

### Description

Authenticates a registered user and returns an access token.

### Request Body

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

### Success Response

```json
{
  "message": "Login Successful",
  "access_token": "jwt_token",
  "role": "Security Analyst"
}
```

### Status Codes

| Code | Description |
|------|-------------|
| 200 | Login Successful |
| 400 | Invalid Request |
| 401 | Invalid Credentials |
| 500 | Internal Server Error |

---

# 2. User Registration

### Endpoint

```
POST /register
```

### Description

Registers a new user (Administrator only).

### Request Body

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "Researcher"
}
```

### Success Response

```json
{
  "message": "User Registered Successfully"
}
```

---

# 3. User Logout

### Endpoint

```
POST /logout
```

### Description

Logs out the current authenticated user.

### Success Response

```json
{
  "message": "Logout Successful"
}
```

---

# Authentication Summary

| API | Method | Purpose |
|-----|--------|---------|
| /login | POST | Authenticate user |
| /register | POST | Register new user |
| /logout | POST | Logout user |