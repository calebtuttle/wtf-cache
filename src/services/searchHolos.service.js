const express = require('express')
const { db, wtf } = require('../init')
const dbWrapper = require('../utils/dbWrapper')


/**
 * Example query with curl:
 * curl -X GET https://sciverse.id/searchHolos?searchStr=someusername
 * @returns An array of holos, where each holo has the shape: 
 * {name: 'username', bio: 'userbio', google: 'xyz@gmail.com',...}
 */
const searchHolos = async (searchStr) => {
  searchStr = searchStr.toLowerCase()
  console.log('searchHolos: Entered')
  const allUsers = await dbWrapper.getAllUsers()

  const startTime = performance.now()
  let matchingHolos = []
  for (const user of allUsers) {
    for (const field of Object.keys(user)) {
      if (!user[field]) {
        continue;
      }
      if (user[field].toLowerCase().includes(searchStr)) {
        matchingHolos.push(user)
        break;
      }
    }
  }
  const ms = performance.now() - startTime
  console.log(`searchHolos: Found ${matchingHolos.length} matching holos in ${ms} milliseconds.`)
  return matchingHolos
}

module.exports = {
  searchHolos: async (req, res) => {
    const holos = await searchHolos(req.query.searchStr)
    return res.status(200).json(holos)
  }
}
