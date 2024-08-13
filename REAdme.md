> learn about multer


> Multer Configurations

const multer = require('multer')

#### Distorage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/images/uploads')
  },

  filename: function (req, file, cb) {
    crypto.randomBytes(12, function (err, bytes) {
      const fn = bytes.toString('hex') + path.extname(file.originalname)
      cb(null, fn)
    })
  }
})

### upload variables

const upload = multer({ storage: storage })

module.exports = upload



> Understanding of 
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken') -> User autherization middleware
const crypto = require('crypto')



> Schema

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


.populate('user') -> Function use case



<!-- Reduce Fuction in javascript for counting using accumulator -->


