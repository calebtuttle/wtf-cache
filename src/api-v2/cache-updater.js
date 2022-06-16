/**
 * This script runs alongside cache-server. It queries all WTF 
 * contracts at regular intervals and updates the local database 
 * with the up-to-date user holos.
 */

const ethers = require('ethers')
const { redisClient, wtf } = require('../init')

const wtfBiosAddresses = wtf.getContractAddresses()['WTFBios']
const vjwtAddresses = wtf.getContractAddresses()['VerifyJWT']

const testProviders = {
  'ethereum': new ethers.providers.JsonRpcProvider('http://localhost:8545')
}
const prodProviders = {
  'gnosis': new ethers.providers.JsonRpcProvider('https://rpc.gnosischain.com/'),
  'mumbai': new ethers.providers.JsonRpcProvider(process.env.MORALIS_NODE)
}
const providers = process.env.WTF_USE_TEST_CONTRACT_ADDRESSES == "true"
                  ? testProviders : prodProviders

/**
 * @param {ethers.Contract} contract A contract (VerifyJWT or WTFBios) instantiated with a provider.
 */
const updateDbEntriesForUsersInContract = async (contract) => {
  const allAddrsInContract = await contract.getRegisteredAddresses()
  for (let address of allAddrsInContract) {
    address = address.toLowerCase()

    try {
      const holo = await wtf.getHolo(address)
      holo.address = address

      // RedisJSON uses JSON Path syntax. '.' is the root of the JSON object.
      await redisClient.json.set(address, '.', holo);
  
      // The following is used for getAllUserAddresses
      const addrIndex = await redisClient.json.arrIndex('addresses', '.', address);
      if (addrIndex === -1) await redisClient.json.arrAppend('addresses', '.', address);
  
      // The following mapping is used for addressForCreds
      for (const network of Object.keys(holo)) {
        if (network == 'address') continue
        for (const service of Object.keys(holo[network])) {
          const creds = holo[network][service]
          await redisClient.json.set(`${network}${service}${creds}`, '.', address);
        }
      }
    }
    catch (err) {
      console.log(err)
      console.log(`cache-updater: Encountered error trying to update entry for user with address ${address}`)
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
  for (const network of Object.keys(vjwtAddresses)) {
    const provider = providers[network]
    for (const service of Object.keys(vjwtAddresses[network])) {
      const vjwtAddr = vjwtAddresses[network][service]
      const vjwtABI = wtf.getContractABIs()['VerifyJWT']
      const vjwtWithProvider = new ethers.Contract(vjwtAddr, vjwtABI, provider)
      contracts.push(vjwtWithProvider)
    }
    const wtfBiosAddr = wtfBiosAddresses[network]
    const wtfBiosABI = wtf.getContractABIs()['WTFBios']
    const wtfBiosWithProvider = new ethers.Contract(wtfBiosAddr, wtfBiosABI, provider)
    contracts.push(wtfBiosWithProvider)
  }

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
