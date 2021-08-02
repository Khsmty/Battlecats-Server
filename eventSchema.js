const mongoose = require('mongoose')

module.exports = mongoose.model(
  'event',
  new mongoose.Schema({
    id: { type: Number, required: true },
    done: { type: Array, default: [] },
  })
)
