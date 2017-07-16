const mongoose = require('mongoose')
const Schema = mongoose.Schema

const messageSchema = new Schema({
  senderId: {
    type: String,
    require: true
  },
  text: {
    type: String
  },
  date: {
    type: Date,
    default: Date.now
  }
})


module.exports = mongoose.model('message', messageSchema)