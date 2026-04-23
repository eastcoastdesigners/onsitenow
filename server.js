import http from 'node:http'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DIST = path.resolve(__dirname, 'dist')
const PORT = parseInt(process.env.PORT || '3000', 10)
const HOST = '0.0.0.0'

if (!fs.existsSync(DIST)) {
  console.error(`ERROR: dist/ folder not found at ${DIST}. Run "npm run build" first.`)
  process.exit(1)
}

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js':   'application/javascript',
  '.mjs':  'application/javascript',
  '.css':  'text/css',
  '.svg':  'image/svg+xml',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.ico':  'image/x-icon',
  '.json': 'application/json',
  '.woff': 'font/woff',
  '.woff2':'font/woff2',
  '.ttf':  'font/ttf',
  '.webp': 'image/webp',
}

function serveFile(filePath, res) {
  const ext = path.extname(filePath).toLowerCase()
  const isHtml = ext === '.html'
  res.writeHead(200, {
    'Content-Type': MIME[ext] || 'application/octet-stream',
    'Cache-Control': isHtml
      ? 'no-cache, no-store, must-revalidate'
      : 'public, max-age=31536000, immutable',
  })
  fs.createReadStream(filePath).pipe(res)
}

function serveIndex(res) {
  serveFile(path.join(DIST, 'index.html'), res)
}

const server = http.createServer((req, res) => {
  const urlPath = req.url.split('?')[0].split('#')[0]
  const filePath = path.resolve(DIST, '.' + urlPath)

  // Block path traversal
  if (!filePath.startsWith(DIST)) {
    res.writeHead(403)
    res.end()
    return
  }

  fs.stat(filePath, (err, stat) => {
    if (!err && stat.isFile()) {
      serveFile(filePath, res)
    } else if (!err && stat.isDirectory()) {
      const indexInDir = path.join(filePath, 'index.html')
      fs.access(indexInDir, fs.constants.F_OK, (e) => {
        if (!e) serveFile(indexInDir, res)
        else serveIndex(res)
      })
    } else {
      // SPA fallback — let React Router handle the route
      serveIndex(res)
    }
  })
})

server.listen(PORT, HOST, () => {
  console.log(`Listening on http://${HOST}:${PORT}`)
})
