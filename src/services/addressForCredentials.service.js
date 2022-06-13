const express = require('express')
const { redisClient, wtf } = require('../init')

/**
 * Get the crypto address linked to the provided credentials.
 * Example request: 
 * curl -X GET https://sciverse.id/addressForCredentials?credentials=email&service=google
 */
const getAddressForCredentials = async (service, credentials) => {
  console.log('getAddressForCredentials: Entered')
  for (const network of wtf.getSupportedNetworks()) {
    try {
      const address = await redisClient.json.get(`${network}${service}${credentials}`, {
        // JSON Path: .node = the element called 'node' at root level.
        path: '.'
      });
      if (address) {
        console.log('getAddressForCredentials: Retrieved address from cache. Returning now.')
        return address
      }
    }
    catch (err) {
      console.log(err)
    }
  }
  console.log('getAddressForCredentials: No address in cache. Retrieving it with wtf-lib')
  try {
    const address = await wtf.addressForCredentials(credentials, service)
    return address
  }
  catch (err) {
    console.log(err)
  }
}


module.exports = {
  getAddressForCredentials: async (req, res) => {
    const address = await getAddressForCredentials(req.query.service, req.query.credentials)
    return res.status(200).json(address)
  }
}
