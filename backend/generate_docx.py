import os
import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_ALIGN_VERTICAL
from docx.oxml import OxmlElement, parse_xml
from docx.oxml.ns import nsdecls, qn

def set_cell_background(cell, fill_hex):
    tcPr = cell._element.get_or_add_tcPr()
    shd = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{fill_hex}"/>')
    tcPr.append(shd)

def set_cell_margins(cell, top=100, bottom=100, left=150, right=150):
    tcPr = cell._element.get_or_add_tcPr()
    tcMar = OxmlElement('w:tcMar')
    for m, val in [('top', top), ('bottom', bottom), ('left', left), ('right', right)]:
        node = OxmlElement(f'w:{m}')
        node.set(qn('w:w'), str(val))
        node.set(qn('w:type'), 'dxa')
        tcMar.append(node)
    tcPr.append(tcMar)

def create_document():
    doc = docx.Document()

    # Set page margins (1 inch all around)
    sections = doc.sections
    for section in sections:
        section.top_margin = Inches(1)
        section.bottom_margin = Inches(1)
        section.left_margin = Inches(1)
        section.right_margin = Inches(1)

    # Base Colors
    COLOR_PRIMARY = RGBColor(10, 37, 64)       # Deep Navy #0A2540
    COLOR_SECONDARY = RGBColor(0, 150, 214)    # Cyber Blue #0096D6
    COLOR_TEXT = RGBColor(30, 41, 59)          # Charcoal #1E293B
    COLOR_MUTED = RGBColor(100, 116, 139)      # Slate #64748B

    # Custom Heading 1 Style
    h1 = doc.styles['Heading 1']
    h1.font.name = 'Arial'
    h1.font.size = Pt(20)
    h1.font.bold = True
    h1.font.color.rgb = COLOR_PRIMARY
    h1.paragraph_format.space_before = Pt(18)
    h1.paragraph_format.space_after = Pt(8)

    # Custom Heading 2 Style
    h2 = doc.styles['Heading 2']
    h2.font.name = 'Arial'
    h2.font.size = Pt(14)
    h2.font.bold = True
    h2.font.color.rgb = COLOR_SECONDARY
    h2.paragraph_format.space_before = Pt(14)
    h2.paragraph_format.space_after = Pt(6)

    # Custom Heading 3 Style
    h3 = doc.styles['Heading 3']
    h3.font.name = 'Arial'
    h3.font.size = Pt(11.5)
    h3.font.bold = True
    h3.font.color.rgb = COLOR_TEXT
    h3.paragraph_format.space_before = Pt(10)
    h3.paragraph_format.space_after = Pt(4)

    # Normal Style
    normal = doc.styles['Normal']
    normal.font.name = 'Arial'
    normal.font.size = Pt(10.5)
    normal.font.color.rgb = COLOR_TEXT
    normal.paragraph_format.line_spacing = 1.15
    normal.paragraph_format.space_after = Pt(6)

    def add_callout(text, title="DEFENSIVE SECURITY NOTICE"):
        table = doc.add_table(rows=1, cols=1)
        table.alignment = WD_TABLE_ALIGNMENT.CENTER
        cell = table.cell(0, 0)
        set_cell_background(cell, "F0F9FF")
        set_cell_margins(cell, top=140, bottom=140, left=200, right=200)
        
        tcPr = cell._element.get_or_add_tcPr()
        borders = parse_xml(f'''
            <w:tcBorders {nsdecls("w")}>
                <w:top w:val="none"/>
                <w:left w:val="single" w:sz="24" w:space="0" w:color="0096D6"/>
                <w:bottom w:val="none"/>
                <w:right w:val="none"/>
            </w:tcBorders>
        ''')
        tcPr.append(borders)

        p = cell.paragraphs[0]
        p.paragraph_format.space_after = Pt(2)
        run_title = p.add_run(f"IMPORTANT: {title}\n")
        run_title.bold = True
        run_title.font.size = Pt(10)
        run_title.font.color.rgb = COLOR_SECONDARY
        
        run_body = p.add_run(text)
        run_body.font.size = Pt(10)
        run_body.font.color.rgb = COLOR_TEXT

        doc.add_paragraph() # Spacing

    def add_code_block(code_text):
        table = doc.add_table(rows=1, cols=1)
        table.alignment = WD_TABLE_ALIGNMENT.CENTER
        cell = table.cell(0, 0)
        set_cell_background(cell, "0F172A")
        set_cell_margins(cell, top=120, bottom=120, left=180, right=180)
        
        p = cell.paragraphs[0]
        p.paragraph_format.space_after = Pt(0)
        run = p.add_run(code_text)
        run.font.name = 'Consolas'
        run.font.size = Pt(9)
        run.font.color.rgb = RGBColor(56, 189, 248) # Cyan text
        doc.add_paragraph()

    def style_table_header(row, col_widths, headers):
        for idx, header_text in enumerate(headers):
            cell = row.cells[idx]
            cell.width = col_widths[idx]
            set_cell_background(cell, "0A2540")
            set_cell_margins(cell, top=120, bottom=120, left=150, right=150)
            p = cell.paragraphs[0]
            p.alignment = WD_ALIGN_PARAGRAPH.LEFT
            p.paragraph_format.space_after = Pt(0)
            run = p.add_run(header_text)
            run.bold = True
            run.font.color.rgb = RGBColor(255, 255, 255)
            run.font.size = Pt(10)

    # -------------------------------------------------------------
    # DOCUMENT COVER / TITLE
    # -------------------------------------------------------------
    title_p = doc.add_paragraph()
    title_p.alignment = WD_ALIGN_PARAGRAPH.LEFT
    title_p.paragraph_format.space_before = Pt(20)
    title_p.paragraph_format.space_after = Pt(2)
    run_t = title_p.add_run("ThreatLens AI")
    run_t.font.name = 'Arial'
    run_t.font.size = Pt(28)
    run_t.font.bold = True
    run_t.font.color.rgb = COLOR_PRIMARY

    sub_p = doc.add_paragraph()
    sub_p.paragraph_format.space_after = Pt(18)
    run_sub = sub_p.add_run("Enterprise Threat Classification & Malware Static Analysis Platform — Technical Reference & Operating Manual")
    run_sub.font.name = 'Arial'
    run_sub.font.size = Pt(13)
    run_sub.font.color.rgb = COLOR_MUTED

    add_callout(
        "ThreatLens AI operates strictly statically. No uploaded samples or binary files are ever executed. "
        "All cryptographic hashing, PE header extraction, Shannon entropy evaluation, YARA pattern matching, "
        "and machine learning feature vectorization occur safely in isolated memory space.",
        "DEFENSIVE SECURITY STANCE & ZERO-EXECUTION ASSURANCE"
    )

    # -------------------------------------------------------------
    # 1. EXECUTIVE OVERVIEW
    # -------------------------------------------------------------
    doc.add_heading("1. Executive Overview", level=1)
    p = doc.add_paragraph(
        "ThreatLens AI is an enterprise-grade cyber threat intelligence and static malware classification platform built specifically "
        "for Security Operations Centers (SOC), Incident Response (IR) teams, threat analysts, and malware researchers. "
        "The system facilitates high-throughput binary inspection by extracting structural characteristics, identifying embedded "
        "Indicators of Compromise (IOCs), matching custom YARA rule signatures, predicting malware family lineage via machine learning, "
        "computing automated 0–100 risk scores, and generating real-time SOC alerts."
    )

    # -------------------------------------------------------------
    # 2. SYSTEM ARCHITECTURE
    # -------------------------------------------------------------
    doc.add_heading("2. System Architecture & High-Level Design", level=1)
    p = doc.add_paragraph(
        "ThreatLens AI follows a modern decoupled architecture comprising a high-performance FastAPI Python backend, "
        "a reactive Next.js 14 glassmorphism SOC dashboard, and a tri-layer database backend (PostgreSQL, MongoDB, and Redis)."
    )

    add_code_block(
"""+-----------------------------------------------------------------------+
|                    Next.js 14 Web Frontend                            |
|             (React 18, Tailwind CSS, Cyberpunk Dark SOC UI)           |
+-----------------------------------+-----------------------------------+
                                    |
                                    v  REST API / JSON (/api/v1)
+-----------------------------------+-----------------------------------+
|                    FastAPI Python Backend Server                      |
|         (API Gateway, JWT Auth, Security Controllers, Async Engine)   |
+-----------+-----------------------+-----------------------+-----------+
            |                       |                       |
            v                       v                       v
+-----------------------+  +-----------------------+  +-----------------------+
| PostgreSQL Database   |  | MongoDB Document Store|  | Redis Cache & Session |
| Relational Storage    |  | Raw Analysis Reports  |  | Rate Limiting & Jobs  |
| Users, Scans, Alerts  |  | & Unstructured Feeds  |  | State Storage         |
+-----------------------+  +-----------------------+  +-----------------------+"""
    )

    # -------------------------------------------------------------
    # 3. TECHNOLOGY STACK
    # -------------------------------------------------------------
    doc.add_heading("3. Technology Stack & Framework Selections", level=1)
    
    table = doc.add_table(rows=1, cols=3)
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    col_widths = [Inches(1.8), Inches(2.2), Inches(2.5)]
    headers = ["Component", "Technology / Library", "Role & Description"]
    style_table_header(table.rows[0], col_widths, headers)

    tech_data = [
        ("Frontend UI", "Next.js 14, React 18, Tailwind CSS", "Cyberpunk SOC dashboard with dynamic visual metrics"),
        ("Backend Framework", "Python 3.10+, FastAPI, Uvicorn", "Async API gateway, security router, and scan controller"),
        ("Relational DB", "PostgreSQL 15, SQLAlchemy, Alembic", "User accounts, RBAC, file metadata, alerts, and audit logs"),
        ("Document DB", "MongoDB 6.0+", "Unstructured JSON static analysis reports & threat feeds"),
        ("In-Memory Cache", "Redis 7.0+", "Session caching, rate limiting, and scan job tracking"),
        ("Static Analysis", "pefile, yara-python, hashlib", "PE header parsing, section entropy, YARA rule engine"),
        ("Machine Learning", "scikit-learn, Pandas, NumPy", "Random Forest threat vectorizer & multi-class predictor")
    ]

    for idx, (comp, tech, desc) in enumerate(tech_data):
        row = table.add_row()
        fill = "FFFFFF" if idx % 2 == 0 else "F8FAFC"
        for c_i, text in enumerate([comp, tech, desc]):
            cell = row.cells[c_i]
            cell.width = col_widths[c_i]
            set_cell_background(cell, fill)
            set_cell_margins(cell, top=100, bottom=100, left=150, right=150)
            p = cell.paragraphs[0]
            p.paragraph_format.space_after = Pt(0)
            p.add_run(text).font.size = Pt(9.5)

    doc.add_paragraph() # Spacing

    # -------------------------------------------------------------
    # 4. RBAC SPECIFICATION
    # -------------------------------------------------------------
    doc.add_heading("4. Role-Based Access Control (RBAC)", level=1)
    p = doc.add_paragraph(
        "ThreatLens AI enforces granular Role-Based Access Control across four specialized operational roles:"
    )

    rbac_table = doc.add_table(rows=1, cols=3)
    rbac_table.alignment = WD_TABLE_ALIGNMENT.CENTER
    col_widths_r = [Inches(1.5), Inches(2.2), Inches(2.8)]
    headers_r = ["Role Name", "Demo Credentials", "Permissions & Access Scope"]
    style_table_header(rbac_table.rows[0], col_widths_r, headers_r)

    roles_info = [
        ("Administrator", "admin@threatlens.ai\nAdminPass123!", "Full platform configuration, user provisioning, system settings, SIEM webhook testing, and audit logs."),
        ("Security Analyst", "analyst@threatlens.ai\nAnalystPass123!", "File sample uploads, static analysis scans, classification inspection, and sample history."),
        ("SOC Team Member", "soc@threatlens.ai\nSocPass123!", "Monitoring active incident logs, updating alert lifecycle status (NEW, ACKNOWLEDGED, RESOLVED, FALSE_POSITIVE)."),
        ("Researcher", "researcher@threatlens.ai\nResearchPass123!", "Dataset access, malware family distribution analytics, model confidence review, and export of PDF/JSON reports.")
    ]

    for idx, (role_n, creds, scope) in enumerate(roles_info):
        row = rbac_table.add_row()
        fill = "FFFFFF" if idx % 2 == 0 else "F8FAFC"
        for c_i, text in enumerate([role_n, creds, scope]):
            cell = row.cells[c_i]
            cell.width = col_widths_r[c_i]
            set_cell_background(cell, fill)
            set_cell_margins(cell, top=100, bottom=100, left=150, right=150)
            p = cell.paragraphs[0]
            p.paragraph_format.space_after = Pt(0)
            run = p.add_run(text)
            run.font.size = Pt(9.5)
            if c_i == 0:
                run.bold = True

    doc.add_paragraph()

    # -------------------------------------------------------------
    # 5. CORE ENGINES & ALGORITHMS
    # -------------------------------------------------------------
    doc.add_heading("5. Core Technical Engines & Algorithms", level=1)
    
    doc.add_heading("5.1 Static Analysis Engine", level=2)
    p = doc.add_paragraph(
        "The static analysis pipeline (backend/app/services/static_analysis.py) accepts raw binary uploads and executes:\n"
        "1. Cryptographic Hashing: Computes MD5 and SHA-256 binary signatures.\n"
        "2. Shannon Entropy Calculation: Evaluates randomness across 256 byte values (range: 0.0 to 8.0). High entropy (> 7.0) indicates packing or encryption.\n"
        "3. Portable Executable (PE) Header Parsing: Uses pefile to inspect sections (.text, .rdata, .data), section sizes, and imported DLL functions (detecting API calls such as VirtualAllocEx, WriteProcessMemory, CreateRemoteThread).\n"
        "4. String & IOC Extraction: Extracts printable ASCII/Unicode strings and applies regex filters to capture embedded IPv4 addresses and URLs.\n"
        "5. YARA Pattern Engine: Evaluates sample bytes against compiled rules in backend/yara_rules/."
    )

    doc.add_heading("5.2 Machine Learning Threat Classifier", level=2)
    p = doc.add_paragraph(
        "The ML engine (backend/app/services/ml_engine.py) constructs a 7-dimensional feature vector X for each sample:\n"
        "X = [ FileSize, ShannonEntropy, SectionCount, SuspiciousAPICount, YaraHitCount, ExtractedURLCount, ExtractedIPCount ]\n\n"
        "A trained Scikit-Learn RandomForestClassifier predicts multi-class threat categories (Clean, Ransomware, Trojan, Spyware, Worm, Adware), "
        "identifies specific threat families (e.g. WannaCry, LockBit, REvil), and yields a probability confidence score (0.0 to 1.0)."
    )

    doc.add_heading("5.3 Multi-Factor Risk Scoring Algorithm", level=2)
    p = doc.add_paragraph(
        "Risk scores (0–100) are dynamically calculated by weighting static indicators, YARA hits, and ML model outputs:"
    )

    add_code_block(
"RiskScore = min(100, (YaraHits * 25) + (SuspiciousAPIs * 8) + (Entropy > 7.0 ? 15 : 0) + (MLConfidence * 30))"
    )

    doc.add_heading("5.4 Incident Alerting Pipeline", level=2)
    p = doc.add_paragraph(
        "If RiskScore >= RISK_ALERT_THRESHOLD (default: 65), an automated SOC alert is dispatched with severity assignment:\n"
        "• CRITICAL: Risk Score >= 85\n"
        "• HIGH: Risk Score 70 – 84\n"
        "• MEDIUM: Risk Score 50 – 69\n"
        "• LOW: Risk Score < 50"
    )

    # -------------------------------------------------------------
    # 6. RUNNING THE PLATFORM
    # -------------------------------------------------------------
    doc.add_heading("6. Running the Platform & Deployment Guide", level=1)
    
    doc.add_heading("Option A: Standalone Mode (Zero External DB Dependencies)", level=2)
    p = doc.add_paragraph("Ideal for instant local testing without configuring PostgreSQL, MongoDB, or Redis:")
    add_code_block(
"# Step 1: Start Backend Standalone API Server (Port 8000)\n"
"cd backend\n"
".venv\\Scripts\\python.exe standalone_server.py\n\n"
"# Step 2: Start Frontend Next.js Dev Server (Port 3000)\n"
"cd frontend\n"
"npm run dev"
    )

    doc.add_heading("Option B: Full Docker Compose Production Deployment", level=2)
    p = doc.add_paragraph("Runs the complete production microservices stack inside isolated containers:")
    add_code_block(
"docker-compose up --build\n\n"
"Frontend SOC Dashboard: http://localhost:3000\n"
"FastAPI Backend API:   http://localhost:8000\n"
"Swagger Interactive:   http://localhost:8000/docs"
    )

    # -------------------------------------------------------------
    # 7. AUTOMATED TESTING
    # -------------------------------------------------------------
    doc.add_heading("7. Verification & Automated Testing Suite", level=1)
    p = doc.add_paragraph(
        "The project includes a standalone verification script to test binary parsing, YARA evaluation, and ML prediction offline:"
    )
    add_code_block(
"cd backend\n"
".venv\\Scripts\\python.exe test_standalone_engine.py"
    )

    # Save document
    out_path = os.path.join(os.path.dirname(__file__), "..", "ThreatLens_AI_Project_Documentation.docx")
    doc.save(out_path)
    print(f"[+] Successfully generated Word Document at: {out_path}")

if __name__ == "__main__":
    create_document()
