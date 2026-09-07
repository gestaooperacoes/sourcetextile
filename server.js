// Servidor estático mínimo para desenvolvimento e testes.
// Serve a pasta-mãe (onde está o "Ficha técnica do produto.html").
// A app continua a funcionar aberta diretamente em file:// — isto é só para os testes.
const http = require('http');
const fs = require('fs');
const path = require('path');

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.json': 'application/json; charset=utf-8'
};

const root = path.join(__dirname, '..');
const INDEX = 'Ficha técnica do produto.html';
const port = process.env.PORT || 4173;

http.createServer((req, res) => {
  const urlPath = decodeURIComponent(req.url.split('?')[0]);
  const filePath = path.normalize(path.join(root, urlPath === '/' ? INDEX : urlPath));
  if (!filePath.startsWith(root)) {
    res.writeHead(403);
    return res.end('Forbidden');
  }
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404);
      return res.end('Not found');
    }
    res.writeHead(200, { 'Content-Type': MIME[path.extname(filePath).toLowerCase()] || 'application/octet-stream' });
    res.end(data);
  });
}).listen(port, () => console.log(`A servir em http://localhost:${port}`));
