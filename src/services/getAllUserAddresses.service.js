const express = require('express')
const { db, wtf } = require('../init')
const dbWrapper = require('../utils/dbWrapper')


const getAllUserAddrs = async () => {
  console.log('getAllUserAddresses: Entered')
  let allUsers = await dbWrapper.getAllUsers()
  let allAddrs = allUsers.map(user => user['address'])
  if (allAddrs) {
    return allAddrs
  }
  allAddrs = await wtf.getAllUserAddresses()
  return allAddrs
}

module.exports = {
  getAllUserAddresses: async (req, res) => {
    const allAddrs = await getAllUserAddrs()
    return res.status(200).json(allAddrs)
  }
}
