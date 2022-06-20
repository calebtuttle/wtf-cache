const fs = require('fs/promises')
const moment = require('moment')

const OUTPUT_FILE = process.env.ERROR_LOG

module.exports.logError = async (error, ...args) => {
  try {
    await fs.appendFile(OUTPUT_FILE, '------------------------------------------\n')
    const timestamp = moment().format('yyyy-mm-dd:hh:mm:ss') + '\n'
    await fs.appendFile(OUTPUT_FILE, timestamp)
    await fs.appendFile(OUTPUT_FILE, error + '\n')
    if (args) {
      for (const arg of args) {
        await fs.appendFile(OUTPUT_FILE, arg + '\n')
      }
    }
    await fs.appendFile(OUTPUT_FILE, '------------------------------------------\n')
  }
  catch (error) {
    console.log(error)
    console.log('Error occurred while logging error')
  }
}