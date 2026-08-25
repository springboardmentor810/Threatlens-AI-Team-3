import { useState } from 'react'
import './App.css'

function App() {
  const [page, setPage] = useState('login')
  const [showPassword, setShowPassword] = useState(false)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('Analyst')
  const [selectedFile, setSelectedFile] = useState(null)
  const [analysisResult, setAnalysisResult] = useState(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [fileError, setFileError] = useState('')

  const handleLogin = (e) => {
    e.preventDefault()
    setPage('dashboard')
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]

    setFileError('')
    setAnalysisResult(null)

    if (!file) {
      setSelectedFile(null)
      return
    }

    const isExe = file.name.toLowerCase().endsWith('.exe')

    if (!isExe) {
      setSelectedFile(null)
      setFileError('Please select a Windows executable (.exe) file.')
      e.target.value = ''
      return
    }

    setSelectedFile(file)
  }

  const handleAnalyze = () => {
    if (!selectedFile || isAnalyzing) return

    setIsAnalyzing(true)
    setAnalysisResult(null)

    setTimeout(() => {
      const fileName = selectedFile.name.toLowerCase()

      const demoMalwareNames = [
        'sample.exe',
        'update.exe',
        'service.exe',
        'malware.exe',
        'virus.exe'
      ]

      const isDemoMalware = demoMalwareNames.includes(fileName)

      if (isDemoMalware) {
        setAnalysisResult({
          prediction: 'Malware',
          confidence: 91,
          risk: 'HIGH',
          status: 'Malware Detected',
          statusClass: 'danger'
        })
      } else {
        setAnalysisResult({
          prediction: 'Benign',
          confidence: 94,
          risk: 'LOW',
          status: 'No Threat Detected',
          statusClass: 'safe'
        })
      }

      setIsAnalyzing(false)
    }, 1500)
  }

  const handleLogout = () => {
    setPage('login')
    setSelectedFile(null)
    setAnalysisResult(null)
    setFileError('')
    setIsAnalyzing(false)
    setPassword('')
  }

  const goToPage = (targetPage) => {
    if (targetPage === 'upload') {
      setAnalysisResult(null)
      setFileError('')
    }

    setPage(targetPage)
  }

  return (
    <div className="app-shell">

      {page === 'login' && (
        <div className="login-page">

          <header className="brand-header">

            <div className="brand-icon">
              ◇
            </div>

            <div>
              <h1>ThreatLens AI</h1>
              <p>Intelligent Malware Detection</p>
            </div>

          </header>

          <main className="login-card">

            <div className="security-icon">
              ⌁
            </div>

            <h2>Welcome Back</h2>

            <p className="login-subtitle">
              Sign in to access your secure malware analysis workspace
            </p>

            <form onSubmit={handleLogin}>

              <label>USERNAME</label>

              <input
                type="text"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />

              <label>PASSWORD</label>

              <div className="password-wrapper">

                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />

                <button
                  type="button"
                  className="show-password"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>

              </div>

              <label>ROLE</label>

              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >
                <option>Analyst</option>
                <option>Admin</option>
                <option>Researcher</option>
              </select>

              <button
                className="primary-button"
                type="submit"
              >
                Sign In <span>→</span>
              </button>

            </form>

            <div className="secure-note">
              🔒 Secure access to ThreatLens AI
            </div>

          </main>

          <footer>
            ThreatLens AI • Malware Detection & Analysis Platform
          </footer>

        </div>
      )}

      {page === 'dashboard' && (
        <Dashboard
          username={username}
          role={role}
          goToPage={goToPage}
          handleLogout={handleLogout}
        />
      )}

      {page === 'upload' && (
        <UploadPage
          selectedFile={selectedFile}
          analysisResult={analysisResult}
          isAnalyzing={isAnalyzing}
          fileError={fileError}
          handleFileChange={handleFileChange}
          handleAnalyze={handleAnalyze}
          goToPage={goToPage}
        />
      )}

      {page === 'history' && (
        <HistoryPage
          username={username}
          role={role}
          goToPage={goToPage}
          handleLogout={handleLogout}
        />
      )}

      {page === 'alerts' && (
        <AlertsPage
          username={username}
          role={role}
          goToPage={goToPage}
          handleLogout={handleLogout}
        />
      )}

      {page === 'analytics' && (
        <AnalyticsPage
          username={username}
          role={role}
          goToPage={goToPage}
          handleLogout={handleLogout}
        />
      )}

      {page === 'reports' && (
        <ReportsPage
          username={username}
          role={role}
          goToPage={goToPage}
          handleLogout={handleLogout}
        />
      )}

      {page === 'profile' && (
        <ProfilePage
          username={username}
          role={role}
          goToPage={goToPage}
          handleLogout={handleLogout}
        />
      )}

    </div>
  )
}


/* =========================================================
   SIDEBAR
========================================================= */

