const express = require('express')
const dbWrapper = require('../utils/dbWrapper')
const { tableNames } = require('../constants')


/**
 * Example query with curl:
 * curl -X GET https://sciverse.id/searchHolos?searchStr=someusername
 * @returns An array of holos, where each holo has the shape: 
 * {name: 'username', bio: 'userbio', google: 'xyz@gmail.com',...}
 */
const searchHolos = async (searchStr) => {
  searchStr = searchStr.toLowerCase()
  console.log('searchHolos: Entered')

  const startTime = performance.now()

  const allUsers = []
  const allAddrs = await dbWrapper.getAllUserAddresses()
  for (const address of allAddrs) {
    const userHolo = {}
    for (const chain of tableNames) {
      const singleChainHolo = await dbWrapper.getUserByAddressOnChain(address, chain)
      if (singleChainHolo) {
        delete singleChainHolo.address
        userHolo[chain] = singleChainHolo
      }
    }
    userHolo.address = address
    allUsers.push(userHolo)
  }

  const matchingHolos = []
  for (const user of allUsers) {
    for (const chain of Object.keys(user)) {
      for (const field of Object.keys(user[chain])) {
        if (!user[chain][field]) {
          continue;
        }
        if (user[chain][field].toLowerCase().includes(searchStr)) {
          matchingHolos.push(user)
          break;
        }
      }
    }
  }
  const ms = performance.now() - startTime
  matchingHolos = new Set(matchingHolos)
  console.log(`searchHolos: Found ${matchingHolos.size} matching holos in ${ms} milliseconds.`)
  return Array.from(matchingHolos)
}

module.exports = {
  searchHolos: async (req, res) => {
    const holos = await searchHolos(req.query.searchStr)
    return res.status(200).json(holos)
  }
}
