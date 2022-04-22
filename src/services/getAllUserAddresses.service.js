const express = require('express')
const { db, wtf } = require('../init')
const dbWrapper = require('../utils/dbWrapper')


const getAllUserAddrs = async () => {
  console.log('getAllUserAddresses: Entered')
  let allUsers = await dbWrapper.getAllUsers()
  let allAddrs = allUsers.map(user => user['address'])
  if (allAddrs.length > 0) {
    console.log('getAllUserAddresses: Retrieved addresses from database. Returning.')
    return allAddrs
  }
  console.log('getAllUserAddresses: Addresses not in database. Retrieving with wtf-lib.')
  const addrsByChainAndService = await wtf.getAllUserAddresses()
  // Reshape wtf-lib response
  allAddrs = []
  if (addrsByChainAndService) {
    for (const chain of Object.keys(addrsByChainAndService)) {
      for (const service of Object.keys(addrsByChainAndService[chain]))
      allAddrs.push(...addrsByChainAndService[chain][service])
    }
  }
  return [...(new Set(allAddrs))]
}

module.exports = {
  getAllUserAddresses: async (req, res) => {
    const allAddrs = await getAllUserAddrs()
    return res.status(200).json(allAddrs)
  }
}
