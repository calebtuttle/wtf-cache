const sqlite3 = require('sqlite3').verbose();

const { db } = require('../init')
const { tableNames } = require('../constants')


/**
 * Select from users table where column=value.
 * @returns Row in user table if user exists, null otherwise. Returns first item that matches query.
 */
module.exports.selectUser = (column, value) => {
  return new Promise((resolve, reject) => {
    const statement = 'SELECT * FROM (SELECT * FROM gnosis UNION SELECT ' +
                      '* FROM mumbai UNION SELECT * FROM polygon) as User ' +
                      `WHERE User.${column}=?`
    db.get(statement, value, (err, row) => {
      if (err) {
        console.log(err)
        reject(err)
      } else {
        resolve(row)
      }
    })
  })
}

module.exports.getUserByAddress = async (address) => {
  return await module.exports.selectUser('address', address)
}

/**
 * Get user with specified address on specified chain.
 */
module.exports.getUserByAddressOnChain = (address, chain) => {
  return new Promise((resolve, reject) => {
    db.get(`SELECT * FROM ${chain} WHERE address=?`, [address], (err, row) => {
      if (err) {
        console.log(err)
        reject(err)
      } else {
        resolve(row)
      }
    })
  })
}

/**
 * Get all rows in users table.
 */
module.exports.getAllUsers = () => {
  return new Promise((resolve, reject) => {
    const statement = `SELECT * FROM gnosis UNION SELECT * FROM mumbai UNION SELECT * FROM polygon`
    db.all(statement, [], (err, rows) => {
      if (err) {
        console.log(err)
        reject(err)
      } else {
        resolve(rows)
      }
    })
  })
}

module.exports.getAllUserAddresses = () => {
  return new Promise((resolve, reject) => {
    const statement = 'SELECT User.address FROM (SELECT * FROM gnosis ' +
                      'UNION SELECT * FROM mumbai UNION SELECT * FROM ' +
                      'polygon) as User'
    db.all(statement, [], (err, rows) => {
      if (err) {
        console.log(err)
        reject(err)
      } else {
        resolve(rows.map(row => row.address))
      }
    })
  })
}

/**
 * Run the given SQL command with the given parameters. 
 * Helpful for UPDATEs and INSERTs.
 */
module.exports.runSql = (sql, params) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, (err) => {
      if (err) {
        console.log(err)
        reject(err)
      }
      resolve()
    })
  })
}
