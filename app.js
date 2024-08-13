const express = require('express')

const app = express()
const userModel = require('./models/user')
const postModel = require('./models/posts')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const path = require('path')

const upload = require('./config/multerconfig')
app.use(express.static(path.join(__dirname, 'public')))

port = 3000

app.listen(port)

// Setup view engine
app.set('view engine', 'ejs')
// expressjson and urlencoded
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// cookie parser
const cookieParser = require('cookie-parser')
app.use(cookieParser())

//! Register the user

// View Page
app.get('/', (req, res) => {
  res.render('register')
})


// register - user
app.post('/register-user', async (req, res) => {
  try {
    let { email, password, username, name, age } = req.body

    let user = await userModel.findOne({ email: email })
    if (user) {
      return res.status(400).json({ message: 'User already exists' })
    }

    const salt = await bcrypt.genSalt(10)
    const hash = await bcrypt.hash(password, salt)

    let newUser = await userModel.create({
      username,
      email,
      password: hash,
      name,
      age
    })

    let token = jwt.sign({ email, userid: newUser._id }, 'aavash')
    res.cookie('token', token)
    res.status(201).json({ message: 'User registered successfully', token })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Something went wrong' })
  }
})

// Login the user
app.get('/login', (req, res) => {
  res.render('login')
})

app.post('/login-user', async (req, res) => {
  try {
    let { email, password } = req.body
    let user = await userModel.findOne({ email: email })
    if (!user) {
      return res.status(400).json({ message: 'User not found' })
    }
    let match = await bcrypt.compare(password, user.password)
    if (!match) {
      return res.status(400).json({ message: 'Invalid password' })
    }
    let token = jwt.sign({ email, userid: user._id }, 'aavash')
    res.cookie('token', token)
    res.redirect('/profile')
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Something went wrong' })
  }
})

// !Protected routes

// Create a new post
app.post('/post', isLoggedIn, async (req, res) => {
  let user = await userModel.findOne({ email: req.user.email })
  let newPost = await postModel.create({
    content: req.body.content,
    user: user._id
  })
  user.post.push(newPost._id)
  await user.save()
  res.redirect('/profile')
})

// Read a new post

app.get('/profile', isLoggedIn, async (req, res) => {
  let user = await userModel.findOne({ email: req.user.email })
  // console.log(user) //  post: [ new ObjectId('66ba3a257a5a4f49e835b3e5') ],
  let post = await user.populate('post')
  //
  //   post: [
  //   {
  //     _id: new ObjectId('66ba3a257a5a4f49e835b3e5'),
  //     user: new ObjectId('66b9f747524eed93219895a1'),
  //     content: 'I am David Goggnis',
  //     date: 2024-08-12T16:36:53.502Z,
  //     likes: [],
  //     __v: 0
  //   }
  // ],

  res.render('profile', { user: user, post: post })
})

// ! Delete Post
// Delete a post
app.post('/post/:id', isLoggedIn, async (req, res) => {
  let user = await userModel.findOne({ email: req.user.email })
  let post = await postModel.findByIdAndDelete(req.params.id)
  user.post.pull(post._id)
  await user.save()
  res.redirect('/profile')
})

app.get('/like/:id', isLoggedIn, async (req, res) => {
  let post = await postModel.findOne({ _id: req.params.id }).populate('user')
  // console.log('like', post.likes)

  if (
    post.likes.findIndex(
      like => like._id.toString() === req.user.userid.toString()
    )
  ) {
    post.likes.push(req.user.userid)
    await post.save()
  } else {
    post.likes.splice(post.likes.indexOf(req.user.userid), 1)
    await post.save()
  }

  // console.log(post)

  res.redirect('/profile')
})

// Update post

app.get('/edit/:id', isLoggedIn, async (req, res) => {
  let post = await postModel.findOne({ _id: req.params.id }).populate('user')
  res.render('edit', { post: post })
})

app.post('/update/:id', isLoggedIn, async (req, res) => {
  console.log(req.params.id)
  let post = await postModel.findByIdAndUpdate(req.params.id, {
    content: req.body.content
  })
  res.redirect('/profile')
})

// ! logout functions
app.get('/logout', (req, res) => {
  res.clearCookie('token')
  res.redirect('/login')
})

// function isLoggedIn

function isLoggedIn (req, res, next) {
  const token = req.cookies.token
  if (!token) {
    return res.status(401).send('You must be logged in to access this page')
  }

  try {
    const data = jwt.verify(token, 'aavash')
    req.user = data
    next()
  } catch (error) {
    res.clearCookie('token')
    return res
      .status(401)
      .send('Invalid or expired token. Please log in again.')
  }
}

// Multer

app.get('/profile/upload', (req, res) => {
  res.render('uploadprofile')
})

app.post('/upload', isLoggedIn, upload.single('image'), async (req, res) => {
  console.log(req.user)
  try {
    let user = await userModel.findOne({ email: req.user.email })
    user.profilepic = req.file.filename
    await user.save()

    res.redirect('/profile')
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Something went wrong' })
  }
})
