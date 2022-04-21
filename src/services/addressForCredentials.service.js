const express = require('express')
const { cache, wtf } = require('../init')

/**
 * Get the crypto address linked to the provided credentials.
 * Example request: 
 * curl -X GET https://sciverse.id/addressForCredentials?credentials=email&service=google
 */
const getAddressForCredentials = async (req, res) => {
  // The key-value pairing for a cached addressForCredentials object looks like this:
  // {creds<credentials><service> : <crypto_address>}
  console.log('Entered getAddressForCredentials')
  let address = cache.get(`creds${req.query.credentials}${req.query.service}`)
  if (address) {
    console.log('getAddressForCredentials: got creds from cache. returning it now')
    return res.status(200).json(address)
  }
  console.log('getAddressForCredentials: no creds in cache. retrieving it from wtf-lib')
  address = await wtf.addressForCredentials(req.query.credentials, req.query.service)
  let success = cache.set(`creds${req.query.credentials}${req.query.service}`, address, 0) // 0s == never delete
  return res.status(200).json(address)
}

/**
 * Set the crypto address linked to the provided credentials.
 * Requires 'Authorization' header.
 * Example request: 
 * curl -d '{"address": "0x123"}' -H "Authorization: 0xabc..." -X POST https://sciverse.id/addressForCredentials?credentials=email&service=google
 */
const setAddressForCredentials = async (req, res) => {
  if (req.get('Authorization') != process.env.AUTH_KEY) {
    return res.status(403).json({ message: 'Invalid auth token' })
  }
  console.log('Entered setAddressForCredentials')
  let success = cache.set(`creds${req.query.credentials}${req.query.service}`, req.body.address, 0)
  console.log('setAddressForCredentials: successfully set address: ', success)
  return res.status(200).json({ 'success': success })
}


module.exports = {
  getAddressForCredentials: getAddressForCredentials,
  setAddressForCredentials: setAddressForCredentials
}
