/**
 * This script runs alongside cache-server. It queries all WTF 
 * contracts at regular intervals and updates the local database 
 * with the up-to-date user holos.
 */
const { updateUsersInDb } = require('./functions')

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

const runUpdater = async () => {
  const waitTime = 300 * 60 * 1000
  while (true) {
    await updateUsersInDb()
    await sleep(waitTime)
  }
}

console.log(`cache-updater pid: ${process.pid}`)

runUpdater()
