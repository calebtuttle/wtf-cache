const { expect } = require('chai');
const hre = require('hardhat');
const ethers = require('ethers');
const axios = require('axios');

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


describe('cache-updater', function () {
  // TODO...
})


describe('cache-server and cache-updater together', function () {
  // TODO: Test cases that rely on both cache-server and cache-updater...
})
