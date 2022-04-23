/**
 * This script runs alongside cache-server. It queries all WTF 
 * contracts at regular intervals and updates the local database 
 * with the up-to-date user holos.
 */

const ethers = require('ethers')
const { db, wtf } = require('./init')
const dbWrapper = require('./utils/dbWrapper')

const chain = process.env.WTF_USE_TEST_CONTRACT_ADDRESSES == "true" ? 'ethereum' : 'gnosis'
const wtfBiosAddress = wtf.getContractAddresses()['WTFBios'][chain]
const vjwtAddresses = wtf.getContractAddresses()['VerifyJWT'][chain]
const providerURL = process.env.WTF_USE_TEST_CONTRACT_ADDRESSES == "true"
                    ? 'http://localhost:8545'
                    : 'https://rpc.gnosischain.com/'
const provider = new ethers.providers.JsonRpcProvider(providerURL)

/**
 * @param {ethers.Contract} contract A contract (VerifyJWT or WTFBios) instantiated with a provider.
 */
const updateDbEntriesForUsersInContract = async (contract) => {
  const allAddrsInContract = await contract.getRegisteredAddresses()
  for (let address of allAddrsInContract) {
    address = address.toLowerCase()
    const newHolo = await wtf.getHolo(address)
    const params = [
      newHolo[chain]['name'],
      newHolo[chain]['bio'],
      newHolo[chain]['orcid'],
      newHolo[chain]['google'],
      newHolo[chain]['github'],
      newHolo[chain]['twitter'],
      newHolo[chain]['discord']
    ]
    const user = await dbWrapper.getUserByAddress(address)
    if (user) {
      const columns = 'name=?, bio=?, orcid=?, google=?, github=?, twitter=?, discord=?'
      dbWrapper.runSql(`UPDATE users SET ${columns} WHERE address=?`, [...params, address])
      console.log(`cache-updater: Updated entry for user with address ${address}.`)
    }
    else {
      const columns = '(address, name, bio, orcid, google, github, twitter, discord)'
      dbWrapper.runSql(`INSERT INTO users ${columns} VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, [address, ...params])
      console.log(`cache-updater: Created entry for user with address ${address}.`)
    }
  }
}

/**
 * Retrieve registered addresses from each WTF contract, and for each address, 
 * retrieve from the blockchain its holo and update the db with the retrieved holo.
 */
const updateUsersInDb = async () => {
  // Get contracts
  let contracts = []
  for (const service of Object.keys(vjwtAddresses)) {
    const vjwtAddr = vjwtAddresses[service]
    const vjwtABI = wtf.getContractABIs()['VerifyJWT']
    const vjwtWithProvider = new ethers.Contract(vjwtAddr, vjwtABI, provider)
    contracts.push(vjwtWithProvider)
  }
  const wtfBiosABI = wtf.getContractABIs()['WTFBios']
  const wtfBiosWithProvider = new ethers.Contract(wtfBiosAddress, wtfBiosABI, provider)
  contracts.push(wtfBiosWithProvider)

  // Update db
  for (const contract of contracts) {
    await updateDbEntriesForUsersInContract(contract)
  }
}

const runUpdater = async () => {
  const waitTime = 10 * 1000
  setInterval(async () => {
    await updateUsersInDb()
  }, waitTime)
}

console.log(`cache-updater pid: ${process.pid}`)

runUpdater()
