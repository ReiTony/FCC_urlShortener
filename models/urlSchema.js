const mongoose = require("mongoose");
const shortid = require("shortid");

const urlSchema = new mongoose.Schema({
  original_url: { type: String, required: true },
  short_url: { type: String, required: false, unique: true, default: shortid.generate },
});

const URLModel = mongoose.model('URL', urlSchema);

module.exports = URLModel;