-- ThreatLens PostgreSQL schema hardening migration.
-- Run once after confirming no duplicate rows exist. The application can create
-- missing tables at startup; this migration adds the data-integrity guarantees
-- that create_all deliberately does not alter on existing tables.

BEGIN;

CREATE UNIQUE INDEX IF NOT EXISTS uq_files_user_hash
    ON files (user_id, file_hash);
CREATE UNIQUE INDEX IF NOT EXISTS uq_static_analysis_file
    ON static_analysis (file_id);
CREATE UNIQUE INDEX IF NOT EXISTS uq_ember_features_analysis
    ON ember_features (analysis_id);
CREATE UNIQUE INDEX IF NOT EXISTS uq_predictions_feature
    ON predictions (feature_id);

CREATE INDEX IF NOT EXISTS ix_files_upload_time ON files (upload_time DESC);
CREATE INDEX IF NOT EXISTS ix_alerts_is_read ON alerts (is_read);
CREATE INDEX IF NOT EXISTS ix_threat_logs_status ON threat_logs (status);

COMMIT;
