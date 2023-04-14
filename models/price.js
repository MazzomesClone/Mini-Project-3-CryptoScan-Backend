const mongoose = require('mongoose')
const Schema = mongoose.Schema

const priceSchema = new Schema({
    symbolId: { type: String, trim: true, required: true },
    price: { type: Object, trim: true, required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("price", priceSchema)