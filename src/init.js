const sqlite3 = require('sqlite3').verbose();
const wtf = require('wtf-lib')
require('dotenv').config();


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


module.exports = {
  db: db,
  wtf: wtf,
}