function Sidebar({
  activePage,
  username,
  role,
  goToPage,
  handleLogout
}) {
  return (
    <aside className="sidebar">

      <div className="sidebar-brand">

        <div className="sidebar-logo">
          ◇
        </div>

        <div>
          <strong>ThreatLens</strong>
          <span>AI Security</span>
        </div>

      </div>

      <nav>

        <button
          className={`nav-item ${
            activePage === 'dashboard' ? 'active' : ''
          }`}
          onClick={() => goToPage('dashboard')}
        >
          <span>▦</span>
          Dashboard
        </button>

        <button
          className={`nav-item ${
            activePage === 'upload' ? 'active' : ''
          }`}
          onClick={() => goToPage('upload')}
        >
          <span>↑</span>
          Analyze File
        </button>

        <button
          className={`nav-item ${
            activePage === 'history' ? 'active' : ''
          }`}
          onClick={() => goToPage('history')}
        >
          <span>◉</span>
          Analysis History
        </button>

        <button
          className={`nav-item ${
            activePage === 'alerts' ? 'active' : ''
          }`}
          onClick={() => goToPage('alerts')}
        >
          <span>⚠</span>
          Alerts
        </button>

        <button
          className={`nav-item ${
            activePage === 'analytics' ? 'active' : ''
          }`}
          onClick={() => goToPage('analytics')}
        >
          <span>◒</span>
          Analytics
        </button>

        <button
          className={`nav-item ${
            activePage === 'reports' ? 'active' : ''
          }`}
          onClick={() => goToPage('reports')}
        >
          <span>▤</span>
          Reports
        </button>

        <button
          className={`nav-item ${
            activePage === 'profile' ? 'active' : ''
          }`}
          onClick={() => goToPage('profile')}
        >
          <span>●</span>
          Profile
        </button>

      </nav>

      <div className="sidebar-bottom">

        <div className="user-box">

          <div className="avatar">
            {username
              ? username.charAt(0).toUpperCase()
              : 'A'}
          </div>

          <div>
            <strong>
              {username || 'Analyst'}
            </strong>

            <span>
              {role}
            </span>
          </div>

        </div>

        <button
          className="logout-button"
          onClick={handleLogout}
        >
          ⇥ Logout
        </button>

      </div>

    </aside>
  )
}


/* =========================================================
   DASHBOARD
========================================================= */

function Dashboard({
  username,
  role,
  goToPage,
  handleLogout
}) {
  return (
    <div className="dashboard-page">

      <Sidebar
        activePage="dashboard"
        username={username}
        role={role}
        goToPage={goToPage}
        handleLogout={handleLogout}
      />

      <main className="dashboard-content">

        <header className="dashboard-header">

          <div>

            <p className="eyebrow">
              SECURITY OVERVIEW
            </p>

            <h1>
              Dashboard
            </h1>

            <p className="welcome-text">
              Monitor and analyze suspicious files from one workspace.
            </p>

          </div>

          <button
            className="analyze-button"
            onClick={() => goToPage('upload')}
          >
            <span>＋</span>
            New Analysis
          </button>

        </header>

        <section className="stat-grid">

          <div className="stat-card">

            <div className="stat-icon blue">
              ◈
            </div>

            <div>
              <span>Total Scans</span>
              <strong>128</strong>
              <small>Last 30 days</small>
            </div>

          </div>

          <div className="stat-card">

            <div className="stat-icon red">
              ⚠
            </div>

            <div>
              <span>Threats Detected</span>
              <strong>23</strong>
              <small>18% detection rate</small>
            </div>

          </div>

          <div className="stat-card">

            <div className="stat-icon green">
              ✓
            </div>

            <div>
              <span>Benign Files</span>
              <strong>105</strong>
              <small>82% of total scans</small>
            </div>

          </div>

          <div className="stat-card">

            <div className="stat-icon purple">
              ◷
            </div>

            <div>
              <span>Avg. Scan Time</span>
              <strong>1.8s</strong>
              <small>System performance</small>
            </div>

          </div>

        </section>

        <section className="dashboard-grid">

          <div className="panel recent-panel">

            <div className="panel-header">

              <div>
                <h2>Recent Analysis</h2>
                <p>Latest files scanned by ThreatLens AI</p>
              </div>

              <button
                onClick={() => goToPage('history')}
              >
                View All →
              </button>

            </div>

            <div className="scan-table">

              <div className="table-row table-heading">
                <span>FILE</span>
                <span>RESULT</span>
                <span>RISK</span>
                <span>TIME</span>
              </div>

              <div className="table-row">

                <span className="file-name">
                  <b>▣</b>
                  sample.exe
                </span>

                <span className="status danger">
                  Malware
                </span>

                <span className="risk high">
                  HIGH
                </span>

                <span>
                  Today, 7:14 PM
                </span>

              </div>

              <div className="table-row">

                <span className="file-name">
                  <b>▣</b>
                  calculator.exe
                </span>

                <span className="status safe">
                  Benign
                </span>

                <span className="risk low">
                  LOW
                </span>

                <span>
                  Today, 6:58 PM
                </span>

              </div>

              <div className="table-row">

                <span className="file-name">
                  <b>▣</b>
                  update.exe
                </span>

                <span className="status danger">
                  Malware
                </span>

                <span className="risk critical">
                  CRITICAL
                </span>

                <span>
                  Today, 6:34 PM
                </span>

              </div>

              <div className="table-row">

                <span className="file-name">
                  <b>▣</b>
                  setup.exe
                </span>

                <span className="status safe">
                  Benign
                </span>

                <span className="risk low">
                  LOW
                </span>

                <span>
                  Today, 5:42 PM
                </span>

              </div>

            </div>

          </div>

          <div className="panel threat-panel">

            <div className="panel-header">

              <div>
                <h2>Threat Level</h2>
                <p>Current detection overview</p>
              </div>

            </div>

            <div className="threat-circle">

              <div>
                <strong>18%</strong>
                <span>Detection</span>
              </div>

            </div>

            <div className="legend">

              <div>
                <i className="dot danger-dot"></i>
                Malware
                <strong>23</strong>
              </div>

              <div>
                <i className="dot safe-dot"></i>
                Benign
                <strong>105</strong>
              </div>

            </div>

          </div>

        </section>

        <section className="quick-analysis">

          <div>

            <div className="upload-icon">
              ↑
            </div>

            <div>

              <h2>
                Analyze a suspicious file
              </h2>

              <p>
                Upload an executable and let ThreatLens AI analyze it.
              </p>

            </div>

          </div>

          <button
            onClick={() => goToPage('upload')}
          >
            Upload File →
          </button>

        </section>

      </main>

    </div>
  )
}


