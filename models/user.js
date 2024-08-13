const { mongoose } = require('mongoose')

mongoose.connect('mongodb://localhost:27017/DataAssociations')


const userShema = mongoose.Schema({
  username: String,
  name: String,
  age: Number,
  email: String,
  password: String,
  post: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'post'
    }
  ]
})

module.exports = mongoose.model('user', userShema)
