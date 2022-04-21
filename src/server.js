/**
 * Run a server that accomplishes two tasks.
 * (1) Expose an API that provides read-access and (for authorized 
 * users only) write-access to a cache of WTF user data.
 * (2) Run an event-listener that automatically updates the cache
 * when certain on-chain events occur.
 * 
 * cache-server accomplishes (1), and cache-updater accomplishes (2).
 */

const cacheServer = require('./cache-server')
const cacheUpdater = require('./cache-updater')

Promise.all([cacheServer.run(), cacheUpdater.run()])