/* =========================================================
   UPLOAD PAGE
========================================================= */

function UploadPage({
  selectedFile,
  analysisResult,
  isAnalyzing,
  fileError,
  handleFileChange,
  handleAnalyze,
  goToPage
}) {
  return (
    <div className="upload-page">

      <header className="upload-header">

        <button
          className="back-button"
          onClick={() => goToPage('dashboard')}
        >
          ← Dashboard
        </button>

        <div className="mini-brand">

          <div>
            ◇
          </div>

          <strong>
            ThreatLens AI
          </strong>

        </div>

      </header>

      <main className="upload-content">

        <p className="eyebrow">
          MALWARE ANALYSIS
        </p>

        <h1>
          Analyze File
        </h1>

        <p className="upload-description">
          Upload an executable file for static malware analysis.
        </p>

        <div className="upload-card">

          <div className="large-upload-icon">
            ↑
          </div>

          <h2>
            Upload an executable
          </h2>

          <p>
            Select a Windows executable (.exe) file to begin analysis.
          </p>

          <label className="file-picker">

            Choose .EXE File

            <input
              type="file"
              accept=".exe"
              onChange={handleFileChange}
            />

          </label>

          {fileError && (
            <div className="file-error">
              ⚠ {fileError}
            </div>
          )}

          {selectedFile && (
            <div className="selected-file">

              <span>
                ▣
              </span>

              <div>

                <strong>
                  {selectedFile.name}
                </strong>

                <small>
                  {(selectedFile.size / 1024).toFixed(1)} KB
                </small>

              </div>

              <span className="check">
                ✓
              </span>

            </div>
          )}

          <button
            className="primary-button analyze-file-button"
            disabled={!selectedFile || isAnalyzing}
            onClick={handleAnalyze}
          >
            {isAnalyzing
              ? 'Analyzing File...'
              : 'Analyze File →'}
          </button>

          <small className="security-warning">
            🔒 Demo analysis mode. ML and YARA integration will be connected during backend integration.
          </small>

        </div>

        {isAnalyzing && (
          <div className="analysis-progress">

            <div className="progress-spinner">
              ◌
            </div>

            <div>
              <strong>
                Running demo analysis
              </strong>

              <p>
                Preparing the file for malware classification...
              </p>
            </div>

          </div>
        )}

        {analysisResult && selectedFile && (
          <div className="result-preview">

            <div className="result-header">

              <div>

                <span className="eyebrow">
                  DEMO ANALYSIS RESULT
                </span>

                <h2>
                  {selectedFile.name}
                </h2>

              </div>

              <span
                className={`status ${analysisResult.statusClass}`}
              >
                {analysisResult.status}
              </span>

            </div>

            <div className="result-stats">

              <div>
                <span>Prediction</span>

                <strong>
                  {analysisResult.prediction}
                </strong>
              </div>

              <div>
                <span>Confidence</span>

                <strong>
                  {analysisResult.confidence}%
                </strong>
              </div>

              <div>
                <span>Risk Level</span>

                <strong
                  className={
                    analysisResult.risk === 'LOW'
                      ? 'safe-text'
                      : 'critical-text'
                  }
                >
                  {analysisResult.risk}
                </strong>
              </div>

            </div>

            <p className="dummy-note">
              Demo result only — the real ML model and YARA scanner will be connected during backend integration.
            </p>

          </div>
        )}

      </main>

    </div>
  )
}


