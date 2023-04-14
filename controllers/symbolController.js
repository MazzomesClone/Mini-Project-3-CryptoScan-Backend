const axios = require('axios')
const { Symbol, SavedSymbol, Price } = require('../models')
const { isUserIdValid, checkPassword } = require('./userController')

async function updateAllSymbols() {

    try {
        const response = await axios.get('https://api.coingecko.com/api/v3/coins/list?include_platform=false')

        response.data.forEach(async symbol => {

            const filter = {
                symbolId: symbol.id
            }

            const newSymbol = {
                symbol: symbol.symbol,
                name: symbol.name
            }

            await Symbol.findOneAndUpdate(filter, newSymbol, {
                new: true,
                upsert: true
            })
        })

        console.log('All symbols updated:', new Date())

    } catch (err) {
        console.log(err.message)
    }

}

const getSymbols = (req, res) => {
    Symbol.find({})
        .then(data => res.send({ result: 200, data: data }))
        .catch(err => {
            console.log(err);
            res.send({ result: 500, error: err.message })
        })
}

const forceUpdateAllSymbols = (req, res) => {
    const { password } = req.query

    if (!checkPassword(password, res)) return

    updateAllSymbols()
        .then(() => {
            getSymbols(req, res)
        })
        .catch(err => {
            console.log(err)
            res.send({ result: 500, error: err.message })
        })
}

const saveSymbolForUser = (req, res) => {

    const { userid: userId, symbolid: symbolIdToSave } = req.query

    if (!symbolIdToSave) {
        res.send({ result: 400, error: 'Please provide Symbol ID' })
        return
    }

    isUserIdValid(userId, res)
        .then(async isValid => {
            if (isValid) {
                try {
                    const symbolResult = await Symbol.findOne({ symbolId: symbolIdToSave })

                    if (!symbolResult) {
                        res.send({ result: 400, error: 'Invalid Symbol ID' })
                        return
                    }

                    const alreadySaved = await SavedSymbol.findOne({ userId: userId, symbolId: symbolResult.symbolId })
                    if (alreadySaved) {
                        res.send({ result: 304, data: alreadySaved })
                        return
                    }

                    else {
                        const newData = {
                            userId: userId,
                            symbolId: symbolResult.symbolId
                        }

                        new SavedSymbol(newData).save()
                            .then(newEntry => {
                                res.send({ status: 200, data: newEntry })
                            })
                            .catch(err => {
                                console.log(err.message);
                                res.send({ result: 500, error: err.message })
                            })
                    }

                } catch (err) {
                    console.log(err)
                    res.send({ result: 500, error: err.message })
                }
            }
        })
}

const unsaveSymbolForUser = (req, res) => {
    const { userid: userId, symbolid: symbolIdToUnsave, password } = req.query

    if (!checkPassword(password, res)) return

    if (!symbolIdToUnsave) {
        res.send({ result: 400, error: 'Please provide Symbol ID' })
        return
    }

    isUserIdValid(userId, res)
        .then(async isValid => {
            if (isValid) {
                try {
                    const symbolResult = await SavedSymbol.findOneAndDelete({ userId: userId, symbolId: symbolIdToUnsave })
                    res.send({ result: (symbolResult) ? 200 : 304, data: symbolResult })

                    const priceResult = await SavedSymbol.findOne({ symbolId: symbolIdToUnsave })
                    if (!priceResult) await Price.findOneAndDelete({ symbolId: symbolIdToUnsave })

                } catch (err) {
                    console.log(err)
                    res.send({ result: 500, error: err.message })
                }
            }
        })
}

const getSavedSymbolsForUser = (req, res) => {

    const { userid: userId } = req.query

    isUserIdValid(userId, res)
        .then(async isValid => {
            if (isValid) {
                try {

                    const savedSymbolsForUser = await SavedSymbol.find({ userId })
                    const savedSymbolsOnly = savedSymbolsForUser.map(({ symbolId }) => { return { symbolId } })

                    const responseData = {
                        userId,
                        saved: savedSymbolsOnly
                    }

                    res.send({ result: 200, data: responseData })

                } catch (err) {
                    console.log(err);
                    res.send({ result: 500, error: err.message })
                }
            }
        })
}

module.exports = {
    getSymbols,
    forceUpdateAllSymbols,
    updateAllSymbols,
    saveSymbolForUser,
    getSavedSymbolsForUser,
    unsaveSymbolForUser
}