const express = require('express')
const { db, wtf } = require('../init')
const dbWrapper = require('../utils/dbWrapper')

/**
 * Get the crypto address linked to the provided credentials.
 * Example request: 
 * curl -X GET https://sciverse.id/addressForCredentials?credentials=email&service=google
 */
const getAddressForCredentials = async (service, credentials) => {
  console.log('getAddressForCredentials: Entered')
  const user = await dbWrapper.selectUser(service, credentials)
  if (user) {
    console.log('getAddressForCredentials: Retrieved address from cache. Returning now.')
    return user['address']
  }
  console.log('getAddressForCredentials: No address in cache. Retrieving it with wtf-lib')
  const address = await wtf.addressForCredentials(credentials, service)
  let paramIndex = 3
  switch (service) {
    case 'google':
      paramIndex = 4;
      break;
    case 'github':
      paramIndex = 5;
      break;
    case 'twitter':
      paramIndex = 6;
      break;
    case 'discord':
      paramIndex = 7;
      break;
  }
  const columns = '(address, name, bio, orcid, google, github, twitter, discord)'
  const params = [address, null, null, null, null, null, null, null]
  params[paramIndex] = credentials
  dbWrapper.runSql(`INSERT INTO users ${columns} VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, params)
  return address
}


module.exports = {
  getAddressForCredentials: async (req, res) => {
    const address = await getAddressForCredentials(req.query.service, req.query.credentials)
    return res.status(200).json(address)
  }
}
