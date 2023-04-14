const express = require('express')
const router = express.Router()
const { priceController } = require('../controllers')

router.get('/', priceController.getAllPrices)

router.get('/update', priceController.forceUpdateAllPrices) // PROTECTED

router.get('/saved', priceController.getPricesForUser)  // Needs user ID

module.exports = router