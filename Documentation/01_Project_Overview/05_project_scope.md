# Project Scope

## Introduction

The scope of the ThreatLens AI project defines the features, functionalities, limitations, and future expansion possibilities of the proposed malware classification and threat detection platform. The project focuses on identifying malicious executable files through static analysis, YARA rule matching, and machine learning-based classification while providing security monitoring and reporting capabilities.

---

## In Scope

The current implementation of ThreatLens AI includes:

- User authentication and role-based access control.
- Uploading suspicious executable (.exe) files.
- Static file analysis.
- File metadata extraction.
- Cryptographic hash generation (MD5, SHA-256).
- Portable Executable (PE) header analysis.
- Import table analysis.
- String extraction.
- YARA rule matching.
- Signature-based malware detection.
- Machine learning-based malware classification.
- Malware family prediction.
- Threat risk score generation.
- Confidence score calculation.
- Malware analysis report generation.
- Threat monitoring dashboard.
- Security alerts and notifications.
- Malware analytics and reporting.
- Secure storage of analysis results.

---

## Out of Scope

The following features are outside the scope of the current version:

- Dynamic malware analysis using sandbox environments.
- Runtime memory analysis.
- Live endpoint protection.
- Automatic malware removal.
- Network packet inspection.
- Mobile malware detection.
- Linux and macOS executable analysis.
- Cloud-scale distributed malware scanning.

---

## Target Users

The system is intended for:

- Security Analysts
- Security Operations Center (SOC) Teams
- Malware Researchers
- Cybersecurity Researchers
- System Administrators
- Educational Institutions

---

## Future Scope

Future versions may include:

- Dynamic malware analysis.
- Behavioral analysis.
- VirusTotal API integration.
- Threat intelligence feed integration.
- SIEM integration.
- Real-time endpoint monitoring.
- Continuous model retraining.
- Kubernetes-based cloud deployment.
- Support for multiple executable formats and operating systems.

---

## Project Limitations

- The system primarily analyzes Windows Portable Executable (PE) files.
- Detection accuracy depends on the quality of the machine learning model and training dataset.
- YARA detection is limited by the available rule set.
- Periodic model retraining is required to detect emerging malware variants effectively.