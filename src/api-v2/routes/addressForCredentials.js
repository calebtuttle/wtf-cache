const express = require('express')
const router = express.Router()

const addressForCredentials = require('../services/addressForCredentials.service')

router.get('/', addressForCredentials.getAddressForCredentials)

module.exports = router
