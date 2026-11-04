import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';

const ROOT_DIR = process.cwd();
const PORT = process.env.PORT || 3000;

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.pdf': 'application/pdf'
};

export default function handler(req, res) {
  let reqPath = req.url.split('?')[0];
  if (reqPath === '/' || reqPath === '') {
    reqPath = '/index.html';
  }

  // Check public directory first, then root directory
  let filePath = path.join(ROOT_DIR, 'public', reqPath);
  if (!fs.existsSync(filePath)) {
    filePath = path.join(ROOT_DIR, reqPath);
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      if (res.writeHead) {
        res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('404 Not Found');
      } else if (res.status) {
        res.status(404).send('404 Not Found');
      }
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    const cacheControl = ext === '.html' ? 'no-cache' : 'public, max-age=31536000, immutable';

    if (res.writeHead) {
      res.writeHead(200, {
        'Content-Type': contentType,
        'Cache-Control': cacheControl
      });
      fs.createReadStream(filePath).pipe(res);
    } else {
      res.setHeader('Content-Type', contentType);
      res.setHeader('Cache-Control', cacheControl);
      fs.createReadStream(filePath).pipe(res);
    }
  });
}

// Only start the HTTP listener if running locally (not in Vercel serverless environment)
if (!process.env.VERCEL) {
  const server = http.createServer((req, res) => {
    handler(req, res);
  });

  server.listen(PORT, () => {
    console.log(`\n======================================================`);
    console.log(`Shri Laxmi Industries Website is live!`);
    console.log(`Local preview: http://localhost:${PORT}`);
    console.log(`======================================================\n`);
  });
}
