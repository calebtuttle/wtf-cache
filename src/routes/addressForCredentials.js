const express = require('express')
const router = express.Router()

const addressForCredentials = require('../services/addressForCredentials.service')

router.get('/', addressForCredentials.addressForCredentials)

module.exports = router
