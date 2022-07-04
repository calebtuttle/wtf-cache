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

const getAllUserAddresses_v1 = require('./routes/getAllUserAddresses')
const getHolo_v1 = require('./routes/getHolo')
const addressForCredentials_v1 = require('./routes/addressForCredentials')
const searchHolos_v1 = require('./routes/searchHolos')
app.use('/api/getAllUserAddresses/', getAllUserAddresses_v1)
app.use('/api/getHolo/', getHolo_v1)
app.use('/api/addressForCredentials/', addressForCredentials_v1)
app.use('/api/searchHolos/', searchHolos_v1)

module.exports = app
