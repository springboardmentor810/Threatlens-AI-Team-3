import { useEffect, useState } from "react";
import "./App.css";
import StatCard from "../components/StatCard";

const API_URL = "http://127.0.0.1:8000";

function App() {
  const [activePage, setActivePage] = useState("Dashboard");
  const [selectedFile, setSelectedFile] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [analysisHistory, setAnalysisHistory] = useState([]);
  const [error, setError] = useState("");

  const menuItems = [
    { name: "Dashboard", icon: "▦" },
    { name: "Analyze File", icon: "⌁" },
    { name: "Reports", icon: "▤" },
    { name: "Alerts", icon: "⚠" },
  ];

  useEffect(() => {
    loadAnalysisHistory();
  }, []);

  const loadAnalysisHistory = async () => {
    try {
      const response = await fetch(`${API_URL}/analysis/history`);

      if (!response.ok) {
        throw new Error("Could not load history");
      }

      const result = await response.json();

      setAnalysisHistory(result.data || []);
    } catch (error) {
      console.error("History error:", error);
      setAnalysisHistory([]);
    }
  };

  const handleAnalyze = async () => {
    if (!selectedFile) {
      setError("Please select a file first.");
      return;
    }

    setError("");
    setIsAnalyzing(true);
    setAnalysisResult(null);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      const response = await fetch(`${API_URL}/analysis/`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Analysis failed");
      }

      console.log("REAL ANALYSIS RESULT:", data);

      setAnalysisResult(data);

      setAnalysisHistory((previous) => [data, ...previous]);
    } catch (error) {
      console.error("Analysis error:", error);

      setError(
        error.message || "Unable to analyze the file."
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  const isMalware =
    analysisResult?.verdict?.toUpperCase() === "MALWARE";

  const malwareCount = analysisHistory.filter(
    (item) => item.verdict?.toUpperCase() === "MALWARE"
  ).length;

  const benignCount = analysisHistory.filter(
    (item) => item.verdict?.toUpperCase() === "BENIGN"
  ).length;

  const highRiskCount = analysisHistory.filter(
    (item) => item.risk === "HIGH"
  ).length;

  return (
    <div className="app">

      {/* ================= SIDEBAR ================= */}

      <aside className="sidebar">

        <div className="logo">
          <div className="logo-icon">
            🛡
          </div>

          <div>
            <h2>ThreatLens</h2>
            <span>AI SECURITY</span>
          </div>
        </div>

        <nav>
          {menuItems.map((item) => (
            <button
              key={item.name}
              className={`nav-item ${
                activePage === item.name ? "active" : ""
              }`}
              onClick={() => setActivePage(item.name)}
            >
              <span>{item.icon}</span>
              {item.name}
            </button>
          ))}
        </nav>

        <div className="sidebar-bottom">

          <div className="system-status">
            <span className="status-dot"></span>

            <div>
              <strong>System Online</strong>
              <small>AI Engine Active</small>
            </div>
          </div>

          <div className="user">

            <div className="avatar">
              C
            </div>

            <div>
              <strong>Catherine</strong>
              <small>Security Analyst</small>
            </div>

          </div>

        </div>

      </aside>


      {/* ================= MAIN ================= */}

      <main className="main">

        {/* TOPBAR */}

        <header className="topbar">

          <div>
            <p className="eyebrow">
              SECURITY OPERATIONS
            </p>

            <h1>
              {activePage}
            </h1>
          </div>

          <div className="top-actions">

            <button className="icon-button">
              🔔
            </button>

            <button className="profile-button">
              <span className="avatar small">
                C
              </span>

              Catherine
            </button>

          </div>

        </header>


        {/* =====================================================
            DASHBOARD
        ===================================================== */}

        {activePage === "Dashboard" && (
          <section className="content">

            <div className="welcome">

              <p className="eyebrow">
                THREATLENS AI
              </p>

              <h2>
                Welcome back, Catherine 👋
              </h2>

              <p>
                Monitor your security analysis
                and threat detection activity.
              </p>

            </div>


            <div className="dashboard-stats">

              <div className="stats-grid">

                <StatCard
                  title="Files Analyzed"
                  value={analysisHistory.length}
                  subtitle="Total analyses"
                  icon="◉"
                />

                <StatCard
                  title="Threats Detected"
                  value={malwareCount}
                  subtitle="Malicious files"
                  icon="⚠"
                />

                <StatCard
                  title="Benign Files"
                  value={benignCount}
                  subtitle="Safe files"
                  icon="✓"
                />

                <StatCard
                  title="High Risk"
                  value={highRiskCount}
                  subtitle="Require attention"
                  icon="!"
                />

              </div>


              <button
                className="analyze-cta"
                onClick={() =>
                  setActivePage("Analyze File")
                }
              >

                <span className="cta-icon">
                  +
                </span>

                <span className="cta-content">

                  <strong>
                    Analyze New File
                  </strong>

                  <small>
                    Scan an executable
                    for threats
                  </small>

                </span>

                <span className="cta-arrow">
                  →
                </span>

              </button>

            </div>


            <div className="dashboard-grid">

              {/* RECENT ANALYSIS */}

              <div className="panel">

                <div className="panel-header">

                  <div>
                    <h3>
                      Threat Detection
                    </h3>

                    <p>
                      Recent malware
                      analysis activity
                    </p>
                  </div>

                  <span className="live-badge">
                    ● LIVE
                  </span>

                </div>


                {analysisHistory.length === 0 ? (

                  <div className="empty-state">

                    <div className="empty-icon">
                      🔍
                    </div>

                    <h3>
                      No analysis data yet
                    </h3>

                    <p>
                      Upload a file to run
                      ThreatLens analysis.
                    </p>

                    <button
                      className="secondary-button"
                      onClick={() =>
                        setActivePage("Analyze File")
                      }
                    >
                      Analyze a File
                    </button>

                  </div>

                ) : (

                  <div className="recent-analysis-list">

                    {analysisHistory
                      .slice(0, 5)
                      .map((item) => {

                        const malware =
                          item.verdict?.toUpperCase() ===
                          "MALWARE";

                        return (
                          <div
                            className="recent-analysis"
                            key={item.id}
                          >

                            <div
                              className={`recent-icon ${
                                malware
                                  ? "malware-icon"
                                  : "benign-icon"
                              }`}
                            >
                              {malware ? "⚠" : "✓"}
                            </div>


                            <div className="recent-info">

                              <strong>
                                {item.fileName}
                              </strong>

                              <span>
                                {item.algorithm}
                                {" • "}
                                {item.confidence}
                              </span>

                            </div>


                            <span
                              className={`recent-verdict ${
                                malware
                                  ? "malware"
                                  : "benign"
                              }`}
                            >
                              {item.verdict}
                            </span>


                            <button
                              className="recent-view"
                              onClick={() => {
                                setAnalysisResult(item);
                                setActivePage("Analyze File");
                              }}
                            >
                              View →
                            </button>

                          </div>
                        );
                      })}

                  </div>
                )}

              </div>


              {/* AI ENGINE */}

              <div className="panel">

                <div className="panel-header">

                  <div>

                    <h3>
                      AI Engine
                    </h3>

                    <p>
                      ThreatLens
                      analysis engine
                    </p>

                  </div>

                </div>


                <div className="ai-status">

                  <div className="ai-circle">
                    AI
                  </div>

                  <h3>
                    ThreatLens Engine
                  </h3>

                  <span className="online">
                    ● Operational
                  </span>

                  <p>
                    PE Static Analysis + YARA
                    <br />
                    Hashing • Entropy • API Analysis
                  </p>

                </div>

              </div>

            </div>

          </section>
        )}


        {/* =====================================================
            ANALYZE FILE
        ===================================================== */}

        {activePage === "Analyze File" && (
          <section className="content">

            <div className="page-heading">

              <p className="eyebrow">
                THREAT ANALYSIS
              </p>

              <h2>
                Analyze a File
              </h2>

              <p>
                Upload a Windows executable
                and let ThreatLens analyze it.
              </p>

            </div>


            {/* UPLOAD */}

            {!isAnalyzing && !analysisResult && (

              <div className="upload-panel">

                <div className="upload-icon">
                  ↑
                </div>

                <h2>
                  Drop your file here
                </h2>

                <p>
                  or choose a file
                  from your computer
                </p>


                <label className="upload-button">

                  Choose File

                  <input
                    type="file"
                    hidden
                    accept=".exe,.dll,.sys"
                    onChange={(event) => {

                      const file =
                        event.target.files[0];

                      if (file) {
                        setSelectedFile(file);
                        setError("");
                      }

                    }}
                  />

                </label>


                {selectedFile && (

                  <div className="selected-file">

                    <strong>
                      Selected file:
                    </strong>

                    <p>
                      {selectedFile.name}
                    </p>

                    <small>
                      {(selectedFile.size / 1024).toFixed(2)}
                      {" KB"}
                    </small>


                    <button
                      className="analyze-button"
                      onClick={handleAnalyze}
                    >
                      Analyze File
                    </button>

                  </div>

                )}


                {error && (
                  <p className="error-message">
                    {error}
                  </p>
                )}


                <small>
                  Supported: Windows PE
                  executables • PE static
                  threat analysis
                </small>

              </div>

            )}


            {/* ANALYZING */}

            {isAnalyzing && (

              <div className="analysis-panel">

                <div className="analysis-loader">
                  AI
                </div>

                <h2>
                  Analyzing File...
                </h2>

                <p>
                  ThreatLens is extracting
                  file information and evaluating
                  potential threats.
                </p>


                <div className="analysis-steps">

                  <div>
                    ✓ File received
                  </div>

                  <div>
                    ✓ Calculating SHA-256 hash
                  </div>

                  <div>
                    → Performing PE static analysis
                  </div>

                  <div>
                    ○ Calculating threat score
                  </div>

                </div>

              </div>

            )}


            {/* =================================================
                ANALYSIS RESULT
            ================================================= */}

            {analysisResult && (

              <div className="result-page">

                {/* RESULT HEADER */}

                <div className="result-top">

                  <div>

                    <p className="eyebrow">
                      ANALYSIS COMPLETE
                    </p>

                    <h2>
                      {analysisResult.fileName}
                    </h2>

                    <p className="result-subtitle">
                      Threat analysis completed
                      successfully
                    </p>

                  </div>


                  <span className="result-status">
                    ● ANALYZED
                  </span>

                </div>


                {/* VERDICT */}

                <div className="verdict-card">

                  <div
                    className={`verdict-icon ${
                      isMalware
                        ? "danger"
                        : "safe"
                    }`}
                  >
                    {isMalware ? "⚠" : "✓"}
                  </div>

                  <p className="verdict-label">
                    THREAT VERDICT
                  </p>

                  <h1>
                    {analysisResult.verdict}
                  </h1>

                  <p className="confidence">
                    {analysisResult.confidence}
                    {" confidence"}
                  </p>


                  <div className="threat-score">

                    <span>
                      Threat Score
                    </span>

                    <strong>
                      {analysisResult.threatScore ?? 0}/100
                    </strong>

                  </div>

                </div>


                {/* FILE INFORMATION */}

                <div className="result-section">

                  <div className="section-title">

                    <span>
                      ▣
                    </span>

                    <div>

                      <h3>
                        File Information
                      </h3>

                      <p>
                        Information extracted
                        from the analyzed file
                      </p>

                    </div>

                  </div>


                  <div className="details-grid">

                    <div className="detail-item">

                      <span>
                        File Name
                      </span>

                      <strong>
                        {analysisResult.fileName}
                      </strong>

                    </div>


                    <div className="detail-item">

                      <span>
                        File Extension
                      </span>

                      <strong>
                        .{analysisResult.extension}
                      </strong>

                    </div>


                    <div className="detail-item">

                      <span>
                        File Size
                      </span>

                      <strong>
                        {(
                          analysisResult.fileSize / 1024
                        ).toFixed(2)}
                        {" KB"}
                      </strong>

                    </div>


                    <div className="detail-item">

                      <span>
                        SHA-256 Hash
                      </span>

                      <strong className="hash-value">
                        {analysisResult.sha256}
                      </strong>

                    </div>


                    <div className="detail-item">

                      <span>
                        Risk Level
                      </span>

                      <strong>
                        {analysisResult.risk}
                      </strong>

                    </div>


                    <div className="detail-item">

                      <span>
                        Analysis Time
                      </span>

                      <strong>
                        {analysisResult.analyzedAt}
                      </strong>

                    </div>

                  </div>

                </div>


                {/* DETECTION FINDINGS */}

                <div className="result-section">

                  <div className="section-title">

                    <span>
                      ⚠
                    </span>

                    <div>

                      <h3>
                        Detection Findings
                      </h3>

                      <p>
                        Indicators identified
                        during analysis
                      </p>

                    </div>

                  </div>


                  {analysisResult.reasons?.length > 0 ? (

                    <div className="findings-list">

                      {analysisResult.reasons.map(
                        (reason, index) => (

                          <div
                            className="finding-item"
                            key={index}
                          >

                            <span>
                              ⚠
                            </span>

                            <p>
                              {reason}
                            </p>

                          </div>

                        )
                      )}

                    </div>

                  ) : (

                    <div className="finding-item safe-finding">

                      <span>
                        ✓
                      </span>

                      <p>
                        No significant suspicious
                        indicators were detected.
                      </p>

                    </div>

                  )}

                </div>


                {/* PE ANALYSIS */}

                <div className="result-section">

                  <div className="section-title">

                    <span>
                      ▣
                    </span>

                    <div>

                      <h3>
                        PE Analysis
                      </h3>

                      <p>
                        Windows executable
                        structural analysis
                      </p>

                    </div>

                  </div>


                  <div className="details-grid">

                    <div className="detail-item">

                      <span>
                        PE File
                      </span>

                      <strong>
                        {analysisResult.isPE
                          ? "Yes"
                          : "No"}
                      </strong>

                    </div>


                    <div className="detail-item">

                      <span>
                        Architecture
                      </span>

                      <strong>
                        {analysisResult.architecture ||
                          "Unknown"}
                      </strong>

                    </div>


                    <div className="detail-item">

                      <span>
                        Entry Point
                      </span>

                      <strong>
                        {analysisResult.entryPoint ||
                          "N/A"}
                      </strong>

                    </div>


                    <div className="detail-item">

                      <span>
                        Image Base
                      </span>

                      <strong>
                        {analysisResult.imageBase ||
                          "N/A"}
                      </strong>

                    </div>


                    <div className="detail-item">

                      <span>
                        Sections
                      </span>

                      <strong>
                        {analysisResult.sectionCount ?? 0}
                      </strong>

                    </div>


                    <div className="detail-item">

                      <span>
                        Average Entropy
                      </span>

                      <strong>
                        {analysisResult.entropy ?? 0}
                      </strong>

                    </div>

                  </div>

                </div>


                {/* AI / ANALYSIS INFORMATION */}

                <div className="result-section">

                  <div className="section-title">

                    <span>
                      ◈
                    </span>

                    <div>

                      <h3>
                        AI Analysis
                      </h3>

                      <p>
                        Analysis performed
                        by ThreatLens
                      </p>

                    </div>

                  </div>


                  <div className="details-grid">

                    <div className="detail-item">

                      <span>
                        Feature Extractor
                      </span>

                      <strong>
                        {analysisResult.extractor ||
                          "PE / Static Analysis"}
                      </strong>

                    </div>


                    <div className="detail-item">

                      <span>
                        Features Analyzed
                      </span>

                      <strong>
                        {analysisResult.features ?? "N/A"}
                      </strong>

                    </div>


                    <div className="detail-item">

                      <span>
                        Classification Model
                      </span>

                      <strong>
                        {analysisResult.algorithm ||
                          "ThreatLens Analysis"}
                      </strong>

                    </div>


                    <div className="detail-item">

                      <span>
                        Classification
                      </span>

                      <strong>
                        Malware / Benign
                      </strong>

                    </div>

                  </div>

                </div>


                {/* SECURITY MESSAGE */}

                <div
                  className={`security-message ${
                    isMalware
                      ? "danger-message"
                      : ""
                  }`}
                >

                  <div className="security-icon">

                    {isMalware
                      ? "⚠"
                      : "✓"}

                  </div>


                  <div>

                    <strong>

                      {isMalware
                        ? "Potential threat detected"
                        : "No immediate threat detected"}

                    </strong>


                    <p>

                      {isMalware
                        ? "ThreatLens classified this file as potentially malicious. Avoid executing the file and investigate the threat."
                        : "ThreatLens classified this file as benign. Continue to exercise caution when executing unknown files."}

                    </p>

                  </div>

                </div>


                {/* ACTION */}

                <div className="result-actions">

                  <button
                    className="secondary-button"
                    onClick={() => {

                      setSelectedFile(null);
                      setAnalysisResult(null);
                      setError("");

                    }}
                  >
                    Analyze Another File
                  </button>

                </div>

              </div>

            )}

          </section>
        )}


        {/* =====================================================
            REPORTS
        ===================================================== */}

        {activePage === "Reports" && (

          <section className="content">

            <div className="page-heading">

              <p className="eyebrow">
                SECURITY REPORTS
              </p>

              <h2>
                Analysis Reports
              </h2>

              <p>
                Review all files analyzed
                by ThreatLens.
              </p>

            </div>


            {analysisHistory.length === 0 ? (

              <div className="empty-page">

                <div>
                  ▤
                </div>

                <h2>
                  No reports yet
                </h2>

                <p>
                  Analyze a file to generate
                  your first security report.
                </p>

              </div>

            ) : (

              <div className="reports-container">

                <div className="reports-header">

                  <div>

                    <h3>
                      Analysis History
                    </h3>

                    <p>
                      {analysisHistory.length}
                      {" file(s) analyzed"}
                    </p>

                  </div>

                </div>


                <div className="reports-list">

                  {analysisHistory.map(
                    (report) => {

                      const malware =
                        report.verdict?.toUpperCase() ===
                        "MALWARE";

                      return (

                        <div
                          className="report-card"
                          key={report.id}
                        >

                          <div className="report-file-icon">

                            {malware
                              ? "⚠"
                              : "✓"}

                          </div>


                          <div className="report-main">

                            <strong>
                              {report.fileName}
                            </strong>

                            <span>

                              {report.algorithm}
                              {" • "}
                              {report.features}
                              {" features"}

                            </span>

                          </div>


                          <div
                            className={`report-verdict ${
                              malware
                                ? "malware"
                                : "benign"
                            }`}
                          >
                            {report.verdict}
                          </div>


                          <div className="report-confidence">

                            <span>
                              Confidence
                            </span>

                            <strong>
                              {report.confidence}
                            </strong>

                          </div>


                          <button
                            className="view-report-button"
                            onClick={() => {

                              setAnalysisResult(report);
                              setActivePage("Analyze File");

                            }}
                          >
                            View Report →
                          </button>

                        </div>

                      );

                    }
                  )}

                </div>

              </div>

            )}

          </section>

        )}


        {/* =====================================================
            ALERTS
        ===================================================== */}

        {activePage === "Alerts" && (

          <section className="content">

            <div className="page-heading">

              <p className="eyebrow">
                THREAT MONITORING
              </p>

              <h2>
                Alerts
              </h2>

              <p>
                Monitor potentially malicious
                files detected by ThreatLens.
              </p>

            </div>


            {malwareCount === 0 ? (

              <div className="empty-page">

                <div>
                  ✓
                </div>

                <h2>
                  No active alerts
                </h2>

                <p>
                  ThreatLens has not detected
                  any active threats.
                </p>

              </div>

            ) : (

              <div className="alerts-list">

                {analysisHistory
                  .filter(
                    (item) =>
                      item.verdict?.toUpperCase() ===
                      "MALWARE"
                  )
                  .map((alert) => (

                    <div
                      className="alert-card"
                      key={alert.id}
                    >

                      <div className="alert-icon">
                        ⚠
                      </div>


                      <div className="alert-content">

                        <h3>
                          Potential Malware
                          Detected
                        </h3>


                        <p>

                          <strong>
                            {alert.fileName}
                          </strong>

                          {" was classified as malicious by ThreatLens."}

                        </p>


                        <div className="alert-meta">

                          <span>
                            Confidence:
                            {" "}
                            {alert.confidence}
                          </span>

                          <span>
                            Model:
                            {" "}
                            {alert.algorithm}
                          </span>

                          <span>
                            Risk:
                            {" "}
                            {alert.risk}
                          </span>

                        </div>

                      </div>


                      <div className="alert-actions">

                        <span className="threat-badge">

                          {alert.risk}
                          {" RISK"}

                        </span>


                        <button
                          className="investigate-button"
                          onClick={() => {

                            setAnalysisResult(alert);
                            setActivePage("Analyze File");

                          }}
                        >
                          Investigate →
                        </button>

                      </div>

                    </div>

                  ))}

              </div>

            )}

          </section>

        )}

      </main>

    </div>
  );
}

export default App;