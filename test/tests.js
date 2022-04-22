const { expect } = require('chai');
const hre = require('hardhat');
const ethers = require('ethers');
const axios = require('axios');

const dbWrapper = require('../src/utils/dbWrapper');
const { wtf } = require('../src/init');

/**
 * TODO: Test
 * - The helper functions in dbWrapper.
 * - That cache-updater hears all events emitted.
 * - That cach-updater correctly updates the database.
 */

describe('cache-server', function () {

  before(async function () {
    const provider = new ethers.providers.JsonRpcProvider("http://localhost:8545");
    const privateKey = '0x3a73865117f803f861db17ef7fe3381c0a1a809c11e74fdeac4f72ac5536b0fe';
    this.wallet = new ethers.Wallet(privateKey, provider);
    await hre.network.provider.send("hardhat_setBalance", [this.wallet.address, "0x1000000000000000000000",]);
  })

  describe('/getAllUserAddresses', function () {
    it('Should return an array of all registered addresses accross vjwt and wtfBios contracts', async function () {
      let url = 'http://localhost:3000/getAllUserAddresses'
      const response = await axios.get(url)
      const addresses = (await response.data).map(addr => addr.toLowerCase())
      expect(addresses).to.be.an('array').that.includes.members([this.wallet.address.toLowerCase()])
    })
  })

  describe('/getHolo', function () {
    it('Should return the correct holo', async function () {
      let url = `http://localhost:3000/getHolo?address=${this.wallet.address}`
      const response = await axios.get(url)
      const userHolo = await response.data
      expect(userHolo).to.be.an('object')
      expect(userHolo['ethereum']['name']).to.equal('Greg')
      expect(userHolo['ethereum']['bio']).to.equal('Business person')
      expect(userHolo['ethereum']['creds']['orcid']).to.equal('0000-0002-2308-9517')
    })
  })

  describe('/addressForCredentials', function () {
    it('Should return the correct holo', async function () {
      let url = `http://localhost:3000/addressForCredentials?service=orcid&credentials=0000-0002-2308-9517`
      const response = await axios.get(url)
      const address = await response.data
      expect(address.toLowerCase()).to.equal(this.wallet.address.toLowerCase())
    })
  })
})

// NOTE: cache-updater doesn't seem to be working. Events seem to never be heard.
// TODO: Don't use events. Just check the blockchain and update the cache at regular intervals.
describe('cache-updater', function () {

  before(async function () {
    const provider = new ethers.providers.JsonRpcProvider("http://localhost:8545");
    const privateKey = '0x3a73865117f803f861db17ef7fe3381c0a1a809c11e74fdeac4f72ac5536b0fe';
    this.wallet = new ethers.Wallet(privateKey, provider);
    await hre.network.provider.send("hardhat_setBalance", [this.wallet.address, "0x1000000000000000000000",]);
  })
  
  // TODO...
  // Test orcid vjwt updates when a jwt is verified

  // Test google vjwt updates when a jwt is verified

  // Test wtfBios updates when a name/bio is added, modified, removed
  it('Should update database when user updates their name and bio', async function () {
    const columns = '(address, name, bio, orcid, google, github, twitter, discord)'
    const params = [
      this.wallet.address,
      'Greg', 'Business person',
      '0000-0002-2308-9517',
      'nanaknihal@gmail.com',
      null, null, null
    ]
    // dbWrapper.runSql(`INSERT INTO users ${columns} VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, params)

    // await setTimeout(function () { console.log('timeout...') }, 1000)

    const userBefore = await dbWrapper.getUserByAddress(this.wallet.address)
    const nameBefore = userBefore['name']
    const bioBefore = userBefore['bio']

    console.log(`User ${this.wallet.address} is submitting a transaction to update their name and bio`)
    const wtfBiosAddress = process.env.WTF_USE_TEST_CONTRACT_ADDRESSES == "true"
                           ? wtf.getContractAddresses()['WTFBios']['ethereum']
                           : wtf.getContractAddresses()['WTFBios']['gnosis']
    const wtfBiosABI = require('./utils/contracts/abi/WTFBios.json')
    const wtfBiosWithSigner = new ethers.Contract(wtfBiosAddress, wtfBiosABI, this.wallet)
    let tx = await wtfBiosWithSigner.setNameAndBio('newName', 'newBio')
    await tx.wait()
    console.log(`User ${this.wallet.address} successfully updated their name and bio`)

    // await setTimeout(function () { console.log('timeout...') }, 1000)

    const userAfter = await dbWrapper.getUserByAddress(this.wallet.address)
    const nameAfter = userAfter['name']
    const bioAfter = userAfter['bio']

    expect(nameBefore).to.not.equal(nameAfter)
    expect(bioBefore).to.not.equal(bioAfter)
  })
})


describe('cache-server and cache-updater together', function () {
  // TODO: Test cases that rely on both cache-server and cache-updater...
})
