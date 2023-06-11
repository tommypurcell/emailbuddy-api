// Require Packages
const createError = require('http-errors')
const express = require('express')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const logger = require('morgan')
const mongoose = require('mongoose')
const cors = require('cors')
const { DB_URL } = require('./db')
// Build the App
const app = express()

// Middleware
app.use(logger('tiny'))
app.use(
  cors({
    credentials: true,
    origin: 'http://localhost:3000',
  })
)

app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
app.use(cookieParser())

// Database
mongoose.connect(
  DB_URL,
  { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false },
  () => {
    console.log('Connected to MongoDB')
  }
)

// Models
const Bookings = require('./models/bookings')
const Houses = require('./models/houses')
const Reviews = require('./models/Reviews')
const Users = require('./models/users')

// Security
require('./express-sessions')(app)

// Routes
// ::::
app.get('/', async (req, res) => {
  console.log(req.query)
  let products = await Users.find({})
  console.log(products)
  res.send('Hello from the Airbnb API')
})

app.get('/houses', async (req, res) => {
  try {
    let obj = {}
    if (req.query.price) {
      obj.price = {
        $lte: req.query.price,
      }
    }
    // search bar will only work if it is the exact match of the title
    if (req.query.search) {
      obj.title = req.query.search
    }
    if (req.query.location) {
      obj.location = req.query.location
    }
    if (req.query.rooms) {
      obj.rooms = req.query.rooms
    }

    // search houses if select options are used
    let houses
    if (req.query.sort == 1) {
      houses = await Houses.find(obj).sort('price')
    } else if (req.query.sort == -1) {
      houses = await Houses.find(obj).sort('-price')
    } else {
      houses = await Houses.find(obj)
    }

    res.send(houses)
  } catch (err) {
    console.log(err)
  }
})

app.get('/houses/:id', async (req, res) => {
  // Find the document in the houses collection by _id

  let houseId = req.params.id

  // Populate its host field
  let house = await Houses.findById(houseId).populate('host', 'avatar name')

  // Respond with the house object
  res.send(house)
})

// POST /houses
app.post('/houses', async (req, res) => {
  try {
    if (req.isAuthenticated()) {
      console.log(req.body)
      // set the host to the authenticated user's ID
      req.body.host = req.user._id

      let house = await Houses.create(req.body)

      res.send(house)
    } else {
      console.log('not auth')
      res.send('Not authorized')
    }
  } catch (err) {
    console.log(err)
  }
})

// PATCH /houses/:id
app.patch('/houses/:id', (req, res) => {
  if (req.isAuthenticated()) {
    res.send('patch from houses with ID')
  } else {
    res.send('Not authorized')
  }
})

// DELETE /houses/:id
app.delete('/houses/:id', (req, res) => {
  if (req.isAuthenticated()) {
    res.send('delete from houses with ID')
  } else {
    res.send('Not authorized')
  }
})

// GET /bookings
app.get('/bookings', async (req, res) => {
  let booking = await Bookings.find({ house: req.query.house })

  res.send(booking)
})

// POST /bookings
app.post('/bookings', async (req, res) => {
  try {
    if (req.isAuthenticated()) {
      // set the author to the authenticated user's ID
      req.body.author = req.user._id

      let booking = await Bookings.create(req.body)

      res.send(booking)
    } else {
      console.log('not auth')
      res.send('Not authorized')
    }
  } catch (err) {
    console.log(err)
  }
})

// GET /reviews
app.get('/reviews', async (req, res) => {
  console.log('req query house', req.query)
  let reviews = await Reviews.find({ house: req.query.house })
  console.log('req body: ', req)
  res.send(reviews)
})

// POST /reviews
app.post('/reviews', async (req, res) => {
  if (req.isAuthenticated()) {
    req.body.author = req.user._id
    console.log(req.body)

    let review = await Reviews.create(req.body)

    res.send(review)
  } else {
    res.send('Not authorized')
  }
})

// get current logged in user by searching database
// GET /profile
app.get('/profile', async (req, res) => {
  if (req.isAuthenticated()) {
    // find current logged in user by searching database
    let currentUser = await Users.findById(req.user._id)
    res.send(currentUser)
  } else {
    res.send('Not authorized')
  }
})

// PATCH /profile
//  Use app.patch /profile route to update the currently logged in user in the database Then respond with the updated user

app.patch('/profile', async (req, res) => {
  if (req.isAuthenticated()) {
    console.log(req.body)
    let currentUser = await Users.findOne(req.user)
    console.log(currentUser)

    let updatedUser = await Users.findOneAndUpdate(req.name, req.body, {
      new: true,
    })

    // let updatedUser = await Users.findOneAndUpdate(currentUser, req.body, {
    //   new: true,
    // })
    console.log(updatedUser)

    res.send(updatedUser)
  } else {
    res.send('Not authorized')
  }
})

// POST /login
app.post('/login', async (req, res) => {
  try {
    // find user that matches email and password
    let userFound = await Users.findOne({
      email: req.body.email,
      password: req.body.password,
    })
    // check if user exits, meaning it does not equal and empty string
    if (!userFound) {
      // #TODO respond with passport
      console.log('Cannot login: User does not exist. Please sign up instead.')
      res.send('Cannot login: User does not exist. Please sign up instead.')
    } else {
      console.log(userFound)
      req.login(userFound, (err) => {
        if (err) {
          return next(err)
        }
        res.send(userFound)
      })
    }
  } catch (err) {
    res.send(err)
  }
})

// POST /signup
app.post('/signup', async (req, res) => {
  try {
    let userExists = await Users.findOne({
      email: req.body.email,
    })

    if (!userExists) {
      let user = await Users.create(req.body)
      console.log(req.body)
      res.send(user)
    } else {
      console.log('User with this email already exists')
      res.send('User with this email already exists')
    }
  } catch (err) {
    res.send(err)
  }
})

// GET /logout
app.get('/logout', async (req, res) => {
  console.log('ok')
  req.logout(function (err) {
    if (err) {
      return next(err)
    }
    req.session.destroy(function (err) {
      if (err) {
        return next(err)
      }
      res.clearCookie('connect.sid')
      res.send('Logged out')
    })
  })
})

// ::::

// Catch 404 and forward to error handler
app.use((req, res, next) => {
  next(createError(404))
})

// Error Handler
app.use((err, req, res, next) => {
  // Respond with an error
  res.status(err.status || 500)
  res.send({
    message: err,
  })
})

module.exports = app

// write a console log hello
