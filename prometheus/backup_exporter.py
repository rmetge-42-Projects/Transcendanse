#!/usr/bin/env python3
"""Expose the mtime of the newest non-empty encrypted database backup."""
from http.server import BaseHTTPRequestHandler, HTTPServer
from pathlib import Path

BACKUP_DIR = Path("/backups")

class Handler(BaseHTTPRequestHandler):
    def do_GET(self):
        if self.path != "/metrics":
            self.send_error(404)
            return
        candidates = [p for p in BACKUP_DIR.glob("backup_*.sql.enc") if p.is_file() and p.stat().st_size > 0]
        timestamp = max((p.stat().st_mtime for p in candidates), default=0)
        body = (
            "# HELP backup_last_success_timestamp_seconds Unix timestamp of the newest non-empty encrypted backup; 0 means none found.\n"
            "# TYPE backup_last_success_timestamp_seconds gauge\n"
            f"backup_last_success_timestamp_seconds {timestamp:.0f}\n"
        ).encode()
        self.send_response(200)
        self.send_header("Content-Type", "text/plain; version=0.0.4; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def log_message(self, *_args):
        pass

HTTPServer(("0.0.0.0", 9797), Handler).serve_forever()
