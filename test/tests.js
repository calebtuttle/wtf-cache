const { createHmac } = require('crypto');
const { expect } = require('chai');
const hre = require('hardhat');
const ethers = require('ethers');
const axios = require('axios');

const dbWrapper = require('../src/utils/dbWrapper');
const { wtf } = require('../src/init');


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
      expect(userHolo['ethereum']['orcid']).to.equal('0000-0002-2308-9517')
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

describe('cache-updater', function () {
  this.timeout(15 * 1000);

  before(async function () {
    const provider = new ethers.providers.JsonRpcProvider("http://localhost:8545");
    const privateKey = '0xf214f2b2cd398c806f84e317254e0f0b801d0643303237d97a22a48e01628897'
    this.wallet = new ethers.Wallet(privateKey, provider);
  })
  
  // TODO...
  // Test orcid vjwt updates when a jwt is verified

  // Test google vjwt updates when a jwt is verified

  // Test wtfBios updates when a name/bio is added, modified, removed
  it('Should update database when user updates their name and bio', async function () {
    const userAddress = this.wallet.address.toLowerCase()
    let userBefore = await dbWrapper.getUserByAddress(userAddress)
    if (!userBefore) {
      const columns = '(address, name, bio, orcid, google, github, twitter, discord)'
      const params = [
        userAddress,
        'Greg', 'Business person',
        '0000-0002-2308-9517',
        'nanaknihal@gmail.com',
        null, null, null
      ]
      dbWrapper.runSql(`INSERT INTO users ${columns} VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, params)
      userBefore = await dbWrapper.getUserByAddress(userAddress)
    }
    const nameBefore = userBefore['name']
    const bioBefore = userBefore['bio']

    console.log(`test.js: User ${userAddress} is submitting a transaction to update their name and bio`)
    const wtfBiosAddress = wtf.getContractAddresses()['WTFBios']['ethereum']
    const wtfBiosABI = require('./utils/contracts/abi/WTFBios.json')
    const wtfBiosWithSigner = new ethers.Contract(wtfBiosAddress, wtfBiosABI, this.wallet)

    const newName = createHmac('sha256', 'bananas').update(nameBefore).digest('hex');
    const newBio = createHmac('sha256', 'bananas').update(bioBefore).digest('hex');
    let tx = await wtfBiosWithSigner.setNameAndBio(newName, newBio)
    await tx.wait()
    console.log(`test.js: User ${userAddress} successfully updated their name and bio. ` 
                + `Waiting for cache-updater to update db.`)

    // The value of wait() must be longer than the wait interval in cache-updater for the test to succeeed
    const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
    await wait(11 * 1000)

    const userAfter = await dbWrapper.getUserByAddress(userAddress)
    const nameAfter = userAfter['name']
    const bioAfter = userAfter['bio']
    expect(nameBefore).to.not.equal(nameAfter)
    expect(bioBefore).to.not.equal(bioAfter)
  })
})


// describe('cache-server and cache-updater together', function () {
//   // TODO: Test cases that rely on both cache-server and cache-updater...
// })
