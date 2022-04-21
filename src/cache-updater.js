/**
 * This script runs alongside cache-server, listening to events on the blockchain and
 * sending POST requests to cache-server to update the its cache.
 */

const ethers = require('ethers')
const wtf = require('wtf-lib')

const provider = new ethers.providers.JsonRpcProvider('https://rpc.gnosischain.com/')

/**
 * Add event listeners to the WTFBios contract.
 */
const listenToWTFBios = () => {
  const wtfBiosAddr = wtf.getContractAddresses()['WTFBios']['gnosis']
  const wtfBiosABI = wtf.getContractABIs()['WTFBios']
  const wtfBiosWithProvider = new ethers.Contract(wtfBiosAddr, wtfBiosABI, provider)
  wtfBiosWithProvider.on(
    "SetUserNameAndBio",
    async (address) => {
      // TODO: Submit POST request to update holo
      let url = `https://sciverse.id/getHolo?address=${address}`
      let response = await fetch(url)
      let holo = await response.json()
      console.log(`WTFBios: User with address ${address} set their name/bio`);
    }
  )
  wtfBiosWithProvider.on(
    "RemoveUserNameAndBio",
    async (address) => {
      // TODO: Submit POST request to remove holo
      let url = `https://sciverse.id/getHolo?address=${address}`
      let response = await fetch(url)
      let holo = await response.json()
      console.log(`WTFBios: User with address ${address} removed their name/bio`);
    }
  )
}

/**
 * Add event listeners to the given VerifyJWT contract.
 * @param {string} service e.g., 'google' or 'orcid'
 */
const listenToVerifyJWT = (service) => {
  const vjwtAddr = wtf.getContractAddresses()['VerifyJWT']['gnosis'][service]
  const vjwtABI = wtf.getContractABIs()['VerifyJWT']
  const vjwtWithProvider = new ethers.Contract(vjwtAddr, vjwtABI, provider)
  vjwtWithProvider.on(
    "JWTVerification",
    async (verified) => {
      let url = `https://sciverse.id/getHolo?address=${address}`
      let response = await fetch(url)
      let holo = await response.json()
      let msg = `VerifyJWT: A user attempted to verify their committed proof. `
      let successMsg = verified ? 'Attempt succeeded.' : 'Attempt failed.'
      console.log(msg + successMsg);
    }
  )
}

const run = async () => {
  listenToWTFBios()
  listenToVerifyJWT('orcid')
  listenToVerifyJWT('google')
  listenToVerifyJWT('github')
  listenToVerifyJWT('twitter')
  listenToVerifyJWT('discord')

}

module.exports = {
  run: run()
}
