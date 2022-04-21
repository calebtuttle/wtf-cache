const express = require('express')
const { db, wtf } = require('../init')
const dbWrapper = require('../utils/dbWrapper')


const getHolo = async (address) => {
  console.log('getHolo: Entered')
  let user = await dbWrapper.getUserByAddress(address)
  if (user) {
    // Reshape so that it is backwards-compatible / compatible with frontend.
    let userHolo = {
      'gnosis': {
        'name': user['name'],
        'bio': user['bio'],
        'creds': {
          'orcid': user['orcid'],
          'google': user['google'],
          'github': user['github'],
          'twitter': user['twitter'],
          'discord': user['discord']
        }
      }
    }
    console.log('Retrieved holo from cache. Returning it now.')
    return userHolo
  }
  console.log(`No user with address ${address} in cache. Retrieving holo with wtf-lib.`)
  const userHolo = await wtf.getHolo(address)
  console.log(`getHolo: Retrieved holo for ${address} with wtf-lib. Updating db and returning.`)
  const columns = '(address, name, bio, orcid, google, github, twitter, discord)'
  const params = [
    address, 
    userHolo['gnosis']['name'],
    userHolo['gnosis']['name'],
    userHolo['gnosis']['creds']['orcid'],
    userHolo['gnosis']['creds']['google'],
    userHolo['gnosis']['creds']['github'],
    userHolo['gnosis']['creds']['twitter'],
    userHolo['gnosis']['creds']['discord']
  ]
  dbWrapper.runSql(`INSERT INTO users ${columns} VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, params)
  console.log(`getHolo: Updated database for ${address}. Returning.`)
  return userHolo
}

module.exports = {
  getHolo: async (req, res) => {
    const userHolo = await getHolo(req.query.address)
    return res.status(200).json(userHolo)
  }
}
