const express = require('express')
const { cache, wtf } = require('../init')


const getAllUserAddrs = async () => {
  let allAddrs = cache.get('allUserAddresses')
  if (allAddrs) {
    return allAddrs
  }
  allAddrs = await wtf.getAllUserAddresses()
  let success = cache.set('allUserAddresses', allAddrs, 300) // 60s == delete from cache after 1 minute
  return allAddrs
}

module.exports = {
  getAllUserAddresses: async (req, res) => {
    const allAddrs = await getAllUserAddrs()
    return res.status(200).json({ allAddrs: allAddrs })
  }
}
