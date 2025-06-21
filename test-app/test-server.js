const http = require('http');

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Test server is working!');
});

server.listen(3003, '0.0.0.0', () => {
  console.log('Server running at http://localhost:3003/');
});
