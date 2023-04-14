const express = require('express')
const app = express()
const cron = require('node-cron')

require('dotenv').config()
require('./dbConnect')

const { priceController, symbolController } = require('./controllers')

const userRoutes = require('./routes/userRoutes')
const symbolRoutes = require('./routes/symbolRoutes')
const priceRoutes = require('./routes/priceRoutes')

const appName = 'CryptoScan'

app.use(express.json())
app.get("/", (req, res) => {
    res.send({ message: `Welcome to ${appName} - Powered by CoinGecko` })
})

app.use('/api/symbols', symbolRoutes)
app.use('/api/users', userRoutes)
app.use('/api/prices', priceRoutes)

const PORT = process.env.PORT || 8080

app.listen(PORT, () => {
    console.log(`${appName} started - Powered by CoinGecko`)
    console.log(`Server is running on port ${PORT}.`)
    symbolController.updateAllSymbols()
    priceController.updateAllprices()
})

cron.schedule('*/20 * * * * *', () => {
    priceController.updateAllprices()
})

cron.schedule('0 */30 * * * *', () => {
    symbolController.updateAllSymbols()
})