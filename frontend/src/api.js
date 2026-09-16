const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

function getAuthToken() {
  return (
    localStorage.getItem("access_token") ||
    localStorage.getItem("token") ||
    localStorage.getItem("authToken") ||
    ""
  );
}

function buildHeaders(includeJson = false) {
  const headers = {};

  if (includeJson) {
    headers["Content-Type"] = "application/json";
  }

  const token = getAuthToken();

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  return headers;
}

async function parseResponse(response) {
  const contentType = response.headers.get("content-type") || "";

  let data;

  if (contentType.includes("application/json")) {
    data = await response.json();
  } else {
    const text = await response.text();
    data = text ? { detail: text } : {};
  }

  if (!response.ok) {
    const message =
      data?.detail ||
      data?.message ||
      data?.error ||
      `Request failed with status ${response.status}`;

    throw new Error(message);
  }

  return data;
}

/* =========================
   AUTHENTICATION
   ========================= */

export async function loginUser(username, password) {
  const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: buildHeaders(true),
    body: JSON.stringify({
      username,
      password,
    }),
  });

  const data = await parseResponse(response);

  if (data.access_token) {
    localStorage.setItem("access_token", data.access_token);
  }

  if (data.refresh_token) {
    localStorage.setItem("refresh_token", data.refresh_token);
  }

  if (data.user) {
    localStorage.setItem("user", JSON.stringify(data.user));
  }

  return data;
}

export async function getCurrentUser() {
  const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
    method: "GET",
    headers: buildHeaders(false),
  });

  return parseResponse(response);
}

export async function logoutUser() {
  const token = getAuthToken();

  if (!token) {
    clearAuthData();
    return {
      status: "success",
      message: "Logged out locally.",
    };
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/logout`, {
      method: "POST",
      headers: buildHeaders(false),
    });

    const data = await parseResponse(response);

    clearAuthData();

    return data;
  } catch (error) {
    clearAuthData();
    throw error;
  }
}

export function clearAuthData() {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
  localStorage.removeItem("token");
  localStorage.removeItem("authToken");
  localStorage.removeItem("user");
}

/* =========================
   FILE UPLOAD + SCAN
   ========================= */

export async function uploadAndScanFile(file) {
  if (!(file instanceof File)) {
    throw new Error("A valid file is required.");
  }

  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${API_BASE_URL}/api/upload/scan`, {
    method: "POST",
    headers: buildHeaders(false),
    body: formData,
  });

  return parseResponse(response);
}

/* =========================
   ASYNC SCAN
   ========================= */

export async function uploadFileAsync(file) {
  if (!(file instanceof File)) {
    throw new Error("A valid file is required.");
  }

  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${API_BASE_URL}/api/upload/scan/async`, {
    method: "POST",
    headers: buildHeaders(false),
    body: formData,
  });

  return parseResponse(response);
}

/* =========================
   SCAN HISTORY
   ========================= */

export async function getScanHistory() {
  const response = await fetch(`${API_BASE_URL}/api/upload/scans`, {
    method: "GET",
    headers: buildHeaders(false),
  });

  return parseResponse(response);
}

export async function getScanDetail(scanId) {
  if (!scanId) {
    throw new Error("A scan ID is required.");
  }

  const response = await fetch(
    `${API_BASE_URL}/api/upload/scans/${encodeURIComponent(scanId)}`,
    {
      method: "GET",
      headers: buildHeaders(false),
    }
  );

  return parseResponse(response);
}

/* =========================
   NORMALIZE SCAN RESULT
   ========================= */

export function normalizeScanResult(scanResult, originalFile = null) {
  const result = scanResult || {};

  const staticAnalysis = result.static_analysis || {};
  const ml = staticAnalysis.ml_engine || {};

  const yaraMatches = Array.isArray(staticAnalysis.yara_matches)
    ? staticAnalysis.yara_matches
    : [];

  const suspiciousIndicators = Array.isArray(
    staticAnalysis.suspicious_indicators
  )
    ? staticAnalysis.suspicious_indicators
    : [];

  const prediction =
    ml.prediction ||
    result.detection?.verdict ||
    "PENDING";

  const malwareProbability =
    ml.malware_probability ?? null;

  const benignProbability =
    ml.benign_probability ?? null;

  const riskLevel =
    ml.risk_level ||
    getRiskLevelFromScore(result.detection?.risk_score);

  const scanStatus =
    result.scan_status ||
    result.status ||
    "SUCCESS";

  const sha256 =
    result.hashes?.sha256 ||
    "";

  const fileSize =
    result.file_size ??
    originalFile?.size ??
    0;

  const fileName =
    result.filename ||
    originalFile?.name ||
    "";

  return {
    scan_id: result.scan_id || "",

    engine: {
      name: "EMBER Malware Detection Engine",
      version: "1.0.0",
      model: "LightGBM",
      yara_enabled: true,
    },

    file: {
      name: fileName,
      sha256,
      size_bytes: fileSize,
      file_type: result.file_type || "",
    },

    ml: {
      prediction,
      malware_probability: malwareProbability,
      benign_probability: benignProbability,
      risk_level: riskLevel,
    },

    yara: {
      matched: yaraMatches.length > 0,
      matched_rules: yaraMatches,
      rule_count: yaraMatches.length,
    },

    detection: {
      verdict: result.detection?.verdict || prediction,
      risk_score: result.detection?.risk_score ?? null,
      recommended_action:
        result.detection?.recommended_action || "",
    },

    scan_status: scanStatus,

    timestamp:
      result.timestamp ||
      new Date().toISOString(),

    suspicious_indicators: suspiciousIndicators,

    uploaded_by:
      result.uploaded_by || "",

    error:
      result.error ||
      "",
  };
}

/* =========================
   RISK LEVEL HELPER
   ========================= */

function getRiskLevelFromScore(score) {
  if (score === null || score === undefined) {
    return "PENDING";
  }

  if (score >= 90) {
    return "CRITICAL";
  }

  if (score >= 70) {
    return "HIGH";
  }

  if (score >= 40) {
    return "MEDIUM";
  }

  return "LOW";
}

export { API_BASE_URL };