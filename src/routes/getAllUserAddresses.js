const express = require('express')
const router = express.Router()

const getAllUserAddresses = require('../services/getAllUserAddresses.service')

router.get('/', getAllUserAddresses.getAllUserAddresses)

module.exports = router
