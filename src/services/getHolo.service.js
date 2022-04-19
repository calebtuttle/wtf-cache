const express = require('express')
const { cache, wtf } = require('../init')


module.exports = {
  getHolo: async (req, res) => {
    // The key-value pairing for a cached holo looks like this:
    // {holo<address> : object_with_same_shape_as_return_value_of_getHolo_in_wtf-lib}
    console.log('entered getHolo')
    let userHolo = cache.get(`holo${req.query.address}`)
    console.log('got holo from cache')
    if (userHolo) {
      console.log('got holo from cache. returning it now')
      return res.status(200).json({ holo: userHolo })
    }
    console.log('no holo in cache. Retrieving it from wtf-lib')
    userHolo = await wtf.getHolo(req.query.address)
    let success = cache.set(`holo${req.query.address}`, userHolo, 60) // 60s == delete from cache after 1 minute
    return res.status(200).json({ holo: userHolo })
  }
}