/* =========================================================
   HISTORY PAGE
========================================================= */

function HistoryPage({
  username,
  role,
  goToPage,
  handleLogout
}) {
  return (
    <div className="dashboard-page">

      <Sidebar
        activePage="history"
        username={username}
        role={role}
        goToPage={goToPage}
        handleLogout={handleLogout}
      />

      <main className="dashboard-content">

        <header className="dashboard-header">

          <div>

            <p className="eyebrow">
              SECURITY RECORDS
            </p>

            <h1>
              Analysis History
            </h1>

            <p className="welcome-text">
              Review previous malware analysis results and risk levels.
            </p>

          </div>

          <button
            className="analyze-button"
            onClick={() => goToPage('upload')}
          >
            <span>＋</span>
            New Analysis
          </button>

        </header>

        <section className="panel">

          <div className="panel-header">

            <div>

              <h2>
                Scan History
              </h2>

              <p>
                Previous files analyzed by ThreatLens AI
              </p>

            </div>

            <button>
              Export →
            </button>

          </div>

          <div className="scan-table">

            <div className="table-row table-heading">
              <span>FILE</span>
              <span>RESULT</span>
              <span>RISK</span>
              <span>TIME</span>
            </div>

            <div className="table-row">

              <span className="file-name">
                <b>▣</b>
                sample.exe
              </span>

              <span className="status danger">
                Malware
              </span>

              <span className="risk high">
                HIGH
              </span>

              <span>
                Today, 7:14 PM
              </span>

            </div>

            <div className="table-row">

              <span className="file-name">
                <b>▣</b>
                calculator.exe
              </span>

              <span className="status safe">
                Benign
              </span>

              <span className="risk low">
                LOW
              </span>

              <span>
                Today, 6:58 PM
              </span>

            </div>

            <div className="table-row">

              <span className="file-name">
                <b>▣</b>
                update.exe
              </span>

              <span className="status danger">
                Malware
              </span>

              <span className="risk critical">
                CRITICAL
              </span>

              <span>
                Today, 6:34 PM
              </span>

            </div>

            <div className="table-row">

              <span className="file-name">
                <b>▣</b>
                setup.exe
              </span>

              <span className="status safe">
                Benign
              </span>

              <span className="risk low">
                LOW
              </span>

              <span>
                Today, 5:42 PM
              </span>

            </div>

          </div>

        </section>

      </main>

    </div>
  )
}


/* =========================================================
   ALERTS PAGE
========================================================= */

