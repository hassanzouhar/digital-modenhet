const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = process.env.PORT || 3000;
const dataDir = path.join(__dirname, 'data');
const responsesFile = path.join(dataDir, 'responses.json');

// Paths to JSON resources that should be cached
const dataFiles = {
  questions: path.join(__dirname, 'questions_no.json'),
  levels: path.join(__dirname, 'levels_no.json'),
  config: path.join(__dirname, 'config_no.json')
};

// In-memory cache for the JSON files
const cachedData = {};
const watchers = [];

function loadCache() {
  for (const [key, file] of Object.entries(dataFiles)) {
    try {
      cachedData[key] = fs.readFileSync(file, 'utf8');
    } catch (err) {
      console.error(`Failed to load ${file}:`, err);
      cachedData[key] = 'null';
    }
  }
}

function watchForChanges() {
  for (const [key, file] of Object.entries(dataFiles)) {
    const handler = (curr, prev) => {
      if (curr.mtimeMs !== prev.mtimeMs) {
        try {
          cachedData[key] = fs.readFileSync(file, 'utf8');
          console.log(`${file} updated. Cache refreshed.`);
        } catch (err) {
          console.error(`Failed to reload ${file}:`, err);
        }
      }
    };
    fs.watchFile(file, handler);
    watchers.push({ file, handler });
  }
}

function unwatchFiles() {
  for (const { file, handler } of watchers) {
    fs.unwatchFile(file, handler);
  }
}

loadCache();
watchForChanges();

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir);
}
if (!fs.existsSync(responsesFile)) {
  fs.writeFileSync(responsesFile, '[]');
}

function sendCachedJSON(res, key) {
  const data = cachedData[key];
  if (data === undefined) {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not found' }));
    return;
  }
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(data);
}

function saveResponse(body, res) {
  fs.readFile(responsesFile, 'utf8', (err, data) => {
    let arr = [];
    if (!err) {
      try { arr = JSON.parse(data); } catch (e) {}
    }
    arr.push(body);
    fs.writeFile(responsesFile, JSON.stringify(arr, null, 2), err2 => {
      if (err2) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Could not save response' }));
      } else {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ status: 'saved' }));
      }
    });
  });
}

const staticBasePath = path.resolve(__dirname);

function serveStatic(res, pathname) {
  if (pathname === '/' || pathname === '') {
    pathname = '/index.html';
  }

  const filePath = path.resolve(path.join(staticBasePath, pathname));
  if (!filePath.startsWith(staticBasePath)) {
    res.writeHead(400);
    res.end('Invalid path');
    return;
  }

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404);
      res.end('Not found');
    } else {
      const ext = path.extname(filePath).toLowerCase();
      const mimeTypes = { '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.html': 'text/html' };
      const mime = mimeTypes[ext] || 'application/octet-stream';
      res.writeHead(200, { 'Content-Type': mime });
      res.end(data);
    }
  });
}

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  if (req.method === 'GET') {
    switch (parsedUrl.pathname) {
      case '/api/questions':
        return sendCachedJSON(res, 'questions');
      case '/api/levels':
        return sendCachedJSON(res, 'levels');
      case '/api/config':
        return sendCachedJSON(res, 'config');
      default:
        return serveStatic(res, parsedUrl.pathname);
    }
  } else if (req.method === 'POST' && parsedUrl.pathname === '/api/responses') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const data = JSON.parse(body || '{}');
        saveResponse(data, res);
      } catch (e) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Invalid JSON' }));
      }
    });
  } else {
    serveStatic(res, parsedUrl.pathname);
  }
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

server.on('close', () => {
  unwatchFiles();
});

module.exports = server;
