// load modules
const express = require("express");
const router = express.Router();
const User = require("../models").User;
const Op = require("Sequelize").Op;
const auth = require("basic-auth");
const bcrypt = require("bcryptjs");
const { check, validationResult } = require("express-validator");

const users = User.sequelize();
// custom middleware for auth user -  calling this will protect the route
const authUser = (req, res, next) => {
  // setting up msg
  let msg = null;

  // grab user cred from req.header
  const cred = auth(req);

  // if user cred available pass through if statement
  if (cred) {
    // attempt to retrieve by user key
    const user = User.find(function(u) {
      console.log(u.emailAddress);
      return u.emailAddress === cred.name;
    });

    // if user retrieved
    if (user) {
      const authenticated = bcrypt.compareSync(cred.pass, user.password);

      // and if passwords match
      if (authenticated) {
        console.log(`Authentication successful for username: ${user.username}`);
        // store retrieved user obj on req obj
        req.currentUser = user;

        // err msg for every level
      } else {
        msg = `Authentication failure for username: ${user.username}`;
      } // if authenticated
    } else {
      msg = `User not found for username: ${cred.name}`;
    } // if user is retrieved
  } else {
    msg = "Authenticated header not found";
  } // if was able to grab cred from req

  // if auth completely fails
  if (msg) {
    console.warn(msg);

    // Return a response with a 401 Unauthorized HTTP status code.
    res.status(401).json({ msg: "Access Denied" });
  } else {
    // if auth successful, call next
    next();
  }
}; // end of function

// GET /api/users 200
// returns the currently authenticated user
router.get("/", authUser, (req, res) => {
  const user = req.currentUser;

  res.json({
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    emailAddress: user.emailAddress
  });
});

// POST /api/users 201
// user registration route
router.post(
  "/",
  [
    check("name")
      .exists({ checkNull: true, checkFalsy: true })
      .withMessage('Please provide a value for "name"'),
    check("username")
      .exists({ checkNull: true, checkFalsy: true })
      .withMessage('Please provide a value for "username"'),
    check("password")
      .exists({ checkNull: true, checkFalsy: true })
      .withMessage('Please provide a value for "password"')
  ],
  (req, res, next) => {
    // try validate results from req object
    const results = validationResult(req);
    const user = req.body;
    // hash the new user's password
    user.password = bcrypt.hashSync(user.password);
    // add the user to the `users` array
    users.push(user);
    // catch error and return to client
    if (!results.isEmpty()) {
      const errorMsg = results.array().map(result => results.msg);
      return res.status(400).json({ errors: errorMsg });
    } else {
      // set res.status
      return res.status(201).end();
    }
  }
);
module.exports = router;