function AlertsPage({
  username,
  role,
  goToPage,
  handleLogout
}) {
  const [alerts, setAlerts] = useState([
    {
      id: 1,
      severity: 'Critical',
      title: 'Malware detected in sample.exe',
      description:
        'ThreatLens AI classified the executable as malicious with a high malware probability.',
      source: 'ML Detection Engine',
      time: '2 minutes ago',
      status: 'Active'
    },
    {
      id: 2,
      severity: 'High',
      title: 'Suspicious executable detected',
      description:
        'update.exe triggered multiple threat indicators during static analysis.',
      source: 'YARA Scanner',
      time: '42 minutes ago',
      status: 'Active'
    },
    {
      id: 3,
      severity: 'High',
      title: 'Potentially malicious file identified',
      description:
        'service.exe received a high-risk classification and requires analyst review.',
      source: 'ML Detection Engine',
      time: '1 hour ago',
      status: 'Active'
    },
    {
      id: 4,
      severity: 'Medium',
      title: 'Unusual executable submitted',
      description:
        'A newly submitted executable requires additional review before being considered safe.',
      source: 'ThreatLens Monitor',
      time: '2 hours ago',
      status: 'Active'
    },
    {
      id: 5,
      severity: 'Low',
      title: 'Benign file analysis completed',
      description:
        'calculator.exe was classified as benign with a low risk score.',
      source: 'ML Detection Engine',
      time: '3 hours ago',
      status: 'Resolved'
    }
  ])

  const acknowledgeAlert = (id) => {
    setAlerts((currentAlerts) =>
      currentAlerts.map((alert) =>
        alert.id === id
          ? {
              ...alert,
              status: 'Acknowledged'
            }
          : alert
      )
    )
  }

  const activeAlerts = alerts.filter(
    (alert) => alert.status === 'Active'
  ).length

  const criticalAlerts = alerts.filter(
    (alert) => alert.severity === 'Critical'
  ).length

  const highAlerts = alerts.filter(
    (alert) => alert.severity === 'High'
  ).length

  const resolvedAlerts = alerts.filter(
    (alert) => alert.status === 'Resolved'
  ).length

  return (
    <div className="dashboard-page">

      <Sidebar
        activePage="alerts"
        username={username}
        role={role}
        goToPage={goToPage}
        handleLogout={handleLogout}
      />

      <main className="dashboard-content">

        <header className="dashboard-header">

          <div>

            <p className="eyebrow">
              SECURITY MONITORING
            </p>

            <h1>
              Alerts
            </h1>

            <p className="welcome-text">
              Monitor important threat detections and security events.
            </p>

          </div>

          <button
            className="analyze-button"
            onClick={() => goToPage('upload')}
          >
            <span>＋</span>
            New Analysis
          </button>

        </header>

        <section className="stat-grid">

          <div className="stat-card">

            <div className="stat-icon red">
              ⚠
            </div>

            <div>
              <span>Active Alerts</span>
              <strong>{activeAlerts}</strong>
              <small>Require attention</small>
            </div>

          </div>

          <div className="stat-card">

            <div className="stat-icon red">
              !
            </div>

            <div>
              <span>Critical</span>
              <strong>{criticalAlerts}</strong>
              <small>Immediate review</small>
            </div>

          </div>

          <div className="stat-card">

            <div className="stat-icon purple">
              ▲
            </div>

            <div>
              <span>High Severity</span>
              <strong>{highAlerts}</strong>
              <small>Elevated risk</small>
            </div>

          </div>

          <div className="stat-card">

            <div className="stat-icon green">
              ✓
            </div>

            <div>
              <span>Resolved</span>
              <strong>{resolvedAlerts}</strong>
              <small>Closed events</small>
            </div>

          </div>

        </section>

        <section className="panel">

          <div className="panel-header">

            <div>

              <h2>
                Security Alerts
              </h2>

              <p>
                Recent threat notifications and analyst events
              </p>

            </div>

            <span className="status danger">
              {activeAlerts} Active
            </span>

          </div>

          <div className="alert-list">

            {alerts.map((alert) => (

              <div
                className="alert-item"
                key={alert.id}
              >

                <div
                  className={`alert-severity ${alert.severity.toLowerCase()}`}
                >
                  {alert.severity === 'Critical' && '!!'}
                  {alert.severity === 'High' && '!'}
                  {alert.severity === 'Medium' && '⚠'}
                  {alert.severity === 'Low' && '✓'}
                </div>

                <div className="alert-main">

                  <div className="alert-title-row">

                    <h3>
                      {alert.title}
                    </h3>

                    <span
                      className={`alert-badge ${alert.severity.toLowerCase()}`}
                    >
                      {alert.severity}
                    </span>

                  </div>

                  <p>
                    {alert.description}
                  </p>

                  <div className="alert-meta">

                    <span>
                      Source: {alert.source}
                    </span>

                    <span>•</span>

                    <span>
                      {alert.time}
                    </span>

                  </div>

                </div>

                <div className="alert-action">

                  <span
                    className={
                      alert.status === 'Active'
                        ? 'alert-status active'
                        : 'alert-status resolved'
                    }
                  >
                    {alert.status}
                  </span>

                  {alert.status === 'Active' && (
                    <button
                      className="acknowledge-button"
                      onClick={() => acknowledgeAlert(alert.id)}
                    >
                      Acknowledge
                    </button>
                  )}

                  {alert.status === 'Acknowledged' && (
                    <span className="acknowledged-label">
                      ✓ Reviewed
                    </span>
                  )}

                </div>

              </div>

            ))}

          </div>

        </section>

      </main>

    </div>
  )
}


/* =========================================================
   ANALYTICS PAGE
========================================================= */

