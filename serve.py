#!/usr/bin/env python3
"""AstroLaabh Efficacy Meter — local dev server with caching disabled.

Plain `python3 -m http.server` lets the browser cache the ES modules, so edits
to config.js / app.js can appear to "not show up" until a hard refresh. This
server sends no-store headers so every reload fetches the latest files.

    python3 serve.py          # http://localhost:8765
    python3 serve.py 3000     # custom port
"""
import sys
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer

PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 8765


class NoCacheHandler(SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-store, must-revalidate")
        self.send_header("Pragma", "no-cache")
        self.send_header("Expires", "0")
        super().end_headers()


if __name__ == "__main__":
    print(f"AstroLaabh Efficacy Meter → http://localhost:{PORT}  (Ctrl+C to stop)")
    ThreadingHTTPServer(("", PORT), NoCacheHandler).serve_forever()
