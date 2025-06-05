const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = process.env.PORT || 3000;
const dataDir = path.join(__dirname, 'data');
const responsesFile = path.join(dataDir, 'responses.json');

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir);
}
if (!fs.existsSync(responsesFile)) {
  fs.writeFileSync(responsesFile, '[]');
}

function sendJSON(res, filePath) {
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Failed to read file' }));
    } else {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(data);
    }
  });
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

function serveStatic(res, pathname) {
  let filePath = path.join(__dirname, pathname);
  if (pathname === '/' || pathname === '') {
    filePath = path.join(__dirname, 'index2.html');
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
        return sendJSON(res, path.join(__dirname, 'questions_no.json'));
      case '/api/levels':
        return sendJSON(res, path.join(__dirname, 'levels_no.json'));
      case '/api/config':
        return sendJSON(res, path.join(__dirname, 'config_no.json'));
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
