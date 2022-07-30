const express = require('express')
const { wtf } = require('../init')
const dbWrapper = require('../utils/dbWrapper')
const { tableNames } = require('../constants')

const getHolo = async (address) => {
  console.log('getHolo: Entered')
  if (!address || address.length != 42 || !address.startsWith('0x')) {
    return {}
  }
  address = address.toLowerCase()
  const holo = {}
  for (const chain of tableNames) {
    holo[chain] = await dbWrapper.getUserByAddressOnChain(address, chain)
    if (holo[chain] && holo[chain].address) {
      delete holo[chain].address
    }
  }
  console.log('Retrieved holo from cache. Returning it now.')
  return holo
  // console.log(`No user with address ${address} in cache. Retrieving holo with wtf-lib.`)
  // const userHolo = await wtf.getHolo(address)
  // console.log(`getHolo: Retrieved holo for ${address} with wtf-lib. Returning.`)
  // return userHolo
}

module.exports = {
  getHolo: async (req, res) => {
    const userHolo = await getHolo(req.query.address)
    return res.status(200).json(userHolo)
  }
}
