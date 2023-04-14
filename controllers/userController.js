const { SavedSymbol, User } = require('../models')

async function isUserIdValid(userId, res) {
    try {
        if (!userId) {
            res.send({ result: 400, data: 'Please provide User ID' })
            return false
        }

        const result = await User.findOne({ _id: userId })

        if (!result) {
            res.send({ result: 400, data: 'User ID not found' })
            return false
        }

        else return true

    } catch (err) {
        if (err.name === 'CastError') {
            res.send({ result: 400, error: 'Invalid User ID - Must be type: ObjectId' })
            return false
        }
        console.log(err)
        res.send({ result: 400, error: err.message })
        return false
    }
}

function checkPassword(password, res) {
    if (!password) {
        res.send({ result: 400, error: 'Must provide password for this action' })
        return false
    }

    if (password !== process.env.PASSWORD) {
        res.send({ result: 400, error: 'Password is incorrect' })
        return false
    }
    return true
}

const createUser = (req, res) => {
    const { name } = req.body

    new User({ name }).save()
        .then(newEntry => {
            res.send({ result: 200, data: newEntry })
        })
        .catch(err => {
            console.log(err)
            res.send({ result: 500, error: err.message })
        })

}

const getUsers = (req, res) => {
    const { userid: userId } = req.query

    if (userId) {
        User.findById(userId)
            .then(data => res.send({ result: 200, data: data }))
            .catch(err => {
                console.log(err);
                res.send({ result: 500, error: err.message })
            })
    }

    else {
        User.find({})
            .then(data => res.send({ result: 200, data: data }))
            .catch(err => {
                console.log(err);
                res.send({ result: 500, error: err.message })
            })
    }
}

const updateUser = (req, res) => {

    const { userid: userId, password } = req.query
    const updateDetails = req.body

    if (!checkPassword(password, res)) return

    isUserIdValid(userId, res)
        .then(async isValid => {
            if (isValid) {
                try {
                    const updatedUser = await User.findByIdAndUpdate(userId, updateDetails, {
                        useFindAndModify: false,
                        new: true
                    })
                    res.send({ result: 200, data: updatedUser })
                } catch (err) {
                    console.log(err);
                    res.send({ result: 500, error: err.message })
                }
            }
        })
}

const deleteUser = (req, res) => {
    const { userid: userId, password } = req.query

    if (!checkPassword(password, res)) return

    isUserIdValid(userId, res)
        .then(async isValid => {
            if (isValid) {
                try {
                    await SavedSymbol.deleteMany({ userId })
                    const deletedUser = await User.findByIdAndDelete(userId)
                    res.send({ result: 200, data: deletedUser })
                } catch (err) {
                    console.log(err);
                    res.send({ result: 500, error: err.message })
                }
            }
        })
}

module.exports = {
    createUser,
    getUsers,
    updateUser,
    deleteUser,
    isUserIdValid,
    checkPassword
}