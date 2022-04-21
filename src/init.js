const sqlite3 = require('sqlite3').verbose();
const wtf = require('wtf-lib')
require('dotenv').config();

const db = new sqlite3.Database(`${__dirname}/../database/wtf.sqlite3`);
process.on('SIGTERM', () => db.close());
db.serialize(() => {
  const columns = '(address TEXT, name TEXT, bio TEXT, orcid TEXT, google TEXT, github TEXT, twitter TEXT, discord TEXT)'
  db.prepare(`CREATE TABLE IF NOT EXISTS users ${columns}`).run().finalize();
});

// wtf.setProviderURL({ 'polygon' : process.env.MORALIS_NODE })
wtf.setProviderURL({ 'gnosis' : 'https://rpc.gnosischain.com/' })

module.exports = {
  db: db,
  wtf: wtf,
}
