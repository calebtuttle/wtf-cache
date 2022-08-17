const express = require('express')
const { cache } = require('../init')
const { updateUser } = require('../cache-updater/functions')
const { tableNames } = require('../constants')

/**
 * Update database for the given user address.
 */
const updateDatabase = async (address) => {
  console.log('updateDatabase: Entered')

  // Ensure db hasn't been updated recently. This helps prevent DoS attacks
  if (cache.get('updatedRecently')) return false;

  if (!address || address.length != 42 || !address.startsWith('0x')) {
    return false;
  }
  address = address.toLowerCase()

  let success = true;
  for (const chain of tableNames) {
    try {
      await updateUser(address, chain)
    } catch (err) {
      console.log(err)
      success = false;
    }
  }
  cache.set('updatedRecently', true, 20);
  return success;
}


module.exports = {
  updateDatabase: async (req, res) => {
    const success = await updateDatabase(req.query.address)
    return res.status(200).json(success)
  }
}
