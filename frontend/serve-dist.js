const http = require('http');
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, 'dist', 'service-report-frontend');
const port = Number(process.env.PORT || 4200);

const mimeTypes = {
  '.css': 'text/css',
  '.html': 'text/html',
  '.ico': 'image/x-icon',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.txt': 'text/plain',
  '.webmanifest': 'application/manifest+json',
};

function sendFile(res, filePath) {
  fs.readFile(filePath, (error, content) => {
    if (error) {
      res.writeHead(500);
      res.end('Failed to read file');
      return;
    }

    res.writeHead(200, {
      'Content-Type': mimeTypes[path.extname(filePath)] || 'application/octet-stream',
      'Cache-Control': 'no-store',
    });
    res.end(content);
  });
}

http
  .createServer((req, res) => {
    const requestPath = decodeURIComponent((req.url || '/').split('?')[0]);
    const normalized = path.normalize(requestPath).replace(/^(\.\.[/\\])+/, '');
    const filePath = path.join(root, normalized === '/' ? 'index.html' : normalized);

    if (!filePath.startsWith(root)) {
      res.writeHead(403);
      res.end('Forbidden');
      return;
    }

    fs.stat(filePath, (error, stats) => {
      if (!error && stats.isFile()) {
        sendFile(res, filePath);
        return;
      }

      sendFile(res, path.join(root, 'index.html'));
    });
  })
  .listen(port, '127.0.0.1', () => {
    console.log(`Frontend static server running at http://127.0.0.1:${port}`);
  });
