# Frequently Asked Questions (FAQ)

## Introduction

This document provides answers to common questions related to the installation, usage, and troubleshooting of the ThreatLens AI system.

---

## Q1. What is ThreatLens AI?

**Answer:**

ThreatLens AI is an AI-powered malware classification and threat detection platform that uses static file analysis, YARA rule matching, and machine learning to identify and classify malicious executable files.

---

## Q2. Which file types are supported?

**Answer:**

Currently, the system supports Windows executable files (`.exe`) for malware analysis.

---

## Q3. How do I upload a file?

**Answer:**

1. Login to the system.
2. Open the **Upload** page.
3. Select a valid `.exe` file.
4. Click the **Upload** button.
5. Wait for the analysis to complete.

---

## Q4. What happens after uploading a file?

**Answer:**

The system automatically performs:

- Static File Analysis
- YARA Rule Matching
- Machine Learning Classification
- Risk Score Generation
- Report Generation
- Dashboard Update

---

## Q5. What is a Risk Score?

**Answer:**

A Risk Score indicates the likelihood that the uploaded file is malicious. Higher scores represent higher security risks.

---

## Q6. What is a Confidence Score?

**Answer:**

The Confidence Score represents how confident the machine learning model is in its malware classification prediction.

---

## Q7. Can I download malware analysis reports?

**Answer:**

Yes. Reports can be viewed, downloaded, and exported from the **Reports** module.

---

## Q8. Why am I unable to upload a file?

**Answer:**

Possible reasons include:

- Unsupported file type
- File size exceeds the allowed limit
- Corrupted file
- Network or server issue

---

## Q9. What should I do if login fails?

**Answer:**

- Verify your email and password.
- Ensure your account is active.
- Contact the administrator if the issue persists.

---

## Q10. Who can use the system?

**Answer:**

The system supports the following user roles:

- Administrator
- Security Analyst
- SOC Team Member
- Researcher

Each role has different permissions based on its responsibilities.

---

# Troubleshooting

| Issue | Solution |
|--------|----------|
| Unable to Login | Verify credentials and contact the administrator. |
| Upload Failed | Check file format and size. |
| Dashboard Not Loading | Refresh the page or verify the backend service is running. |
| Report Not Generated | Wait for analysis to complete and try again. |
| No Alerts Displayed | Verify that malware detection has been completed. |

---

# Contact Support

For technical assistance, contact the system administrator or the development team.

Email: support@threatlens.ai

---

# Summary

The FAQ section helps users quickly resolve common issues and better understand the features and workflow of the ThreatLens AI system.