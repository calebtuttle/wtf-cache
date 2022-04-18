const express = require('express')
const { cache, wtf } = require('../init')


module.exports = {
  getHolo: async (req, res) => {
    // The key-value pairing for a cached holo looks like this:
    // {holo<address> : object_with_same_shape_as_return_value_of_getHolo_in_wtf-lib}
    let userHolo = cache.get(`holo${address}`)
    if (userHolo) {
      return userHolo
    }
    userHolo = await wtf.getHolo(address)
    let success = cache.set(`holo${address}`, userHolo, 300) // 300s == delete from cache after 5 minutes
    return res.status(200).json({ holo: userHolo })
  }
}
