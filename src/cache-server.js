/**
 * cache-server exposes an API that allows other entities to retrieve
 * and update data in its cache.
 */

const app = require('./index')

console.log(`cache-server pid: ${process.pid}`)

const PORT = 3001
const server = app.listen(PORT, (err) => {
  if (err) throw err
  console.log(`Server running in http://127.0.0.1:${PORT}`)
})

process.on('SIGTERM', () => server.close(() => {
  console.log(`\nClosed server`)
  process.exit(0)
}));
process.on('SIGINT', () => server.close(() => {
  console.log(`\nClosed server`)
  process.exit(0)
}));
