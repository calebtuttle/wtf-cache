const express = require('express')
const cors = require('cors')
const getAllUserAddresses = require('./routes/getAllUserAddresses')
const getHolo = require('./routes/getHolo')
const addressForCredentials = require('./routes/addressForCredentials')

const app = express()
app.use(cors())

var corsOptions = {
  origin: 'http://localhost:3002',
  optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}

app.use(express.json())
app.use('/getAllUserAddresses', cors(corsOptions), getAllUserAddresses)
app.use('/getHolo/', cors(corsOptions), getHolo)
app.use('/addressForCredentials/', cors(corsOptions), addressForCredentials)

module.exports = app
