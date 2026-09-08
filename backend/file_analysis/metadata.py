import os
import mimetypes
from datetime import datetime


def extract_metadata(file_path: str):
    size = os.path.getsize(file_path)

    modified = os.path.getmtime(file_path)

    return {
        "file_name": os.path.basename(file_path),
        "file_size": size,
        "file_size_kb": round(size / 1024, 2),
        "mime_type": mimetypes.guess_type(file_path)[0]
        or "application/octet-stream",
        "modified_at": datetime.fromtimestamp(
            modified
        ).isoformat(),
    }