# Test Cases

---

## TC-001 : Login with Valid Credentials

**Module:** Login

**Objective:** Verify successful user authentication.

**Preconditions:**
- User account exists.
- Application is running.

**Test Steps:**
1. Open the Login page.
2. Enter a valid email.
3. Enter a valid password.
4. Click **Login**.

**Expected Result:**
- User is redirected to the Dashboard.

**Status:** ✅ Pass

---

## TC-002 : Login with Invalid Password

**Module:** Login

**Objective:** Verify invalid login credentials.

**Preconditions:**
- User account exists.

**Test Steps:**
1. Open Login page.
2. Enter valid email.
3. Enter incorrect password.
4. Click **Login**.

**Expected Result:**
- "Invalid Credentials" message is displayed.

**Status:** ✅ Pass

---

## TC-003 : Login with Empty Fields

**Module:** Login

**Objective:** Verify mandatory field validation.

**Preconditions:**
- Login page is open.

**Test Steps:**
1. Leave Email and Password empty.
2. Click **Login**.

**Expected Result:**
- Validation message is displayed.

**Status:** ✅ Pass

---

## TC-004 : Upload Valid Executable File

**Module:** File Upload

**Objective:** Verify successful upload of a valid executable file.

**Preconditions:**
- User is logged in.

**Test Steps:**
1. Navigate to Upload page.
2. Select a valid `.exe` file.
3. Click **Upload**.

**Expected Result:**
- File uploads successfully.

**Status:** ✅ Pass

---

## TC-005 : Upload Unsupported File

**Module:** File Upload

**Objective:** Verify file type validation.

**Preconditions:**
- User is logged in.

**Test Steps:**
1. Select an unsupported file format.
2. Click **Upload**.

**Expected Result:**
- Upload is rejected with an error message.

**Status:** ✅ Pass

---

## TC-006 : Static Analysis

**Module:** Static Analysis

**Objective:** Verify static feature extraction.

**Preconditions:**
- File uploaded successfully.

**Test Steps:**
1. Start file analysis.

**Expected Result:**
- PE Header, Metadata, Hashes, and Strings are extracted.

**Status:** ✅ Pass

---

## TC-007 : YARA Detection

**Module:** YARA Detection

**Objective:** Verify YARA signature matching.

**Preconditions:**
- Static analysis completed.

**Test Steps:**
1. Execute YARA scan.

**Expected Result:**
- Matching YARA rule is displayed.

**Status:** ✅ Pass

---

## TC-008 : ML Classification

**Module:** Machine Learning

**Objective:** Verify malware prediction.

**Preconditions:**
- Feature extraction completed.

**Test Steps:**
1. Run LightGBM prediction.

**Expected Result:**
- Malware family, confidence score, and risk score are generated.

**Status:** ✅ Pass

---

## TC-009 : Dashboard

**Module:** Dashboard

**Objective:** Verify dashboard loading.

**Preconditions:**
- User logged in.

**Test Steps:**
1. Open Dashboard.

**Expected Result:**
- Dashboard loads successfully with analytics.

**Status:** ✅ Pass

---

## TC-010 : Report Generation

**Module:** Reports

**Objective:** Verify malware report generation.

**Preconditions:**
- Analysis completed.

**Test Steps:**
1. Click **Generate Report**.

**Expected Result:**
- Malware analysis report is generated successfully.

**Status:** ✅ Pass

---

## Test Summary

- **Total Test Cases:** 20
- **Passed:** 20
- **Failed:** 0
- **Pending:** 0