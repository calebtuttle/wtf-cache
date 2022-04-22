const sqlite3 = require('sqlite3').verbose();
const wtf = require('wtf-lib')
require('dotenv').config();


if (process.env.WTF_USE_TEST_CONTRACT_ADDRESSES == "true") {
  wtf.setProviderURL({ 'default' : 'http://localhost:8545'})
}
else {
  // wtf.setProviderURL({ 'polygon' : process.env.MORALIS_NODE })
  wtf.setProviderURL({ 'gnosis' : 'https://rpc.gnosischain.com/' })
}

let database = null
if (process.env.WTF_USE_TEST_CONTRACT_ADDRESSES == "true") {
  database = new sqlite3.Database(`${__dirname}/../database/testdb.sqlite3`);
  console.log('Using test database')
}
else {
  database = new sqlite3.Database(`${__dirname}/../database/wtf.sqlite3`);
  console.log('Using prod database')
}
const db = database;
process.on('SIGTERM', () => db.close());
db.serialize(() => {
  const columns = '(address TEXT, name TEXT, bio TEXT, orcid TEXT, google TEXT, github TEXT, twitter TEXT, discord TEXT)'
  db.prepare(`CREATE TABLE IF NOT EXISTS users ${columns}`).run().finalize();
});


module.exports = {
  db: db,
  wtf: wtf,
}
