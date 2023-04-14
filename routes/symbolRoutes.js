const express = require('express')
const router = express.Router()
const { symbolController } = require('../controllers')

router.get('/', symbolController.getSymbols)

router.post('/update', symbolController.forceUpdateAllSymbols)  // PROTECTED

router.post('/save', symbolController.saveSymbolForUser)    // Needs user ID

router.delete('/unsave', symbolController.unsaveSymbolForUser)    // Needs user ID - PROTECTED

router.get('/saved', symbolController.getSavedSymbolsForUser)   // Needs user ID

module.exports = router