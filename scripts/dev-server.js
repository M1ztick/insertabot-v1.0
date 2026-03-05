#!/usr/bin/env node

/**
 * Insertabot Development Test Server
 *
 * Simple HTTP server for testing the Insertabot widget locally
 * Serves static files and proxies API requests to your Cloudflare Worker
 *
 * Usage:
 *   node dev-server.js
 *   node dev-server.js --port 3000
 *   node dev-server.js --worker-url https://insertabot.io
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

// Configuration
const args = process.argv.slice(2);
const PORT = args.includes('--port') ? parseInt(args[args.indexOf('--port') + 1]) : 8080;
const WORKER_URL = args.includes('--worker-url')
  ? args[args.indexOf('--worker-url') + 1]
  : 'https://insertabot.io';

// MIME types
const MIME_TYPES = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.eot': 'application/vnd.ms-fontobject',
  '.otf': 'font/otf',
};

// Color output helpers
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  dim: '\x1b[2m',
};

function colorize(color, text) {
  return `${colors[color]}${text}${colors.reset}`;
}

// Proxy requests to Cloudflare Worker
async function proxyToWorker(req, res, pathname) {
  // Validate WORKER_URL to prevent SSRF
  let workerOrigin;
  try {
    const workerUrl = new URL(WORKER_URL);
    if (workerUrl.protocol !== 'https:' && workerUrl.protocol !== 'http:') {
      throw new Error('Invalid protocol');
    }
    workerOrigin = workerUrl.origin;
  } catch (error) {
    console.error(colorize('red', '✗ Invalid WORKER_URL:'), error.message);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Invalid worker URL configuration' }));
    return;
  }

  const targetUrl = `${workerOrigin}${pathname}${req.url.includes('?') ? '?' + req.url.split('?')[1] : ''}`;

  console.log(colorize('cyan', '→ PROXY:'), pathname, colorize('dim', `→ ${targetUrl}`));

  const options = {
    method: req.method,
    headers: {
      ...req.headers,
      'host': new URL(WORKER_URL).host,
    },
  };

  // Forward request body for POST/PUT
  if (req.method === 'POST' || req.method === 'PUT') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', async () => {
      try {
        // Validate target URL before fetch
        const validatedUrl = new URL(targetUrl);
        if (validatedUrl.protocol !== 'https:' && validatedUrl.protocol !== 'http:') {
          throw new Error('Invalid target URL protocol');
        }
        
        const response = await fetch(validatedUrl.href, {
          ...options,
          body: body,
        });

        // Copy response headers
        res.writeHead(response.status, {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          ...Object.fromEntries(response.headers.entries()),
        });

        // Stream response body
        const buffer = await response.arrayBuffer();
        res.end(Buffer.from(buffer));
      } catch (error) {
        console.error(colorize('red', '✗ Proxy Error:'), error.message);
        res.writeHead(502, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Bad Gateway', message: error.message }));
      }
    });
  } else {
    try {
      // Validate target URL before fetch
      const validatedUrl = new URL(targetUrl);
      if (validatedUrl.protocol !== 'https:' && validatedUrl.protocol !== 'http:') {
        throw new Error('Invalid target URL protocol');
      }
      
      const response = await fetch(validatedUrl.href, options);

      // Copy response headers (filter out redirect headers to prevent open redirect)
      const safeHeaders = Object.fromEntries(
        Array.from(response.headers.entries()).filter(([key]) => 
          key.toLowerCase() !== 'location' && key.toLowerCase() !== 'refresh'
        )
      );
      
      res.writeHead(response.status, {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        ...safeHeaders,
      });

      // Stream response body
      const buffer = await response.arrayBuffer();
      res.end(Buffer.from(buffer));
    } catch (error) {
      console.error(colorize('red', '✗ Proxy Error:'), error.message);
      res.writeHead(502, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Bad Gateway', message: error.message }));
    }
  }
}

// Serve static files
function serveStaticFile(req, res, filePath) {
  // amazonq-ignore-next-line
  fs.readFile(filePath, (err, data) => {
    if (err) {
      if (err.code === 'ENOENT') {
        res.writeHead(404, { 'Content-Type': 'text/html' });
        res.end('<h1>404 - Not Found</h1>');
        console.log(colorize('red', '✗ 404:'), filePath);
      } else {
        res.writeHead(500, { 'Content-Type': 'text/html' });
        res.end('<h1>500 - Internal Server Error</h1>');
        console.error(colorize('red', '✗ Error:'), err.message);
      }
      return;
    }

    const ext = path.extname(filePath);
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    res.writeHead(200, {
      'Content-Type': contentType,
      'Access-Control-Allow-Origin': '*',
    });
    res.end(data);

    console.log(colorize('green', '✓'), req.method, req.url, colorize('dim', `(${contentType})`));
  });
}

// Create HTTP server
const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url);
  let pathname = parsedUrl.pathname;

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(200, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    });
    res.end();
    return;
  }

  // Root - serve index or list test files
  if (pathname === '/') {
    const testFiles = fs.readdirSync(__dirname)
      .filter(f => f.endsWith('.html') && f.includes('test'))
      .map(f => `<li><a href="/${f}">${f}</a></li>`)
      .join('\n');

    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Insertabot Development Server</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      max-width: 800px;
      margin: 50px auto;
      padding: 20px;
      background: #f5f5f5;
    }
    h1 { color: #333; }
    .box {
      background: white;
      padding: 20px;
      border-radius: 8px;
      margin: 20px 0;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    ul { list-style: none; padding: 0; }
    li { padding: 10px 0; border-bottom: 1px solid #eee; }
    li:last-child { border-bottom: none; }
    a { color: #0066cc; text-decoration: none; }
    a:hover { text-decoration: underline; }
    code { background: #f4f4f4; padding: 2px 6px; border-radius: 3px; }
  </style>
</head>
<body>
  <h1>🚀 Insertabot Development Server</h1>

  <div class="box">
    <h2>Available Test Pages</h2>
    <ul>
      ${testFiles || '<li><em>No test files found</em></li>'}
    </ul>
  </div>

  <div class="box">
    <h2>Configuration</h2>
    <p><strong>Server:</strong> http://localhost:${PORT}</p>
    <p><strong>Worker URL:</strong> ${WORKER_URL}</p>
    <p><strong>Widget Script:</strong> <code>${WORKER_URL}/widget.js</code></p>
  </div>

  <div class="box">
    <h3>Quick Test</h3>
    <p>Create a test page with:</p>
    <pre style="background: #f4f4f4; padding: 15px; border-radius: 5px; overflow-x: auto;"><code>&lt;script src="${WORKER_URL}/widget.js" data-api-key="ib_sk_demo_12345678901234567890123456789012"&gt;&lt;/script&gt;</code></pre>
  </div>
</body>
</html>`;

    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(html);
    console.log(colorize('green', '✓'), 'GET', pathname);
    return;
  }

  // Proxy API requests to Cloudflare Worker
  if (pathname.startsWith('/v1/') || pathname.startsWith('/api/')) {
    await proxyToWorker(req, res, pathname);
    return;
  }

  // Proxy widget.js to Cloudflare Worker (dynamic, no longer a static file)
  if (pathname === '/widget.js') {
    await proxyToWorker(req, res, pathname);
    return;
  }

  // Serve static files
  // Prevent path traversal by normalizing and validating the path
  const normalizedPath = path.normalize(pathname).replace(/^(\.\.\/)+/, '');
  let filePath = path.join(__dirname, normalizedPath);
  
  // Ensure the resolved path is within __dirname
  const resolvedPath = path.resolve(filePath);
  if (!resolvedPath.startsWith(path.resolve(__dirname))) {
    res.writeHead(403, { 'Content-Type': 'text/html' });
    res.end('<h1>403 - Forbidden</h1>');
    console.log(colorize('red', '✗ Path traversal attempt:'), pathname);
    return;
  }

  // Check if file exists
  if (!fs.existsSync(filePath)) {
    res.writeHead(404, { 'Content-Type': 'text/html' });
    res.end('<h1>404 - Not Found</h1>');
    console.log(colorize('red', '✗ 404:'), pathname);
    return;
  }

  // If directory, look for index.html
  // amazonq-ignore-next-line
  if (fs.statSync(filePath).isDirectory()) {
    filePath = path.join(filePath, 'index.html');
  }

  serveStaticFile(req, res, filePath);
});

// Start server
server.listen(PORT, () => {
  console.log('\n' + '='.repeat(60));
  console.log(colorize('green', '✓ Insertabot Development Server Running!'));
  console.log('='.repeat(60));
  console.log('');
  console.log(colorize('blue', '🌍 Local:   ') + colorize('cyan', `http://localhost:${PORT}`));
  console.log(colorize('blue', '🔌 Worker:  ') + colorize('dim', WORKER_URL));
  console.log('');
  console.log(colorize('yellow', '📝 Test Pages:'));

  const testFiles = fs.readdirSync(__dirname)
    .filter(f => f.endsWith('.html') && f.includes('test'));

  if (testFiles.length > 0) {
    testFiles.forEach(file => {
      console.log('   ' + colorize('cyan', `http://localhost:${PORT}/${file}`));
    });
  } else {
    console.log('   ' + colorize('dim', '(No test files found)'));
  }

  console.log('');
  console.log(colorize('dim', 'Press Ctrl+C to stop'));
  console.log('='.repeat(60) + '\n');
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n' + colorize('yellow', '⏹ Shutting down server...'));
  server.close(() => {
    console.log(colorize('green', '✓ Server stopped'));
    process.exit(0);
  });
});
