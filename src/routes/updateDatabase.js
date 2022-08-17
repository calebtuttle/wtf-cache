const express = require('express')
const router = express.Router()

const updateDatabase = require('../services/updateDatabase.service')

router.get('/', updateDatabase.updateDatabase)

module.exports = router
