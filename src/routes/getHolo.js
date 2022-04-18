const express = require('express')
const router = express.Router()

const getHolo = require('../services/getHolo.service')

router.get('/', getHolo.getHolo)

module.exports = router
