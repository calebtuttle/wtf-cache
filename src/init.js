const { createClient } = require('redis');
const sqlite3 = require('sqlite3').verbose();
const wtf = require('wtf-lib')
require('dotenv').config();


/** API v1 */
let database = null
if (process.env.WTF_USE_TEST_CONTRACT_ADDRESSES == "true") {
  database = new sqlite3.Database(`${__dirname}/../database/testdb.sqlite3`);
  console.log('Using test database')
}
else {
  database = new sqlite3.Database(`${__dirname}/../database/wtf.sqlite3`);
  console.log('Using production database')
}
const db = database;
process.on('SIGTERM', () => db.close());
db.serialize(() => {
  const columns = '(address TEXT, name TEXT, bio TEXT, orcid TEXT, google TEXT, github TEXT, twitter TEXT, discord TEXT)'

  // Every table here is a user table. The table name is the name of the chain (lower cased) to be compatible with frontend.
  db.prepare(`CREATE TABLE IF NOT EXISTS gnosis ${columns}`).run().finalize();
  db.prepare(`CREATE TABLE IF NOT EXISTS polygon ${columns}`).run().finalize();
  db.prepare(`CREATE TABLE IF NOT EXISTS mumbai ${columns}`).run().finalize();
  // db.prepare(`CREATE TABLE IF NOT EXISTS EthereumUser ${columns}`).run().finalize();
  // db.prepare(`CREATE TABLE IF NOT EXISTS KovanUser ${columns}`).run().finalize();
  // db.prepare(`CREATE TABLE IF NOT EXISTS ArbitrumUser ${columns}`).run().finalize();
  // db.prepare(`CREATE TABLE IF NOT EXISTS OptimismUser ${columns}`).run().finalize();
  // db.prepare(`CREATE TABLE IF NOT EXISTS AvalancheUser ${columns}`).run().finalize();
});


/** API v2 */
if (process.env.WTF_USE_TEST_CONTRACT_ADDRESSES == "true") {
  wtf.setProviderURL({ 'default' : 'http://localhost:8545'})
}
else {
  wtf.setProviderURL({ 
    'gnosis' : 'https://rpc.gnosischain.com/',
    'polygon' : process.env.MORALIS_NODE,
    'mumbai' : process.env.MORALIS_NODE,
  })
}

const redisClient = createClient();
redisClient.connect().then(val => console.log('Connected to redis db on port 6379'))


module.exports = {
  db: db, // v1 db
  redisClient: redisClient, // v2 db
  wtf: wtf,
}