function AnalyticsPage({
  username,
  role,
  goToPage,
  handleLogout
}) {
  return (
    <div className="dashboard-page">

      <Sidebar
        activePage="analytics"
        username={username}
        role={role}
        goToPage={goToPage}
        handleLogout={handleLogout}
      />

      <main className="dashboard-content">

        <header className="dashboard-header">

          <div>

            <p className="eyebrow">
              SECURITY INTELLIGENCE
            </p>

            <h1>
              Analytics
            </h1>

            <p className="welcome-text">
              Understand malware detection trends and system performance.
            </p>

          </div>

          <button
            className="analyze-button"
            onClick={() => goToPage('upload')}
          >
            <span>＋</span>
            New Analysis
          </button>

        </header>

        <section className="stat-grid">

          <div className="stat-card">

            <div className="stat-icon blue">
              ◈
            </div>

            <div>
              <span>Total Scans</span>
              <strong>128</strong>
              <small>Last 30 days</small>
            </div>

          </div>

          <div className="stat-card">

            <div className="stat-icon red">
              ⚠
            </div>

            <div>
              <span>Threat Detection</span>
              <strong>18%</strong>
              <small>23 malicious files</small>
            </div>

          </div>

          <div className="stat-card">

            <div className="stat-icon green">
              ✓
            </div>

            <div>
              <span>Benign Rate</span>
              <strong>82%</strong>
              <small>105 safe files</small>
            </div>

          </div>

          <div className="stat-card">

            <div className="stat-icon purple">
              ◷
            </div>

            <div>
              <span>Avg. Scan Time</span>
              <strong>1.8s</strong>
              <small>System performance</small>
            </div>

          </div>

        </section>

        <section className="analytics-grid">

          <div className="panel analytics-panel">

            <div className="panel-header">

              <div>
                <h2>Detection Distribution</h2>
                <p>Malware versus benign classifications</p>
              </div>

              <span className="analytics-period">
                Last 30 days
              </span>

            </div>

            <div className="distribution-chart">

              <div className="donut-chart">

                <div className="donut-inner">
                  <strong>82%</strong>
                  <span>Benign</span>
                </div>

              </div>

              <div className="distribution-legend">

                <div className="legend-item">

                  <i className="legend-color malware-color"></i>

                  <div>
                    <strong>Malware</strong>
                    <small>Threat detected</small>
                  </div>

                  <b>23</b>

                </div>

                <div className="legend-item">

                  <i className="legend-color benign-color"></i>

                  <div>
                    <strong>Benign</strong>
                    <small>No threat detected</small>
                  </div>

                  <b>105</b>

                </div>

              </div>

            </div>

          </div>

          <div className="panel analytics-panel">

            <div className="panel-header">

              <div>
                <h2>Risk Distribution</h2>
                <p>Current classification levels</p>
              </div>

            </div>

            <div className="risk-bars">

              <div className="risk-bar-row">

                <div className="risk-label">
                  <span>Critical</span>
                  <strong>4</strong>
                </div>

                <div className="bar-track">
                  <div
                    className="bar-fill critical-fill"
                    style={{ width: '20%' }}
                  ></div>
                </div>

              </div>

              <div className="risk-bar-row">

                <div className="risk-label">
                  <span>High</span>
                  <strong>19</strong>
                </div>

                <div className="bar-track">
                  <div
                    className="bar-fill high-fill"
                    style={{ width: '55%' }}
                  ></div>
                </div>

              </div>

              <div className="risk-bar-row">

                <div className="risk-label">
                  <span>Medium</span>
                  <strong>12</strong>
                </div>

                <div className="bar-track">
                  <div
                    className="bar-fill medium-fill"
                    style={{ width: '30%' }}
                  ></div>
                </div>

              </div>

              <div className="risk-bar-row">

                <div className="risk-label">
                  <span>Low</span>
                  <strong>4</strong>
                </div>

                <div className="bar-track">
                  <div
                    className="bar-fill low-fill"
                    style={{ width: '20%' }}
                  ></div>
                </div>

              </div>

            </div>

          </div>

        </section>

        <section className="panel trend-panel">

          <div className="panel-header">

            <div>

              <h2>
                Scan Activity
              </h2>

              <p>
                Number of files analyzed over the last seven days
              </p>

            </div>

            <span className="trend-indicator">
              ↑ 14% this week
            </span>

          </div>

          <div className="activity-chart">

            <div className="chart-y-axis">
              <span>30</span>
              <span>20</span>
              <span>10</span>
              <span>0</span>
            </div>

            <div className="chart-area">

              <div className="chart-grid-lines">
                <span></span>
                <span></span>
                <span></span>
                <span></span>
              </div>

              <div className="chart-bars">

                <div className="chart-column">
                  <div
                    className="activity-bar"
                    style={{ height: '52%' }}
                  ></div>
                  <span>Mon</span>
                </div>

                <div className="chart-column">
                  <div
                    className="activity-bar"
                    style={{ height: '68%' }}
                  ></div>
                  <span>Tue</span>
                </div>

                <div className="chart-column">
                  <div
                    className="activity-bar"
                    style={{ height: '43%' }}
                  ></div>
                  <span>Wed</span>
                </div>

                <div className="chart-column">
                  <div
                    className="activity-bar"
                    style={{ height: '78%' }}
                  ></div>
                  <span>Thu</span>
                </div>

                <div className="chart-column">
                  <div
                    className="activity-bar"
                    style={{ height: '61%' }}
                  ></div>
                  <span>Fri</span>
                </div>

                <div className="chart-column">
                  <div
                    className="activity-bar"
                    style={{ height: '88%' }}
                  ></div>
                  <span>Sat</span>
                </div>

                <div className="chart-column">
                  <div
                    className="activity-bar"
                    style={{ height: '72%' }}
                  ></div>
                  <span>Sun</span>
                </div>

              </div>

            </div>

          </div>

        </section>

        <section className="analytics-grid">

          <div className="panel">

            <div className="panel-header">

              <div>
                <h2>
                  Detection Engine
                </h2>

                <p>
                  Current analysis performance
                </p>
              </div>

              <span className="status safe">
                Operational
              </span>

            </div>

            <div className="performance-list">

              <div className="performance-row">

                <span>
                  ML Classification
                </span>

                <strong>
                  96.4%
                </strong>

                <div className="performance-track">
                  <div style={{ width: '96%' }}></div>
                </div>

              </div>

              <div className="performance-row">

                <span>
                  YARA Detection
                </span>

                <strong>
                  92.1%
                </strong>

                <div className="performance-track">
                  <div style={{ width: '92%' }}></div>
                </div>

              </div>

              <div className="performance-row">

                <span>
                  Scan Success
                </span>

                <strong>
                  99.2%
                </strong>

                <div className="performance-track">
                  <div style={{ width: '99%' }}></div>
                </div>

              </div>

            </div>

          </div>

          <div className="panel">

            <div className="panel-header">

              <div>
                <h2>
                  Security Summary
                </h2>

                <p>
                  Current system overview
                </p>
              </div>

            </div>

            <div className="summary-list">

              <div>
                <span>Files analyzed</span>
                <strong>128</strong>
              </div>

              <div>
                <span>Threats identified</span>
                <strong className="critical-text">
                  23
                </strong>
              </div>

              <div>
                <span>YARA matches</span>
                <strong>
                  17
                </strong>
              </div>

              <div>
                <span>System status</span>
                <strong className="safe-text">
                  Healthy
                </strong>
              </div>

            </div>

          </div>

        </section>

        <section className="quick-analysis">

          <div>

            <div className="upload-icon">
              ◒
            </div>

            <div>

              <h2>
                Need more data?
              </h2>

              <p>
                Analyze another executable to expand your security insights.
              </p>

            </div>

          </div>

          <button
            onClick={() => goToPage('upload')}
          >
            Analyze File →
          </button>

        </section>

      </main>

    </div>
  )
}


