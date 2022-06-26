const express = require('express')
const cors = require('cors')
const init = require('./init')

const app = express()

var corsOptions = {
  // origin: ["https://whoisthis.wtf", "https://www.whoisthis.wtf", "http://localhost:3002"],
  origin: true,
  optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}
app.use(cors(corsOptions))

app.use(express.json())
app.use(express.urlencoded({extended: true}))

/** API v1 */
const getAllUserAddresses_v1 = require('./api-v1/routes/getAllUserAddresses')
const getHolo_v1 = require('./api-v1/routes/getHolo')
const addressForCredentials_v1 = require('./api-v1/routes/addressForCredentials')
const searchHolos_v1 = require('./api-v1/routes/searchHolos')
app.use('/api/getAllUserAddresses/', getAllUserAddresses_v1)
app.use('/api/getHolo/', getHolo_v1)
app.use('/api/addressForCredentials/', addressForCredentials_v1)
app.use('/api/searchHolos/', searchHolos_v1)

/** API v2 */
const getAllUserAddresses_v2 = require('./api-v2/routes/getAllUserAddresses')
const getHolo_v2 = require('./api-v2/routes/getHolo')
const addressForCredentials_v2 = require('./api-v2/routes/addressForCredentials')
const searchHolos_v2 = require('./api-v2/routes/searchHolos')
app.use('/getAllUserAddresses/', getAllUserAddresses_v2)
app.use('/getHolo/', getHolo_v2)
app.use('/addressForCredentials/', addressForCredentials_v2)
app.use('/searchHolos/', searchHolos_v2)

module.exports = app
