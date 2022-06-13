const express = require('express')
const { redisClient, wtf } = require('../init')


const getAllUserAddrs = async () => {
  console.log('getAllUserAddresses: Entered')
  try {
    const allAddrs = await redisClient.json.get(`addresses`, {
      path: '.'
    });
    if (allAddrs.length > 0) {
      console.log('getAllUserAddresses: Retrieved addresses from database. Returning.')
      return allAddrs
    }
  }
  catch (err) {
    console.log(err)
  }
  console.log('getAllUserAddresses: Addresses not in database. Retrieving with wtf-lib.')
  try {
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
  catch (err) {
    console.log(err)
  }
}

module.exports = {
  getAllUserAddresses: async (req, res) => {
    const allAddrs = await getAllUserAddrs()
    return res.status(200).json(allAddrs)
  }
}
