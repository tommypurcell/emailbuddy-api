// Require Packages
const createError = require("http-errors");
const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const mongoose = require("mongoose");
const cors = require("cors");
const { DB_URL } = require("./db");
// Build the App
const app = express();

// Middleware
app.use(logger("tiny"));
app.use(
  cors({
    credentials: true,
    origin: "http://localhost:3000",
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());

// Database
mongoose.connect(
  DB_URL,
  { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false },
  () => {
    console.log("Connected to MongoDB");
  }
);

// Models

const Foods = require("./models/foods");
const Users = require("./models/users");

// Security
require("./express-sessions")(app);

// Routes
// ::::
app.get("/", async (req, res) => {
  console.log(req.query);
  let products = await Users.find({});
  console.log(products);
  res.send("Hello from the Calorie Counter API");
});

// get /foods with user auth
app.get("/foods", async (req, res) => {
  console.log(req.query);
  if (req.isAuthenticated()) {
    let foods = await Foods.find({ userid: req.user._id }).sort({
      date: "desc",
      timestamp: "desc",
    });
    let groupedFoods = [];
    let currentDay = null;

    foods.forEach((food) => {
      const date = food.date.toISOString().split("T")[0];

      // check if date is not equal to currentDay
      // currentDay is null on the first iteration and then it is set to the date of the first food then it is compared to the next food then it is set to the date of the next food and so on
      // if the date is not equal to the currentDay then we push a new object into the groupedFoods array
      // the new object has a date property that is set to the currentDay
      if (date !== currentDay) {
        currentDay = date;
        groupedFoods.push({
          date: currentDay,
          foods: [],
          totalCalories: 0,
        });
      }

      // we push the food into the foods array of the last object in the groupedFoods array
      groupedFoods[groupedFoods.length - 1].foods.push(food);
      // we add the calories of the food to the totalCalories property of the last object in the groupedFoods array
      groupedFoods[groupedFoods.length - 1].totalCalories += food.calories;
    });
    res.send(groupedFoods);
  } else {
    res.send("not authenticated");
  }
});

app.post("/foods", async (req, res) => {
  // add userid to body
  req.body.userid = req.user._id;
  console.log("body", req.body);
  let food = await Foods.create(req.body);
  console.log("food", food);
  res.send(food);
});

app.patch("/foods", async (req, res) => {
  console.log("body", req.body.id);
  const filter = { _id: req.body.id };
  const update = { calories: req.body.calories };
  let updatedUser = await Foods.findOneAndUpdate(filter, update, {
    new: true,
  });
  console.log(updatedUser);
  res.send(updatedUser);
});

app.delete("/foods/:id", async (req, res) => {
  console.log("hello");
  console.log(req.params.id);

  await Foods.findByIdAndDelete(req.params.id);
  res.send("deleted");
});

// get current logged in user by searching database
// GET /profile
app.get("/profile", async (req, res) => {
  try {
    // find current logged in user by searching database
    let currentUser = await Users.findById(req.user._id);
    res.send(currentUser);
  } catch (err) {
    console.log(err);
    console.log("Not authorized");
    res.status(500).send("Server error");
  }
});

// PATCH /profile
//  Use app.patch /profile route to update the currently logged in user in the database Then respond with the updated user
app.patch("/profile", async (req, res) => {
  if (req.isAuthenticated()) {
    console.log(req.body);
    let currentUser = await Users.findOne(req.user);
    console.log(currentUser);

    let updatedUser = await Users.findOneAndUpdate(req.user._id, req.body, {
      new: true,
    });

    // let updatedUser = await Users.findOneAndUpdate(currentUser, req.body, {
    //   new: true,
    // })
    console.log(updatedUser);

    res.send(updatedUser);
  } else {
    res.send("Not authorized");
  }
});

// POST /login
app.post("/login", async (req, res) => {
  try {
    // find user that matches email and password
    let userFound = await Users.findOne({
      email: req.body.email,
      password: req.body.password,
    });
    // check if user exits, meaning it does not equal and empty string
    if (!userFound) {
      // #TODO respond with passport
      console.log("Cannot login: User does not exist. Please sign up instead.");
      res.send("Cannot login: User does not exist. Please sign up instead.");
    } else {
      console.log(userFound);
      req.login(userFound, (err) => {
        if (err) {
          return next(err);
        }
        res.send(userFound);
      });
    }
  } catch (err) {
    res.send(err);
  }
});

// POST /signup
app.post("/signup", async (req, res) => {
  try {
    let userExists = await Users.findOne({
      email: req.body.email,
    });

    if (!userExists) {
      let user = await Users.create(req.body);
      console.log(req.body);
      res.send(user);
    } else {
      console.log("User with this email already exists");
      res.send("User with this email already exists");
    }
  } catch (err) {
    res.send(err);
  }
});

// GET /logout
app.get("/logout", async (req, res) => {
  console.log("ok");
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    req.session.destroy(function (err) {
      if (err) {
        return next(err);
      }
      res.clearCookie("connect.sid");
      res.send("Logged out");
    });
  });
});

// ::::

// Catch 404 and forward to error handler
app.use((req, res, next) => {
  next(createError(404));
});

// Error Handler
app.use((err, req, res, next) => {
  // Respond with an error
  res.status(err.status || 500);
  res.send({
    message: err,
  });
});

module.exports = app;
