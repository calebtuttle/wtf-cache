/**
 * This script runs alongside cache-server, listening to events on the blockchain and
 * sending POST requests to cache-server to update the its cache.
 */

// const sqlite3 = require('sqlite3').verbose();
const ethers = require('ethers')
const { db, wtf } = require('./init')
const dbWrapper = require('./utils/dbWrapper')

const wtfBiosAddress = process.env.WTF_USE_TEST_CONTRACT_ADDRESSES == "true"
                       ? wtf.getContractAddresses()['WTFBios']['ethereum']
                       : wtf.getContractAddresses()['WTFBios']['gnosis']
const vjwtAddresses = process.env.WTF_USE_TEST_CONTRACT_ADDRESSES == "true"
                      ? wtf.getContractAddresses()['VerifyJWT']['ethereum']
                      : wtf.getContractAddresses()['VerifyJWT']['gnosis']
const providerURL = process.env.WTF_USE_TEST_CONTRACT_ADDRESSES == "true"
                    ? 'https://localhost:8545'
                    : 'https://rpc.gnosischain.com/'
const provider = new ethers.providers.JsonRpcProvider(providerURL)

/**
 * Add event listeners to the WTFBios contract.
 */
const listenToWTFBios = () => {
  console.log('Listening for events from WTFBios')
  const wtfBiosABI = wtf.getContractABIs()['WTFBios']
  const wtfBiosWithProvider = new ethers.Contract(wtfBiosAddress, wtfBiosABI, provider)

  // Update user name/bio in db when SetUserNameAndBio events are emitted
  wtfBiosWithProvider.on("SetUserNameAndBio", async (address) => {
    console.log(`Event listener heard event SetUserNameAndBio for address ${address}`)
    address = address.toLowerCase()
    const newName = await wtf.nameForAddress(address);
    const newBio = await wtf.bioForAddress(address);
    const user = await dbWrapper.getUserByAddress(address)
    if (user) {
      dbWrapper.runSql(`UPDATE users SET name=? bio=? WHERE address=?`, [newName, newBio, address])
    }
    else {
      const columns = '(address, name, bio, orcid, google, github, twitter, discord)'
      const params = [address, newName, newBio, null, null, null, null, null]
      dbWrapper.runSql(`INSERT INTO users ${columns} VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, params)
    }
    console.log(`WTFBios: User with address ${address} set their name/bio. Database has been updated.`);
  })

  // Update user name/bio in db when RemoveUserNameAndBio events are emitted
  wtfBiosWithProvider.on("RemoveUserNameAndBio", async (address) => {
    console.log(`Event listener heard RemoveUserNameAndBio event for address ${address}`)
    address = address.toLowerCase()
    const user = await dbWrapper.getUserByAddress(address)
    if (user) {
      dbWrapper.runSql(`UPDATE users SET name=? bio=? WHERE address=?`, [null, null, address])
    }
    console.log(`WTFBios: User with address ${address} removed their name/bio. Database has been updated.`);
  })
}

/**
 * Add event listeners to the given VerifyJWT contract.
 * @param {string} service e.g., 'google' or 'orcid'
 */
const listenToVerifyJWT = (service) => {
  console.log(`Listening for events from VerifyJWT (${service})`)
  const vjwtAddr = vjwtAddresses[service]
  const vjwtABI = wtf.getContractABIs()['VerifyJWT']
  const vjwtWithProvider = new ethers.Contract(vjwtAddr, vjwtABI, provider)
  vjwtWithProvider.on("JWTVerification", async (verified) => {
    console.log(`Event listener heard JWTVerification event for service ${service}`)
    const allAddrsInContract = await vjwtWithProvider.getRegisteredAddresses()
    const allUsersInDb = await dbWrapper.getAllUsers()
    const allAddrsInDb = allUsersInDb.map(user => user['address'])
    // newAddrs might be one or more addresses, depending on db latency and frequency of JWTVerification
    const newAddrs = allAddrsInContract.filter(x => !allAddrsInDb.has(x))
    for (const address of newAddrs) {
      address = address.toLowerCase()
      const newCreds = wtf.credentialsForAddress(address, service)
      const user = await dbWrapper.getUserByAddress(address)
      if (user) {
        dbWrapper.runSql(`UPDATE users SET ${service}=? WHERE address=?`, [newCreds, address])
      }
      else {
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
        params[paramIndex] = newCreds
        dbWrapper.runSql(`INSERT INTO users ${columns} VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, params)
      }
      console.log(`listenToVerifyJWT: New ${service} credentials for ${address}: ${newCreds}. Database has been updated.`)
    }
    let msg = `VerifyJWT: A user attempted to verify their committed proof. `
    let successMsg = msg + (verified ? 'Attempt succeeded.' : 'Attempt failed.')
    console.log(successMsg);
  })
}

console.log(`cache-updater pid: ${process.pid}`)

if (process.env.WTF_USE_TEST_CONTRACT_ADDRESSES == "true") {
  Promise.all([
    listenToWTFBios(),
    listenToVerifyJWT('orcid'),
    listenToVerifyJWT('google')
  ])
}
else {
  Promise.all([
    listenToWTFBios(),
    listenToVerifyJWT('orcid'),
    listenToVerifyJWT('google'),
    listenToVerifyJWT('github'),
    listenToVerifyJWT('twitter'),
    listenToVerifyJWT('discord'),
  ])
}
