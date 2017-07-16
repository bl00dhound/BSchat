const mongoose = require('mongoose')
const Schema = mongoose.Schema

const userSchema = new Schema({
  nickname: {
    type: String,
    required: true,
    unique: true
  },
  username: {
    type: String,
  },
  status: {
    type: String,
    enum: ['online', 'offline', 'just appeared'],
    required: true
  }
})



module.exports = mongoose.model('user', userSchema)