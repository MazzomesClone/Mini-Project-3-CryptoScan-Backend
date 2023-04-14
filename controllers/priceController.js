const axios = require('axios')
const { Price, SavedSymbol } = require('../models')
const { isUserIdValid, checkPassword } = require('./userController')

async function updateAllprices() {
    const allSavedSymbols = await SavedSymbol.find({})
    const savedSymbolIdsOnly = allSavedSymbols.map(({ symbolId }) => symbolId)
    const uniqueSymbolIds = [...new Set(savedSymbolIdsOnly)].join(',')

    const { data: responseData } = await axios.get(`https://api.coingecko.com/api/v3/simple/price?ids=${uniqueSymbolIds}&vs_currencies=usd,nzd`)

    for (const [symbolId, price] of Object.entries(responseData)) {

        const filter = { symbolId }
        const newPrice = { price }

        await Price.findOneAndUpdate(filter, newPrice, {
            new: true,
            upsert: true
        })
    }

    console.log('Prices updated:', new Date())
}

async function retrieveAllPrices() {
    const allPrices = await Price.find({})
    const symbolsAndPricesOnly = allPrices.map(({ symbolId, price }) => { return { symbolId, price } })

    return symbolsAndPricesOnly
}

const forceUpdateAllPrices = (req, res) => {
    const { password } = req.query

    if (!checkPassword(password, res)) return

    updateAllprices()
        .then(async () => {
            const prices = await retrieveAllPrices()
            res.send({ result: 200, data: { message: 'All Prices updated: ' + new Date(), prices } })
        })
        .catch((err) => {
            console.log(err);
            res.send({ result: 500, error: err.message })
        })
}

const getAllPrices = (req, res) => {
    retrieveAllPrices()
        .then((result) => {
            res.send({ result: 200, data: result })
        })
        .catch((err) => {
            console.log(err);
            res.send({ result: 500, error: err.message })
        })
}

const getPricesForUser = (req, res) => {

    const { userid: userId } = req.query

    isUserIdValid(userId, res)
        .then(async isValid => {
            if (isValid) {
                try {
                    const savedSymbolsForUser = await SavedSymbol.find({ userId: userId })

                    const pricesForUser = await Promise.all(savedSymbolsForUser.map(async ({ symbolId }) => {
                        const { symbolId: foundSymbolId, price: foundPrice } = await Price.findOne({ symbolId })
                        return { symbolId: foundSymbolId, price: foundPrice }
                    }))

                    res.send({ result: 200, data: { userId, prices: pricesForUser } })

                } catch (err) {
                    if (err.name === 'TypeError') {
                        res.send({ result: 503, error: 'Not all prices for this user have updated, please wait 20sec' })
                    }
                    else {
                        console.log(err.message);
                        res.send({ result: 500, error: err.message })
                    }
                }
            }
        })
}

module.exports = {
    forceUpdateAllPrices,
    getAllPrices,
    updateAllprices,
    getPricesForUser
}