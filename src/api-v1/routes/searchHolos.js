const express = require('express')
const router = express.Router()

const searchHolos = require('../services/searchHolos.service')

router.get('/', searchHolos.searchHolos)

module.exports = router
