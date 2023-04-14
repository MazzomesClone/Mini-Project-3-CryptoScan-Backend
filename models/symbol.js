const mongoose = require('mongoose')
const Schema = mongoose.Schema

const symbolSchema = new Schema({
    symbolId: { type: String, trim: true, required: true },
    symbol: { type: String, trim: true, required: true },
    name: { type: String, trim: true, required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("symbol", symbolSchema)