/* =========================================================
   REPORTS PAGE
========================================================= */

function ReportsPage({
  username,
  role,
  goToPage,
  handleLogout
}) {
  return (
    <div className="dashboard-page">

      <Sidebar
        activePage="reports"
        username={username}
        role={role}
        goToPage={goToPage}
        handleLogout={handleLogout}
      />

      <main className="dashboard-content">

        <header className="dashboard-header">

          <div>

            <p className="eyebrow">
              SECURITY REPORTING
            </p>

            <h1>
              Reports
            </h1>

            <p className="welcome-text">
              Review summarized malware analysis reports.
            </p>

          </div>

          <button
            className="analyze-button"
            onClick={() => goToPage('upload')}
          >
            <span>＋</span>
            New Analysis
          </button>

        </header>

        <section className="stat-grid">

          <div className="stat-card">

            <div className="stat-icon blue">
              ◈
            </div>

            <div>
              <span>Total Reports</span>
              <strong>128</strong>
              <small>Generated scans</small>
            </div>

          </div>

          <div className="stat-card">

            <div className="stat-icon red">
              ⚠
            </div>

            <div>
              <span>Threat Reports</span>
              <strong>23</strong>
              <small>Require attention</small>
            </div>

          </div>

          <div className="stat-card">

            <div className="stat-icon green">
              ✓
            </div>

            <div>
              <span>Benign Reports</span>
              <strong>105</strong>
              <small>Safe classifications</small>
            </div>

          </div>

          <div className="stat-card">

            <div className="stat-icon purple">
              ◷
            </div>

            <div>
              <span>Latest Report</span>
              <strong>2m</strong>
              <small>Updated recently</small>
            </div>

          </div>

        </section>

        <section className="panel">

          <div className="panel-header">

            <div>

              <h2>
                Recent Reports
              </h2>

              <p>
                Generated analysis summaries
              </p>

            </div>

          </div>

          <div className="scan-table">

            <div className="table-row table-heading">
              <span>FILE</span>
              <span>REPORT</span>
              <span>RISK</span>
              <span>TIME</span>
            </div>

            <div className="table-row">

              <span className="file-name">
                <b>▤</b>
                sample.exe
              </span>

              <span className="status danger">
                Available
              </span>

              <span className="risk high">
                HIGH
              </span>

              <span>
                2 min ago
              </span>

            </div>

            <div className="table-row">

              <span className="file-name">
                <b>▤</b>
                calculator.exe
              </span>

              <span className="status safe">
                Available
              </span>

              <span className="risk low">
                LOW
              </span>

              <span>
                18 min ago
              </span>

            </div>

            <div className="table-row">

              <span className="file-name">
                <b>▤</b>
                update.exe
              </span>

              <span className="status danger">
                Available
              </span>

              <span className="risk critical">
                CRITICAL
              </span>

              <span>
                42 min ago
              </span>

            </div>

          </div>

        </section>

      </main>

    </div>
  )
}


