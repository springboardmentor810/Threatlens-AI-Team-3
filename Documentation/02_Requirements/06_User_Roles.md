# User Roles

## Introduction

The ThreatLens AI system supports role-based access control (RBAC) to ensure that users can only access features and resources relevant to their responsibilities. Each role has a predefined set of permissions that helps maintain system security and efficient workflow management.

---

# 1. Administrator

## Responsibilities

- Manage user accounts
- Assign user roles
- Configure system settings
- Manage YARA rules
- Monitor system activities
- View all reports and dashboards
- Manage alerts and notifications

## Permissions

| Permission | Access |
|------------|--------|
| Login | ✅ |
| Manage Users | ✅ |
| Assign Roles | ✅ |
| Upload Files | ✅ |
| View Dashboard | ✅ |
| View Reports | ✅ |
| Manage Alerts | ✅ |
| Configure System | ✅ |

---

# 2. Security Analyst

## Responsibilities

- Upload suspicious files
- Perform malware analysis
- Review analysis results
- Generate reports
- Monitor threats

## Permissions

| Permission | Access |
|------------|--------|
| Login | ✅ |
| Upload Files | ✅ |
| Static Analysis | ✅ |
| View YARA Results | ✅ |
| View ML Predictions | ✅ |
| Generate Reports | ✅ |
| View Dashboard | ✅ |
| View Alerts | ✅ |

---

# 3. SOC Team Member

## Responsibilities

- Monitor security events
- Review malware incidents
- Track active threats
- View dashboards and reports

## Permissions

| Permission | Access |
|------------|--------|
| Login | ✅ |
| View Dashboard | ✅ |
| View Reports | ✅ |
| Monitor Alerts | ✅ |
| Track Threats | ✅ |

---

# 4. Researcher

## Responsibilities

- Upload malware samples
- Analyze malware families
- Review prediction results
- Export research reports

## Permissions

| Permission | Access |
|------------|--------|
| Login | ✅ |
| Upload Files | ✅ |
| View Analysis Results | ✅ |
| Export Reports | ✅ |
| View Dashboard | ✅ |

---

# Role Summary

| Role | Primary Responsibility |
|------|------------------------|
| Administrator | Manage users, system settings, and platform administration |
| Security Analyst | Perform malware analysis and generate reports |
| SOC Team Member | Monitor threats, incidents, and security alerts |
| Researcher | Analyze malware samples and support cybersecurity research |