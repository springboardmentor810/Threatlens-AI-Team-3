import { useEffect, useState } from 'react'
import './App.css'
import {
  loginUser,
  logoutUser,
  uploadAndScanFile,
  getScanHistory,
  normalizeScanResult
} from './api'

function parseMaybeJson(value) {
  if (typeof value !== 'string') return value

  try {
    return JSON.parse(value)
  } catch {
    return value
  }
}

function getResultObject(scan) {
  const candidates = [
    scan?.result, scan?.scan_result, scan?.analysis_result,
    scan?.ml_result, scan?.data, scan?.response
  ]
  for (const candidate of candidates) {
    const parsed = parseMaybeJson(candidate)
    if (parsed && typeof parsed === 'object') return parsed
  }
  return {}
}

function getHistoryPrediction(scan) {
  const resultObject = getResultObject(scan)
  const candidates = [
    scan?.static_analysis?.ml_engine?.prediction, scan?.detection?.verdict,
    scan?.prediction, scan?.classification, scan?.malware_verdict, scan?.ml_prediction,
    scan?.ml_result?.prediction, scan?.analysis?.prediction,
    resultObject?.static_analysis?.ml_engine?.prediction, resultObject?.detection?.verdict,
    resultObject?.prediction, resultObject?.classification, resultObject?.malware_verdict,
    resultObject?.ml_prediction, resultObject?.ml_result?.prediction, resultObject?.analysis?.prediction
  ]
  for (const candidate of candidates) {
    if (typeof candidate !== 'string') continue
    const normalized = candidate.trim().toUpperCase()
    if (['MALWARE','BENIGN','SUSPICIOUS','FAILED','PENDING'].includes(normalized)) return normalized
  }
  return 'PENDING'
}

