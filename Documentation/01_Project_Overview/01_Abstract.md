Abstract
ThreatLens AI: Malware Classification & Threat Detection System

The rapid growth of malware attacks and evolving cyber threats has made traditional signature-based detection methods insufficient for identifying modern and unknown malware variants. Organizations require intelligent security solutions that can automatically analyze suspicious files, detect malicious behavior, and provide actionable threat intelligence with minimal human intervention.

ThreatLens AI is an AI-powered malware classification and threat detection platform designed to automate static malware analysis, malware family classification, and threat monitoring. The system enables security analysts to upload suspicious executable files for analysis, extract important static features such as file hashes, metadata, Portable Executable (PE) header information, imported APIs, embedded strings, and suspicious indicators, and compare them against YARA signatures to identify known malware.

For files that do not match existing signatures, the platform employs a machine learning model trained on the EMBER malware dataset to classify unknown malware samples, predict malware families, calculate a threat risk score, and estimate classification confidence. The generated analysis results are securely stored for future investigation and displayed through an interactive security analytics dashboard.

The platform integrates multiple cybersecurity components, including user authentication, static file analysis, YARA rule matching, AI-based malware classification, threat monitoring, reporting, and security analytics. It is developed using React.js for the frontend, FastAPI/Flask for the backend, PostgreSQL and MongoDB for data storage, Scikit-learn/LightGBM for machine learning, and Docker for deployment.

ThreatLens AI aims to improve malware detection accuracy, reduce analysis time, support Security Operations Center (SOC) analysts in incident investigation, and provide a scalable foundation for enterprise cybersecurity monitoring and malware research. The project demonstrates the integration of artificial intelligence and cybersecurity to build an efficient, intelligent, and user-friendly malware detection platform capable of identifying both known and previously unseen threats. This aligns with the project's stated objective of combining static analysis, YARA-based detection, AI/ML classification, reporting, and analytics into an end-to-end malware detection workflow.

