# Uploading Files

## Introduction

The File Upload module allows authorized users to upload suspicious executable (.exe) files for malware analysis. Uploaded files are validated before being processed by the static analysis engine, YARA engine, and machine learning model.

---

# Upload Procedure

### Step 1

Log in to the ThreatLens AI system.

---

### Step 2

Navigate to the **Upload** page from the dashboard.

---

### Step 3

Click the **Choose File** button.

---

### Step 4

Select a valid executable (.exe) file from your computer.

---

### Step 5

Click the **Upload** button.

---

### Step 6

The system validates the uploaded file.

Validation includes:

- File format
- File size
- File integrity

---

### Step 7

After successful validation, the file is stored securely and forwarded for malware analysis.

---

# Supported File Types

| File Type | Status |
|-----------|--------|
| .exe | Supported |
| .dll | Future Support |
| .zip | Not Supported |
| .pdf | Not Supported |
| .jpg | Not Supported |

---

# Validation Rules

- Only executable (.exe) files are accepted.
- Empty files are rejected.
- Corrupted files are rejected.
- Files exceeding the configured size limit are rejected.

---

# Upload Status

Possible upload statuses include:

- Upload Successful
- Upload Failed
- Invalid File Type
- File Too Large
- Validation Failed

---

# After Upload

Once the upload is successful, the system automatically:

1. Performs Static Analysis.
2. Executes YARA Rule Matching.
3. Runs Machine Learning Classification.
4. Generates Risk and Confidence Scores.
5. Stores the analysis results.
6. Displays the results on the Dashboard.

---

# Best Practices

- Upload only trusted samples for analysis.
- Ensure the file is not corrupted.
- Avoid uploading duplicate files.
- Verify the upload status before starting a new analysis.

---

# Summary

The File Upload module serves as the entry point for the malware detection workflow. It securely validates and stores executable files before initiating static analysis, YARA scanning, machine learning classification, and report generation.