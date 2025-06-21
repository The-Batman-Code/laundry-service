const http = require('http');
const server = http.createServer((req, res) => {
  res.writeHead(200, {'Content-Type': 'text/plain'});
  res.end('Server is working');
});
server.listen(9000, '127.0.0.1', () => {
  console.log('Server running at http://127.0.0.1:9000/');
});