function getHistoryTimestamp(scan) {
  const resultObject = getResultObject(scan)
  const candidates = [
    scan?.timestamp, scan?.scan_timestamp, scan?.scan_time, scan?.analysis_timestamp,
    scan?.analysis_time, scan?.scanned_at, scan?.scannedAt, scan?.completed_at, scan?.completedAt,
    scan?.created_at, scan?.createdAt, scan?.created_on, scan?.createdOn, scan?.uploaded_at,
    scan?.uploadedAt, scan?.upload_time, scan?.date, scan?.time, scan?.file?.timestamp,
    scan?.file?.created_at, scan?.file?.uploaded_at, scan?.metadata?.timestamp,
    scan?.metadata?.created_at, scan?.analysis?.timestamp, scan?.scan?.timestamp,
    resultObject?.timestamp, resultObject?.scan_timestamp, resultObject?.scan_time,
    resultObject?.analysis_timestamp, resultObject?.analysis_time, resultObject?.scanned_at,
    resultObject?.scannedAt, resultObject?.completed_at, resultObject?.completedAt,
    resultObject?.created_at, resultObject?.createdAt, resultObject?.uploaded_at,
    resultObject?.uploadedAt, resultObject?.date, resultObject?.time
  ]
  for (const candidate of candidates) {
    if (candidate === null || candidate === undefined || candidate === '') continue
    const date = new Date(candidate)
    if (!Number.isNaN(date.getTime())) return date.toLocaleString()
    if (typeof candidate === 'string') return candidate
  }
  return 'Not available'
}

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
  const [loginError, setLoginError] = useState('')
  const [isLoggingIn, setIsLoggingIn] = useState(false)
  const [themeMode, setThemeMode] = useState(() => localStorage.getItem('threatlens-theme') || 'light')
  const [deviceMode, setDeviceMode] = useState(() => localStorage.getItem('threatlens-device') || 'desktop')

  useEffect(() => {
    const root = document.documentElement
    const body = document.body
    const applyTheme = (mode) => {
      const resolved = mode === 'system'
        ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
        : mode
      root.dataset.theme = resolved
      body.dataset.theme = resolved
      body.classList.toggle('dark-mode', resolved === 'dark')
    }

    applyTheme(themeMode)
    localStorage.setItem('threatlens-theme', themeMode)

    if (themeMode !== 'system') return undefined

    const media = window.matchMedia('(prefers-color-scheme: dark)')
    const listener = () => applyTheme('system')
    media.addEventListener?.('change', listener)
    return () => media.removeEventListener?.('change', listener)
  }, [themeMode])

  useEffect(() => {
    document.documentElement.dataset.device = deviceMode
    document.body.dataset.device = deviceMode
    localStorage.setItem('threatlens-device', deviceMode)
  }, [deviceMode])

  const handleLogin = async (e) => {
    e.preventDefault()

    if (isLoggingIn) return

    setLoginError('')
    setIsLoggingIn(true)

    try {
      const result = await loginUser(username, password)
      const backendUser = result?.user || {}

      setUsername(
        backendUser.username ||
          backendUser.full_name ||
          username
      )

      if (backendUser.role) {
        setRole(backendUser.role)
      }

      setPage('dashboard')
    } catch (error) {
      console.error('Login failed:', error)

      setLoginError(
        error?.message ||
          'Login failed. Please check your username and password.'
      )
    } finally {
      setIsLoggingIn(false)
    }
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

  const handleAnalyze = async () => {
    if (!selectedFile || isAnalyzing) return

    setIsAnalyzing(true)
    setAnalysisResult(null)
    setFileError('')

    try {
      const scanResponse = await uploadAndScanFile(selectedFile)

      const normalizedResult = normalizeScanResult(
        scanResponse,
        selectedFile
      )

      setAnalysisResult(normalizedResult)
    } catch (error) {
      console.error('File analysis failed:', error)

      setAnalysisResult({
        scan_id: '',
        engine: {
          name: 'EMBER Malware Detection Engine',
          version: '1.0.0',
          model: 'LightGBM',
          yara_enabled: true
        },
        file: {
          name: selectedFile.name,
          sha256: '',
          size_bytes: selectedFile.size,
          file_type: ''
        },
        ml: {
          prediction: 'FAILED',
          malware_probability: null,
          benign_probability: null,
          risk_level: 'PENDING'
        },
        yara: {
          matched: false,
          matched_rules: [],
          rule_count: 0,
          rules_loaded: 0
        },
        detection: {
          verdict: 'FAILED',
          risk_score: null,
          recommended_action: ''
        },
        scan_status: 'FAILED',
        timestamp: new Date().toISOString(),
        suspicious_indicators: [],
        uploaded_by: username,
        error:
          error?.message ||
          'Unable to analyze the selected file.'
      })
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleLogout = async () => {
    try {
      await logoutUser()
    } catch (error) {
      console.warn('Logout request failed:', error)
    }

    setPage('login')
    setSelectedFile(null)
    setAnalysisResult(null)
    setFileError('')
    setLoginError('')
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
    <div className={`app-shell device-${deviceMode}`}>

      {page === 'login' && (
        <div className="login-page">
          <header className="brand-header">
            <div className="brand-icon"><span className="logo-t">T</span><span className="logo-lens">✦</span></div>

            <div>
              <h1>ThreatLens AI</h1>
              <p>Intelligent Malware Detection</p>
            </div>
          </header>

          <main className="login-card">
            <div className="security-icon">⌁</div>

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
                onChange={(e) => {
                  setUsername(e.target.value)
                  setLoginError('')
                }}
                required
                disabled={isLoggingIn}
              />

              <label>PASSWORD</label>

              <div className="password-wrapper">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value)
                    setLoginError('')
                  }}
                  required
                  disabled={isLoggingIn}
                />

                <button
                  type="button"
                  className="show-password"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoggingIn}
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>

              <label>ROLE</label>

              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                disabled={isLoggingIn}
              >
                <option>Analyst</option>
                <option>Admin</option>
                <option>Researcher</option>
              </select>

              {loginError && (
                <div className="file-error">
                  ⚠ {loginError}
                </div>
              )}

              <button
                className="primary-button"
                type="submit"
                disabled={isLoggingIn}
              >
                {isLoggingIn ? (
                  'Signing In...'
                ) : (
                  <>
                    Sign In <span>→</span>
                  </>
                )}
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

      {page === 'settings' && (
        <SettingsPage
          username={username}
          role={role}
          goToPage={goToPage}
          handleLogout={handleLogout}
          themeMode={themeMode}
          setThemeMode={setThemeMode}
          deviceMode={deviceMode}
          setDeviceMode={setDeviceMode}
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
  const navClass = (targetPage) =>
    'nav-item' + (activePage === targetPage ? ' active' : '')

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="sidebar-logo"><span className="logo-t">T</span><span className="logo-lens">✦</span></div>

        <div>
          <strong>ThreatLens</strong>
          <span>AI Security</span>
        </div>
      </div>

      <nav>
        <button
          className={navClass('dashboard')}
          onClick={() => goToPage('dashboard')}
        >
          <span>▦</span>
          Dashboard
        </button>

        <button
          className={navClass('upload')}
          onClick={() => goToPage('upload')}
        >
          <span>↑</span>
          Analyze File
        </button>

        <button
          className={navClass('history')}
          onClick={() => goToPage('history')}
        >
          <span>◉</span>
          Analysis History
        </button>

        <button
          className={navClass('alerts')}
          onClick={() => goToPage('alerts')}
        >
          <span>⚠</span>
          Alerts
        </button>

        <button
          className={navClass('analytics')}
          onClick={() => goToPage('analytics')}
        >
          <span>◒</span>
          Analytics
        </button>

        <button
          className={navClass('reports')}
          onClick={() => goToPage('reports')}
        >
          <span>▤</span>
          Reports
        </button>

        <button
          className={navClass('profile')}
          onClick={() => goToPage('profile')}
        >
          <span>●</span>
          Profile
        </button>

        <button
          className={navClass('settings')}
          onClick={() => goToPage('settings')}
        >
          <span>⚙</span>
          Settings
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
            <strong>{username || 'Analyst'}</strong>
            <span>{role}</span>
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
            <p className="eyebrow">SECURITY OVERVIEW</p>

            <h1>Dashboard</h1>

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
            <div className="stat-icon blue">◈</div>

            <div>
              <span>Total Scans</span>
              <strong>128</strong>
              <small>Last 30 days</small>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon red">⚠</div>

            <div>
              <span>Threats Detected</span>
              <strong>23</strong>
              <small>18% detection rate</small>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon green">✓</div>

            <div>
              <span>Benign Files</span>
              <strong>105</strong>
              <small>82% of total scans</small>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon purple">◷</div>

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

              <button onClick={() => goToPage('history')}>
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

                <span className="status danger">Malware</span>

                <span className="risk high">HIGH</span>

                <span>Today, 7:14 PM</span>
              </div>

              <div className="table-row">
                <span className="file-name">
                  <b>▣</b>
                  calculator.exe
                </span>

                <span className="status safe">Benign</span>

                <span className="risk low">LOW</span>

                <span>Today, 6:58 PM</span>
              </div>

              <div className="table-row">
                <span className="file-name">
                  <b>▣</b>
                  update.exe
                </span>

                <span className="status danger">Malware</span>

                <span className="risk critical">
                  CRITICAL
                </span>

                <span>Today, 6:34 PM</span>
              </div>

              <div className="table-row">
                <span className="file-name">
                  <b>▣</b>
                  setup.exe
                </span>

                <span className="status safe">Benign</span>

                <span className="risk low">LOW</span>

                <span>Today, 5:42 PM</span>
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
            <div className="upload-icon">↑</div>

            <div>
              <h2>Analyze a suspicious file</h2>

              <p>
                Upload an executable and let ThreatLens AI analyze it.
              </p>
            </div>
          </div>

          <button onClick={() => goToPage('upload')}>
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
  const mlResult = analysisResult?.ml || null
  const yaraResult = analysisResult?.yara || null
  const fileResult = analysisResult?.file || null
  const engineResult = analysisResult?.engine || null

  const suspiciousIndicators = Array.isArray(
    analysisResult?.suspicious_indicators
  )
    ? analysisResult.suspicious_indicators
    : []

  const prediction = mlResult?.prediction || 'PENDING'
  const riskLevel = mlResult?.risk_level || 'PENDING'
  const scanStatus = analysisResult?.scan_status || 'PENDING'

  const predictionStatusClass =
    prediction === 'MALWARE'
      ? 'danger'
      : prediction === 'BENIGN'
        ? 'safe'
        : prediction === 'FAILED'
          ? 'danger'
          : ''

  const riskTextClass =
    riskLevel === 'LOW'
      ? 'safe-text'
      : riskLevel === 'MEDIUM'
        ? 'medium-text'
        : riskLevel === 'HIGH' || riskLevel === 'CRITICAL'
          ? 'critical-text'
          : ''

  const scanStatusClass =
    scanStatus === 'SUCCESS'
      ? 'safe'
      : scanStatus === 'FAILED'
        ? 'danger'
        : ''

  const formatFileSize = (bytes) => {
    if (typeof bytes !== 'number') return 'Unknown'

    if (bytes < 1024) {
      return `${bytes} B`
    }

    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`
    }

    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
  }

  const formatHash = (hash) => {
    if (!hash) {
      return 'Not available'
    }

    if (hash.length <= 24) {
      return hash
    }

    return `${hash.slice(0, 12)}...${hash.slice(-12)}`
  }

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'Not available'

    const date = new Date(timestamp)

    if (Number.isNaN(date.getTime())) {
      return timestamp
    }

    return date.toLocaleString()
  }

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
          <div>◇</div>
          <strong>ThreatLens AI</strong>
        </div>
      </header>

      <main className="upload-content">
        <p className="eyebrow">MALWARE ANALYSIS</p>

        <h1>Analyze File</h1>

        <p className="upload-description">
          Upload an executable file for static malware analysis.
        </p>

        <div className="upload-card">
          <div className="large-upload-icon">↑</div>

          <h2>Upload an executable</h2>

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
              <span>▣</span>

              <div>
                <strong>{selectedFile.name}</strong>

                <small>
                  {formatFileSize(selectedFile.size)}
                </small>
              </div>

              <span className="check">✓</span>
            </div>
          )}

          <button
            className="primary-button analyze-file-button"
            disabled={!selectedFile || isAnalyzing}
            onClick={handleAnalyze}
          >
            {isAnalyzing
              ? 'Analyzing with ThreatLens AI...'
              : 'Analyze File →'}
          </button>

          <small className="security-warning">
            🔒 Files are submitted to the ThreatLens AI backend for ML and YARA analysis.
          </small>
        </div>

        {isAnalyzing && (
          <div className="analysis-progress">
            <div className="progress-spinner">◌</div>

            <div>
              <strong>Running ML/YARA analysis</strong>

              <p>
                ThreatLens AI is analyzing the executable. Please wait...
              </p>
            </div>
          </div>
        )}

        {analysisResult && (
          <div className="result-preview">
            <div className="result-header">
              <div>
                <span className="eyebrow">
                  ML / YARA RESPONSE
                </span>

                <h2>
                  {fileResult?.name || selectedFile?.name}
                </h2>
              </div>

              <span className={'status ' + scanStatusClass}>
                {scanStatus}
              </span>
            </div>

            <div className="result-stats">
              <div>
                <span>Prediction</span>

                <strong className={predictionStatusClass}>
                  {prediction}
                </strong>
              </div>

              <div>
                <span>Risk Level</span>

                <strong className={riskTextClass}>
                  {riskLevel}
                </strong>
              </div>
            </div>

            <div className="integration-result-grid">
              <div className="integration-detail-card">
                <h3>File Information</h3>

                <div className="integration-detail-row">
                  <span>File Name</span>

                  <strong>
                    {fileResult?.name || selectedFile?.name}
                  </strong>
                </div>

                <div className="integration-detail-row">
                  <span>File Size</span>

                  <strong>
                    {formatFileSize(
                      fileResult?.size_bytes ??
                        selectedFile?.size
                    )}
                  </strong>
                </div>

                <div className="integration-detail-row">
                  <span>SHA-256</span>

                  <strong className="hash-value">
                    {formatHash(fileResult?.sha256)}
                  </strong>
                </div>

                <div className="integration-detail-row">
                  <span>Timestamp</span>

                  <strong>
                    {formatTimestamp(
                      analysisResult?.timestamp
                    )}
                  </strong>
                </div>
              </div>

              <div className="integration-detail-card">
                <h3>YARA Analysis</h3>

                <div className="integration-detail-row">
                  <span>Matched</span>

                  <strong>
                    {yaraResult?.matched ? 'Yes' : 'No'}
                  </strong>
                </div>

                <div className="integration-detail-row">
                  <span>Matched Rules</span>

                  <strong>
                    {yaraResult?.matched_rules?.length || 0}
                  </strong>
                </div>

                <div className="integration-detail-row">
                  <span>Rules Loaded</span>

                  <strong>
                    {yaraResult?.rules_loaded ?? 0}
                  </strong>
                </div>
              </div>

              <div className="integration-detail-card">
                <h3>Detection Engine</h3>

                <div className="integration-detail-row">
                  <span>Engine</span>

                  <strong>
                    {engineResult?.name ||
                      'EMBER Malware Detection Engine'}
                  </strong>
                </div>

                <div className="integration-detail-row">
                  <span>Model</span>

                  <strong>
                    {engineResult?.model || 'LightGBM'}
                  </strong>
                </div>

                <div className="integration-detail-row">
                  <span>Version</span>

                  <strong>
                    {engineResult?.version || '1.0.0'}
                  </strong>
                </div>
              </div>

              <div className="integration-detail-card">
                <h3>Suspicious Indicators</h3>

                {suspiciousIndicators.length > 0 ? (
                  <ul className="indicator-list">
                    {suspiciousIndicators.map(
                      (indicator, index) => (
                        <li
                          key={`${indicator}-${index}`}
                        >
                          {typeof indicator === 'string'
                            ? indicator
                            : JSON.stringify(indicator)}
                        </li>
                      )
                    )}
                  </ul>
                ) : (
                  <p className="indicator-empty">
                    No suspicious indicators returned.
                  </p>
                )}
              </div>
            </div>

            {analysisResult.detection?.recommended_action && (
              <div className="integration-detail-card">
                <h3>Recommended Action</h3>

                <p>
                  {analysisResult.detection.recommended_action}
                </p>
              </div>
            )}

            {analysisResult.error && (
              <div className="file-error">
                ⚠ {analysisResult.error}
              </div>
            )}
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
  const [history, setHistory] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [historyError, setHistoryError] = useState('')

  const loadHistory = async () => {
    setIsLoading(true)
    setHistoryError('')

    try {
      const response = await getScanHistory()

      const scans = Array.isArray(response)
        ? response
        : Array.isArray(response?.scans)
          ? response.scans
          : Array.isArray(response?.data)
            ? response.data
            : []

      setHistory(scans)
    } catch (error) {
      console.error('Failed to load scan history:', error)

      setHistoryError(
        error?.message ||
          'Unable to load analysis history.'
      )
      setHistory([])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadHistory()
  }, [])

  const getPrediction = (scan) => getHistoryPrediction(scan)

  const getRiskLevel = (scan) => {
    const mlRisk =
      scan?.static_analysis?.ml_engine?.risk_level ||
      scan?.risk_level

    if (mlRisk) return mlRisk

    const score =
      scan?.detection?.risk_score ??
      scan?.risk_score

    if (typeof score !== 'number') return 'PENDING'
    if (score >= 90) return 'CRITICAL'
    if (score >= 70) return 'HIGH'
    if (score >= 40) return 'MEDIUM'
    return 'LOW'
  }

  const formatPrediction = (prediction) => {
    if (prediction === 'MALWARE') return 'Malware'
    if (prediction === 'BENIGN') return 'Benign'
    if (prediction === 'FAILED') return 'Failed'
    return prediction
  }

  const formatTimestamp = (scan) => getHistoryTimestamp(scan)

  const predictionClass = (prediction) => {
    if (prediction === 'MALWARE') return 'danger'
    if (prediction === 'BENIGN') return 'safe'
    if (prediction === 'FAILED') return 'danger'
    return ''
  }

  const riskClass = (risk) => {
    if (risk === 'LOW') return 'low'
    if (risk === 'MEDIUM') return 'medium'
    if (risk === 'HIGH') return 'high'
    if (risk === 'CRITICAL') return 'critical'
    return ''
  }

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
            <p className="eyebrow">SECURITY RECORDS</p>

            <h1>Analysis History</h1>

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
              <h2>Scan History</h2>

              <p>
                Previous files analyzed by ThreatLens AI
              </p>
            </div>

            <button
              onClick={loadHistory}
              disabled={isLoading}
            >
              {isLoading ? 'Refreshing...' : 'Refresh ↻'}
            </button>
          </div>

          {historyError && (
            <div className="file-error">
              ⚠ {historyError}
            </div>
          )}

          {isLoading ? (
            <div className="analysis-progress">
              <div className="progress-spinner">◌</div>

              <div>
                <strong>Loading scan history</strong>

                <p>
                  Fetching previous analysis records from ThreatLens AI.
                </p>
              </div>
            </div>
          ) : history.length === 0 ? (
            <div className="empty-state">
              <h3>No scan history available</h3>

              <p>
                Analyze an executable file to create your first scan record.
              </p>

              <button
                className="primary-button"
                onClick={() => goToPage('upload')}
              >
                Analyze File →
              </button>
            </div>
          ) : (
            <div className="scan-table">
              <div className="table-row table-heading">
                <span>FILE</span>
                <span>RESULT</span>
                <span>RISK</span>
                <span>TIME</span>
              </div>

              {history.map((scan, index) => {
                const prediction = getPrediction(scan)
                const risk = getRiskLevel(scan)

                return (
                  <div
                    className="table-row"
                    key={
                      scan?.scan_id ||
                      scan?.id ||
                      `${scan?.filename || 'scan'}-${index}`
                    }
                  >
                    <span className="file-name">
                      <b>▣</b>
                      {scan?.filename ||
                        scan?.file?.name ||
                        'Unknown file'}
                    </span>

                    <span
                      className={
                        'status ' +
                        predictionClass(prediction)
                      }
                    >
                      {formatPrediction(prediction)}
                    </span>

                    <span
                      className={
                        'risk ' +
                        riskClass(risk)
                      }
                    >
                      {risk}
                    </span>

                    <span>
                      {formatTimestamp(scan)}
                    </span>
                  </div>
                )
              })}
            </div>
          )}
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

            <h1>Alerts</h1>

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
            <div className="stat-icon red">⚠</div>

            <div>
              <span>Active Alerts</span>
              <strong>{activeAlerts}</strong>
              <small>Require attention</small>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon red">!</div>

            <div>
              <span>Critical</span>
              <strong>{criticalAlerts}</strong>
              <small>Immediate review</small>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon purple">▲</div>

            <div>
              <span>High Severity</span>
              <strong>{highAlerts}</strong>
              <small>Elevated risk</small>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon green">✓</div>

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
              <h2>Security Alerts</h2>

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
                  className={
                    'alert-severity ' +
                    alert.severity.toLowerCase()
                  }
                >
                  {alert.severity === 'Critical' && '!!'}
                  {alert.severity === 'High' && '!'}
                  {alert.severity === 'Medium' && '⚠'}
                  {alert.severity === 'Low' && '✓'}
                </div>

                <div className="alert-main">
                  <div className="alert-title-row">
                    <h3>{alert.title}</h3>

                    <span
                      className={
                        'alert-badge ' +
                        alert.severity.toLowerCase()
                      }
                    >
                      {alert.severity}
                    </span>
                  </div>

                  <p>{alert.description}</p>

                  <div className="alert-meta">
                    <span>
                      Source: {alert.source}
                    </span>

                    <span>•</span>

                    <span>{alert.time}</span>
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
                      onClick={() =>
                        acknowledgeAlert(alert.id)
                      }
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

            <h1>Analytics</h1>

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
            <div className="stat-icon blue">◈</div>

            <div>
              <span>Total Scans</span>
              <strong>128</strong>
              <small>Last 30 days</small>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon red">⚠</div>

            <div>
              <span>Threat Detection</span>
              <strong>18%</strong>
              <small>23 malicious files</small>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon green">✓</div>

            <div>
              <span>Benign Rate</span>
              <strong>82%</strong>
              <small>105 safe files</small>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon purple">◷</div>

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

                <p>
                  Malware versus benign classifications
                </p>
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

                <p>
                  Current classification levels
                </p>
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
              <h2>Scan Activity</h2>

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
                <h2>Detection Engine</h2>

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
                <span>ML Classification</span>

                <strong>96.4%</strong>

                <div className="performance-track">
                  <div style={{ width: '96%' }}></div>
                </div>
              </div>

              <div className="performance-row">
                <span>YARA Detection</span>

                <strong>92.1%</strong>

                <div className="performance-track">
                  <div style={{ width: '92%' }}></div>
                </div>
              </div>

              <div className="performance-row">
                <span>Scan Success</span>

                <strong>99.2%</strong>

                <div className="performance-track">
                  <div style={{ width: '99%' }}></div>
                </div>
              </div>
            </div>
          </div>

          <div className="panel">
            <div className="panel-header">
              <div>
                <h2>Security Summary</h2>

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
                <strong>17</strong>
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
            <div className="upload-icon">◒</div>

            <div>
              <h2>Need more data?</h2>

              <p>
                Analyze another executable to expand your security insights.
              </p>
            </div>
          </div>

          <button onClick={() => goToPage('upload')}>
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


function downloadAnalysisReport(report) {
  const filename = report?.filename || 'analysis-report.exe'
  const prediction =
    report?.prediction ||
    report?.result ||
    'PENDING'
  const risk = report?.risk || 'UNKNOWN'
  const time = report?.time || 'Not available'

  const reportText = [
    'THREATLENS AI — MALWARE ANALYSIS REPORT',
    '========================================',
    '',
    `File Name       : ${filename}`,
    `Classification  : ${prediction}`,
    `Risk Level      : ${risk}`,
    `Scan Time       : ${time}`,
    '',
    'Report Status   : Available',
    'Generated By    : ThreatLens AI',
    '',
    'This report summarizes the analysis record displayed in ThreatLens AI.',
    'For the complete live analysis result, open the corresponding scan in',
    'Analysis History.'
  ].join('\n')

  const blob = new Blob([reportText], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')

  link.href = url
  link.download = `${filename.replace(/\.exe$/i, '')}-ThreatLens-Report.txt`
  document.body.appendChild(link)
  link.click()
  link.remove()

  window.setTimeout(() => URL.revokeObjectURL(url), 1000)
}

function ReportsPage({
  username,
  role,
  goToPage,
  handleLogout
}) {
  const reports = [
    {
      filename: 'sample.exe',
      prediction: 'Malware',
      risk: 'HIGH',
      time: '2 min ago'
    },
    {
      filename: 'calculator.exe',
      prediction: 'Benign',
      risk: 'LOW',
      time: '18 min ago'
    },
    {
      filename: 'update.exe',
      prediction: 'Malware',
      risk: 'CRITICAL',
      time: '42 min ago'
    }
  ]

  const downloadAllReports = () => {
    const reportText = [
      'THREATLENS AI — REPORT SUMMARY',
      '================================',
      '',
      ...reports.flatMap((report, index) => [
        `Report ${index + 1}`,
        `File Name      : ${report.filename}`,
        `Classification : ${report.prediction}`,
        `Risk Level     : ${report.risk}`,
        `Scan Time      : ${report.time}`,
        'Status         : Available',
        ''
      ])
    ].join('\n')

    const blob = new Blob([reportText], {
      type: 'text/plain;charset=utf-8'
    })

    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')

    link.href = url
    link.download = 'ThreatLens-AI-Reports.txt'
    document.body.appendChild(link)
    link.click()
    link.remove()

    window.setTimeout(() => URL.revokeObjectURL(url), 1000)
  }

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

            <h1>Reports</h1>

            <p className="welcome-text">
              Review summarized malware analysis reports.
            </p>
          </div>

          <div className="reports-header-actions">
            <button
              className="report-download-all"
              type="button"
              onClick={downloadAllReports}
            >
              ↓ Download All
            </button>

            <button
              className="analyze-button"
              onClick={() => goToPage('upload')}
            >
              <span>＋</span>
              New Analysis
            </button>
          </div>
        </header>

        <section className="stat-grid">
          <div className="stat-card">
            <div className="stat-icon blue">◈</div>

            <div>
              <span>Total Reports</span>
              <strong>128</strong>
              <small>Generated scans</small>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon red">⚠</div>

            <div>
              <span>Threat Reports</span>
              <strong>23</strong>
              <small>Require attention</small>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon green">✓</div>

            <div>
              <span>Benign Reports</span>
              <strong>105</strong>
              <small>Safe classifications</small>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon purple">◷</div>

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
              <h2>Recent Reports</h2>

              <p>
                Generated analysis summaries
              </p>
            </div>
          </div>

          <div className="scan-table reports-table">
            <div className="table-row table-heading">
              <span>FILE</span>
              <span>REPORT</span>
              <span>RISK</span>
              <span>TIME</span>
              <span>ACTION</span>
            </div>

            {reports.map((report) => (
              <div
                className="table-row report-table-row"
                key={report.filename}
              >
                <span className="file-name">
                  <b>▤</b>
                  {report.filename}
                </span>

                <span
                  className={
                    `status ${
                      report.prediction === 'Benign'
                        ? 'safe'
                        : 'danger'
                    }`
                  }
                >
                  Available
                </span>

                <span
                  className={
                    `risk ${report.risk.toLowerCase()}`
                  }
                >
                  {report.risk}
                </span>

                <span>{report.time}</span>

                <button
                  className="report-download-button"
                  type="button"
                  onClick={() => downloadAnalysisReport(report)}
                  title={`Download report for ${report.filename}`}
                >
                  ↓ Download
                </button>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}

function SettingsPage({
  username,
  role,
  goToPage,
  handleLogout,
  themeMode,
  setThemeMode,
  deviceMode,
  setDeviceMode
}) {
  const themeOptions = [
    ['light', '☀', 'Light', 'Bright blue and white workspace'],
    ['dark', '◐', 'Dark', 'Low-light blue security workspace'],
    ['system', '◌', 'System', 'Follow your device preference']
  ]

  const deviceOptions = [
    ['desktop', '▣', 'Desktop', 'Full-width workstation layout'],
    ['tablet', '▤', 'Tablet', 'Compact medium-screen layout'],
    ['mobile', '▯', 'Mobile', 'Single-column mobile layout']
  ]

  return (
    <div className="dashboard-page">
      <Sidebar
        activePage="settings"
        username={username}
        role={role}
        goToPage={goToPage}
        handleLogout={handleLogout}
      />

      <main className="dashboard-content settings-page">
        <header className="dashboard-header page-header">
          <div>
            <p className="eyebrow">WORKSPACE PREFERENCES</p>
            <h1>Settings</h1>
            <p className="welcome-text">
              Customize the ThreatLens AI workspace appearance and device layout.
            </p>
          </div>
          <button className="analyze-button" onClick={() => goToPage('dashboard')}>
            ← Dashboard
          </button>
        </header>

        <section className="settings-card">
          <div className="settings-card-header">
            <h2>Display Mode</h2>
            <p>Choose how ThreatLens AI should appear.</p>
          </div>

          <div className="settings-options">
            {themeOptions.map(([value, icon, title, description]) => (
              <button
                key={value}
                type="button"
                className={`settings-option ${themeMode === value ? 'active' : ''}`}
                aria-pressed={themeMode === value}
                onClick={() => setThemeMode(value)}
              >
                <strong><span className="settings-option-icon">{icon}</span>{title}</strong>
                <span>{description}</span>
              </button>
            ))}
          </div>
        </section>

        <section className="settings-card">
          <div className="settings-card-header">
            <h2>Device Layout</h2>
            <p>Preview and use the workspace layout for your preferred device size.</p>
          </div>

          <div className="settings-device-options">
            {deviceOptions.map(([value, icon, title, description]) => (
              <button
                key={value}
                type="button"
                className={`settings-option ${deviceMode === value ? 'active' : ''}`}
                aria-pressed={deviceMode === value}
                onClick={() => setDeviceMode(value)}
              >
                <strong><span className="settings-option-icon">{icon}</span>{title}</strong>
                <span>{description}</span>
              </button>
            ))}
          </div>
        </section>

        <section className="settings-card">
          <div className="settings-card-header">
            <h2>Live Preview</h2>
            <p>Current workspace: {themeMode} mode · {deviceMode} layout</p>
          </div>

          <div className="settings-preview">
            <div className={`settings-preview-frame ${deviceMode}`}>
              <div className="settings-preview-topbar">
                <span className="settings-preview-dot" />
                <span className="settings-preview-dot" />
                <span className="settings-preview-dot" />
              </div>
              <div className="settings-preview-body">
                <div className="settings-preview-sidebar" />
                <div className="settings-preview-content">
                  <div className="settings-preview-line" />
                  <div className="settings-preview-line short" />
                  <div className="settings-preview-card" />
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}

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
      ? `${username
          .toLowerCase()
          .replace(/\s+/g, '.')}@threatlens.local`
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

            <h1>Profile</h1>

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

            <strong>128</strong>
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
                <h2>Profile Information</h2>

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
                <label>DISPLAY NAME</label>

                <input
                  type="text"
                  value={displayName}
                  onChange={(e) =>
                    setDisplayName(e.target.value)
                  }
                />
              </div>

              <div className="profile-field">
                <label>EMAIL</label>

                <input
                  type="email"
                  value={email}
                  onChange={(e) =>
                    setEmail(e.target.value)
                  }
                />
              </div>

              <div className="profile-field">
                <label>DEPARTMENT</label>

                <input
                  type="text"
                  value={department}
                  onChange={(e) =>
                    setDepartment(e.target.value)
                  }
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
                <h2>Security Status</h2>

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
                <strong>Account Protected</strong>

                <p>
                  Your ThreatLens AI analyst account is currently active.
                </p>
              </div>
            </div>

            <div className="security-setting">
              <div>
                <strong>Role</strong>

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
                <strong>Platform Access</strong>

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
                <strong>Session</strong>

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
              <h2>Account Information</h2>

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

              <strong>{role}</strong>
            </div>

            <div>
              <span>Analyses Completed</span>

              <strong>128</strong>
            </div>

            <div>
              <span>Platform</span>

              <strong>ThreatLens AI</strong>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}

export default App