/* =========================================================
   PROFILE PAGE
========================================================= */

function ProfilePage({
  username,
  role,
  goToPage,
  handleLogout
}) {
  const [displayName, setDisplayName] = useState(
    username || 'Security Analyst'
  )

  const [email, setEmail] = useState(
    username
      ? `${username.toLowerCase().replace(/\s+/g, '.')}@threatlens.local`
      : 'analyst@threatlens.local'
  )

  const [department, setDepartment] = useState(
    'Cybersecurity Analysis'
  )

  const [saved, setSaved] = useState(false)

  const handleSave = (e) => {
    e.preventDefault()

    setSaved(true)

    setTimeout(() => {
      setSaved(false)
    }, 2500)
  }

  const initial = displayName
    ? displayName.charAt(0).toUpperCase()
    : 'A'

  return (
    <div className="dashboard-page">

      <Sidebar
        activePage="profile"
        username={username || displayName}
        role={role}
        goToPage={goToPage}
        handleLogout={handleLogout}
      />

      <main className="dashboard-content">

        <header className="dashboard-header">

          <div>

            <p className="eyebrow">
              ACCOUNT SETTINGS
            </p>

            <h1>
              Profile
            </h1>

            <p className="welcome-text">
              Manage your ThreatLens AI analyst profile and account settings.
            </p>

          </div>

          <div className="profile-status">
            <span className="online-dot"></span>
            Account Active
          </div>

        </header>

        <section className="profile-overview panel">

          <div className="profile-avatar-large">
            {initial}
          </div>

          <div className="profile-identity">

            <h2>
              {displayName || 'Security Analyst'}
            </h2>

            <p>
              {role} • ThreatLens AI
            </p>

            <span className="profile-badge">
              ✓ Verified Analyst
            </span>

          </div>

          <div className="profile-stat">

            <span>Files Analyzed</span>

            <strong>
              128
            </strong>

          </div>

          <div className="profile-stat">

            <span>Threats Found</span>

            <strong className="critical-text">
              23
            </strong>

          </div>

        </section>

        <section className="profile-grid">

          <div className="panel">

            <div className="panel-header">

              <div>

                <h2>
                  Profile Information
                </h2>

                <p>
                  Update your analyst information
                </p>

              </div>

            </div>

            <form
              className="profile-form"
              onSubmit={handleSave}
            >

              <div className="profile-field">

                <label>
                  DISPLAY NAME
                </label>

                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                />

              </div>

              <div className="profile-field">

                <label>
                  EMAIL
                </label>

                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />

              </div>

              <div className="profile-field">

                <label>
                  DEPARTMENT
                </label>

                <input
                  type="text"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                />

              </div>

              <div className="profile-form-actions">

                <button
                  className="primary-button profile-save-button"
                  type="submit"
                >
                  Save Changes
                </button>

                {saved && (
                  <span className="save-success">
                    ✓ Changes saved
                  </span>
                )}

              </div>

            </form>

          </div>

          <div className="panel security-panel">

            <div className="panel-header">

              <div>

                <h2>
                  Security Status
                </h2>

                <p>
                  Account security overview
                </p>

              </div>

            </div>

            <div className="security-status-card">

              <div className="security-status-icon">
                ✓
              </div>

              <div>

                <strong>
                  Account Protected
                </strong>

                <p>
                  Your ThreatLens AI analyst account is currently active.
                </p>

              </div>

            </div>

            <div className="security-setting">

              <div>

                <strong>
                  Role
                </strong>

                <span>
                  Current access level
                </span>

              </div>

              <span className="status safe">
                {role}
              </span>

            </div>

            <div className="security-setting">

              <div>

                <strong>
                  Platform Access
                </strong>

                <span>
                  Malware analysis workspace
                </span>

              </div>

              <span className="status safe">
                Enabled
              </span>

            </div>

            <div className="security-setting">

              <div>

                <strong>
                  Session
                </strong>

                <span>
                  Current browser session
                </span>

              </div>

              <span className="status safe">
                Active
              </span>

            </div>

          </div>

        </section>

        <section className="panel account-info-panel">

          <div className="panel-header">

            <div>

              <h2>
                Account Information
              </h2>

              <p>
                ThreatLens AI account details
              </p>

            </div>

          </div>

          <div className="account-info-grid">

            <div>

              <span>Account Type</span>

              <strong>
                Security Analyst
              </strong>

            </div>

            <div>

              <span>Access Level</span>

              <strong>
                {role}
              </strong>

            </div>

            <div>

              <span>Analyses Completed</span>

              <strong>
                128
              </strong>

            </div>

            <div>

              <span>Platform</span>

              <strong>
                ThreatLens AI
              </strong>

            </div>

          </div>

        </section>

      </main>

    </div>
  )
}


export default App