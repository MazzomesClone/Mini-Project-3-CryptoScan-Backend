const mongoose = require('mongoose')
const Schema = mongoose.Schema
const ObjectId = Schema.Types.ObjectId

const savedSymbolSchema = new Schema({
    symbolId: { type: String, trim: true, required: true },
    userId: { type: ObjectId, trim: true, required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("savedsymbol", savedSymbolSchema)