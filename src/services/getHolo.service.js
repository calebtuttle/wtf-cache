const express = require('express')
const { db, wtf } = require('../init')
const dbWrapper = require('../utils/dbWrapper')

const chain = process.env.WTF_USE_TEST_CONTRACT_ADDRESSES == "true"
              ? 'ethereum' : 'gnosis'

const getHolo = async (address) => {
  address = address.toLowerCase()
  console.log('getHolo: Entered')
  let user = await dbWrapper.getUserByAddress(address)
  if (user) {
    // Reshape to include chain/network. This is the shape of the response from wtf-lib.
    let userHolo = {}
    userHolo[chain] = {
      'name': user['name'],
      'bio': user['bio'],
      'orcid': user['orcid'],
      'google': user['google'],
      'github': user['github'],
      'twitter': user['twitter'],
      'discord': user['discord']
    }
    console.log('Retrieved holo from cache. Returning it now.')
    console.log(userHolo)
    return userHolo
  }
  console.log(`No user with address ${address} in cache. Retrieving holo with wtf-lib.`)
  const userHolo = await wtf.getHolo(address)
  console.log(`getHolo: Retrieved holo for ${address} with wtf-lib. Updating db and returning.`)
  console.log(userHolo)
  const columns = '(address, name, bio, orcid, google, github, twitter, discord)'
  const params = [
    address,
    userHolo[chain]['name'],
    userHolo[chain]['bio'],
    userHolo[chain]['orcid'],
    userHolo[chain]['google'],
    userHolo[chain]['github'],
    userHolo[chain]['twitter'],
    userHolo[chain]['discord']
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
