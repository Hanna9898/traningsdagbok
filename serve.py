import os, sys, socketserver, http.server

PORT = int(os.environ.get('PORT', 3737))
os.chdir(os.path.dirname(os.path.abspath(__file__)))

class Handler(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a): pass

    def end_headers(self):
        if self.path.endswith('.html') or self.path in ('/', ''):
            self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate')
        super().end_headers()

httpd = socketserver.TCPServer(('', PORT), Handler)
httpd.allow_reuse_address = True
print(f'Serving on port {PORT}', flush=True)
httpd.serve_forever()
