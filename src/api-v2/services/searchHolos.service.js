const { performance } = require('perf_hooks');
const express = require('express')
const { redisClient, wtf } = require('../../init')


/**
 * Example query with curl:
 * curl -X GET https://sciverse.id/searchHolos?searchStr=someusername
 * @returns An array of holos, where each holo has the shape: 
 * {name: 'username', bio: 'userbio', google: 'xyz@gmail.com',...}
 */
const searchHolos = async (searchStr) => {
  searchStr = searchStr.toLowerCase()
  console.log('searchHolos: Entered')
  const allUsers = []
  try {
    const addresses = await redisClient.json.get(`addresses`, {path: '.'});
    for (const addr of addresses) {
      const holo = await redisClient.json.get(addr, {path: '.'});
      allUsers.push(holo)
    }
  }
  catch (error) {
    console.log(error)
  }
  const startTime = performance.now()
  let matchingHolos = []
  for (const user of allUsers) {
    for (const network of Object.keys(user)) {
      for (const field of Object.keys(user[network])) {
        if (!user[network][field]) {
          continue;
        }
        if (user[network][field].toLowerCase().includes(searchStr)) {
          matchingHolos.push(user)
          break;
        }
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
