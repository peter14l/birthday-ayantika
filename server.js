/**
 * Local preview server for the static site.
 *
 * GitHub Pages serves the real thing; this exists so `npm start` works
 * offline. It is deliberately small, but it does validate paths and ranges,
 * because a preview server that dies on a stray request is worse than none.
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = Number(process.env.PORT) || 8080;
const HOST = process.env.HOST || '127.0.0.1';
const ROOT = __dirname;

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.gif': 'image/gif',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.mp3': 'audio/mpeg'
};

function send(res, status, body, headers = {}) {
  res.writeHead(status, {
    'Content-Type': 'text/plain; charset=utf-8',
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    ...headers
  });
  res.end(res.req.method === 'HEAD' ? undefined : body);
}

/** Resolve a URL path to a file inside ROOT, or null when it escapes. */
function resolvePath(urlPath) {
  let decoded;
  try {
    decoded = decodeURIComponent(urlPath);
  } catch {
    return null; // malformed percent-encoding
  }

  const relative = decoded === '/' ? 'index.html' : decoded.replace(/^\/+/, '');
  const candidate = path.resolve(ROOT, relative);
  const inside = path.relative(ROOT, candidate);

  if (inside.startsWith('..') || path.isAbsolute(inside)) return null;
  return candidate;
}

/** Parse a Range header. Returns null when the header should be ignored. */
function parseRange(header, size) {
  const match = /^bytes=(\d*)-(\d*)$/.exec(header.trim());
  if (!match) return null;

  let start;
  let end;

  if (match[1] === '' && match[2] === '') return null;

  if (match[1] === '') {
    // Suffix range: the last N bytes.
    const suffix = Number(match[2]);
    if (!Number.isFinite(suffix) || suffix <= 0) return null;
    start = Math.max(size - suffix, 0);
    end = size - 1;
  } else {
    start = Number(match[1]);
    end = match[2] === '' ? size - 1 : Number(match[2]);
  }

  if (!Number.isFinite(start) || !Number.isFinite(end)) return null;
  if (start > end || start >= size) return 'invalid';

  return { start, end: Math.min(end, size - 1) };
}

const server = http.createServer((req, res) => {
  try {
    const urlPath = (req.url || '/').split('?')[0];
    const filePath = resolvePath(urlPath);

    if (!filePath) return send(res, 403, 'Forbidden');

    let stats;
    try {
      stats = fs.statSync(filePath);
    } catch {
      return send(res, 404, 'Not Found');
    }

    if (!stats.isFile()) return send(res, 404, 'Not Found');

    const ext = path.extname(filePath).toLowerCase();
    const type = MIME_TYPES[ext] || 'application/octet-stream';
    const isAsset = !['.html', '.json'].includes(ext);

    const common = {
      'Content-Type': type,
      'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Accept-Ranges': 'bytes',
      'Cache-Control': isAsset ? 'public, max-age=86400' : 'no-cache'
    };

    if (req.method !== 'GET' && req.method !== 'HEAD') {
      return send(res, 405, 'Method Not Allowed', { Allow: 'GET, HEAD' });
    }

    const range = req.headers.range ? parseRange(req.headers.range, stats.size) : null;

    if (range === 'invalid') {
      return send(res, 416, 'Range Not Satisfiable', {
        'Content-Range': `bytes */${stats.size}`
      });
    }

    if (range) {
      const length = range.end - range.start + 1;
      res.writeHead(206, {
        ...common,
        'Content-Range': `bytes ${range.start}-${range.end}/${stats.size}`,
        'Content-Length': length
      });

      if (req.method === 'HEAD') return res.end();

      const stream = fs.createReadStream(filePath, { start: range.start, end: range.end });
      stream.on('error', () => res.destroy());
      req.on('close', () => stream.destroy());
      return stream.pipe(res);
    }

    res.writeHead(200, { ...common, 'Content-Length': stats.size });

    if (req.method === 'HEAD') return res.end();

    const stream = fs.createReadStream(filePath);
    stream.on('error', () => res.destroy());
    req.on('close', () => stream.destroy());
    stream.pipe(res);
  } catch (error) {
    console.error(`[error] ${req.method} ${req.url}:`, error.message);
    if (!res.headersSent) send(res, 500, 'Internal Server Error');
    else res.destroy();
  }
});

server.on('clientError', (error, socket) => {
  if (socket.writable) socket.end('HTTP/1.1 400 Bad Request\r\n\r\n');
});

server.listen(PORT, HOST, () => {
  console.log(`Previewing http://${HOST}:${PORT}`);
});

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => server.close(() => process.exit(0)));
}
