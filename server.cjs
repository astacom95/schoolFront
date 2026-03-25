const http = require('http');
const next = require('next');

const port = parseInt(process.env.PORT || '3000', 10);
const host = '0.0.0.0';

const app = next({
  dev: false,
  hostname: host,
  port,
});

const handle = app.getRequestHandler();

app.prepare().then(() => {
  http.createServer((req, res) => {
    handle(req, res);
  }).listen(port, host, () => {
    console.log(`Next.js running on http://${host}:${port}`);
  });
}).catch((err) => {
  console.error('Failed to start Next.js:', err);
  process.exit(1);
});
