const express = require('express')
const { cache, wtf } = require('../init')


module.exports = {
  addressForCredentials: async (req, res) => {
    // The key-value pairing for a cached addressForCredentials object looks like this:
    // {creds<credentials><service> : <crypto_address>}
    console.log('entered addressForCredentials')
    let address = cache.get(`creds${req.query.credentials}${req.query.service}`)
    if (address) {
      console.log('addressForCredentials: got creds from cache. returning it now')
      return res.status(200).json({ address: address })
    }
    console.log('addressForCredentials: no creds in cache. retrieving it from wtf-lib')
    address = await wtf.addressForCredentials(req.query.credentials, req.query.service)
    let success = cache.set(`creds${req.query.credentials}${req.query.service}`, address, 300) // 300s == delete from cache after 5 minutes
    return res.status(200).json({ address: address })
  }
}
