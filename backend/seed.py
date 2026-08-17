import sys
import os

# Ensure backend directory is in python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.db.session import SessionLocal, engine
from app.models.pg_models import Base, Role, User, PlatformSetting, ThreatIntelFeed
from app.core.security import get_password_hash
from app.services.ml_engine import ml_engine

def seed_database():
    print("[+] Initializing database tables...")
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        # 1. Seed Roles
        roles_data = [
            {"name": "Administrator", "description": "Full access to platform settings, user management, and dashboards."},
            {"name": "Security Analyst", "description": "Upload malware samples, run static scans, view reports and alerts."},
            {"name": "SOC Team Member", "description": "Monitor active threats, review alert history, track incident response."},
            {"name": "Researcher", "description": "Access datasets, analyze malware family predictions, export research reports."}
        ]

        role_objects = {}
        for rdata in roles_data:
            role = db.query(Role).filter(Role.name == rdata["name"]).first()
            if not role:
                role = Role(name=rdata["name"], description=rdata["description"])
                db.add(role)
                db.flush()
                print(f" -> Created Role: {rdata['name']}")
            role_objects[rdata["name"]] = role

        db.commit()

        # 2. Seed Default Users
        users_data = [
            {
                "email": "admin@threatlens.ai",
                "password": "AdminPass123!",
                "full_name": "Chief Security Officer (Admin)",
                "role_name": "Administrator"
            },
            {
                "email": "analyst@threatlens.ai",
                "password": "AnalystPass123!",
                "full_name": "Lead Malware Analyst",
                "role_name": "Security Analyst"
            },
            {
                "email": "soc@threatlens.ai",
                "password": "SocPass123!",
                "full_name": "SOC Incident Handler",
                "role_name": "SOC Team Member"
            },
            {
                "email": "researcher@threatlens.ai",
                "password": "ResearchPass123!",
                "full_name": "Threat Intelligence Researcher",
                "role_name": "Researcher"
            }
        ]

        for udata in users_data:
            user = db.query(User).filter(User.email == udata["email"]).first()
            if not user:
                user = User(
                    email=udata["email"],
                    password_hash=get_password_hash(udata["password"]),
                    full_name=udata["full_name"],
                    role_id=role_objects[udata["role_name"]].id,
                    is_active=True
                )
                db.add(user)
                print(f" -> Created User: {udata['email']} [{udata['role_name']}]")

        # 3. Seed Platform Settings
        settings_data = [
            {"key": "RISK_ALERT_THRESHOLD", "val": "65", "desc": "Minimum risk score (0-100) to trigger automated SOC alert"},
            {"key": "VIRUSTOTAL_ENABLED", "val": "true", "desc": "Enable VirusTotal Hash Lookup Integration"},
            {"key": "SIEM_WEBHOOK_ENABLED", "val": "false", "desc": "Enable pushing alert payloads to outbound SIEM/SOAR webhook"},
            {"key": "MAX_UPLOAD_SIZE_MB", "val": "50", "desc": "Maximum allowed sample upload size in MB"}
        ]
        for s in settings_data:
            setting = db.query(PlatformSetting).filter(PlatformSetting.setting_key == s["key"]).first()
            if not setting:
                setting = PlatformSetting(setting_key=s["key"], setting_value=s["val"], description=s["desc"])
                db.add(setting)

        # 4. Seed Sample Threat Intel Indicators
        intel_data = [
            {"feed": "AlienVault OTX", "type": "hash", "val": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855", "cat": "Ransomware.WannaCry", "src": "OTX Feed"},
            {"feed": "AbuseIPDB", "type": "ip", "val": "185.220.101.5", "cat": "C2 Server", "src": "AbuseIPDB Top 100"},
            {"feed": "MalwareURL", "type": "url", "val": "http://bad-malware-payload.ru/exe", "cat": "Trojan Downloader", "src": "URLhaus"}
        ]
        for item in intel_data:
            feed = db.query(ThreatIntelFeed).filter(ThreatIntelFeed.indicator_value == item["val"]).first()
            if not feed:
                feed = ThreatIntelFeed(feed_name=item["feed"], indicator_type=item["type"], indicator_value=item["val"], threat_category=item["cat"], source=item["src"])
                db.add(feed)

        db.commit()
        print("[+] PostgreSQL seeding completed successfully.")

        # 5. Train Synthetic ML Classifier
        print("[+] Training synthetic ML classification model...")
        ml_engine.train_synthetic_model()
        print(f"[+] Model saved to {ml_engine.model_path}")

    except Exception as e:
        db.rollback()
        print(f"[-] Error seeding database: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
