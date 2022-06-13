const express = require('express')
const { redisClient, wtf } = require('../init')

const chain = process.env.WTF_USE_TEST_CONTRACT_ADDRESSES == "true"
              ? 'ethereum' : 'gnosis'

const getHolo = async (address) => {
  address = address.toLowerCase()
  console.log('getHolo: Entered')
  try {
    let userHolo = await redisClient.json.get(address, {
      // JSON Path: .node = the element called 'node' at root level.
      path: '.'
    });
    if (userHolo) {
      console.log('Retrieved holo from cache. Returning it now.')
      console.log(userHolo)
      return userHolo
    }
  }
  catch (err) {
    console.log(err)
  }
  console.log(`No user with address ${address} in cache. Retrieving holo with wtf-lib.`)
  userHolo = await wtf.getHolo(address)
  console.log(`getHolo: Retrieved holo for ${address} with wtf-lib. Returning.`)
  console.log(userHolo)
  return userHolo
}

module.exports = {
  getHolo: async (req, res) => {
    const userHolo = await getHolo(req.query.address)
    return res.status(200).json(userHolo)
  }
}
