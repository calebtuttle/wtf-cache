const express = require('express')
const getAllUserAddresses = require('./routes/getAllUserAddresses')
const getHolo = require('./routes/getHolo')

const app = express()

app.use(express.json())
app.use('/getAllUserAddresses', getAllUserAddresses)
app.use('/getHolo/', getHolo)

module.exports = app
