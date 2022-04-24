const express = require('express')
const cors = require('cors')
const getAllUserAddresses = require('./routes/getAllUserAddresses')
const getHolo = require('./routes/getHolo')
const addressForCredentials = require('./routes/addressForCredentials')
const searchHolos = require('./routes/searchHolos')
const init = require('./init')

const app = express()
app.use(cors())

var corsOptions = {
  origin: ["https://whoisthis.wtf", "https://www.whoisthis.wtf", "http://localhost:3002"],
  optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}

app.use(express.json())
app.use(express.urlencoded({extended: true}))
app.use('/getAllUserAddresses', cors(corsOptions), getAllUserAddresses)
app.use('/getHolo/', cors(corsOptions), getHolo)
app.use('/addressForCredentials/', cors(corsOptions), addressForCredentials)
app.use('/searchHolos/', cors(corsOptions), searchHolos)

module.exports = app
