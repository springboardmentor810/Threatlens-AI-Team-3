"""Add audit timestamps and soft-delete support."""

from alembic import op
import sqlalchemy as sa

revision = "20260901_01"
down_revision = "20260901_00"
branch_labels = None
depends_on = None

AUDIT_TABLES = [
    "users",
    "files",
    "static_analysis",
    "ember_features",
    "predictions",
    "threat_logs",
    "alerts",
    "reports",
]


def upgrade() -> None:
    for table_name in AUDIT_TABLES:
        op.add_column(
            table_name,
            sa.Column("updated_at", sa.DateTime(), server_default=sa.text("CURRENT_TIMESTAMP"), nullable=False),
        )
    op.add_column("files", sa.Column("deleted_at", sa.DateTime(), nullable=True))
    op.create_index("ix_files_deleted_at", "files", ["deleted_at"])


def downgrade() -> None:
    op.drop_index("ix_files_deleted_at", table_name="files")
    op.drop_column("files", "deleted_at")
    for table_name in reversed(AUDIT_TABLES):
        op.drop_column(table_name, "updated_at")
