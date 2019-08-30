/* IMPORT */

const express = require("express");
const router = express.Router();
const { User } = require("../models");
const bcryptjs = require("bcryptjs");
const auth = require("basic-auth");
const { check, validationResult } = require("express-validator");

/* USER AUTHENTICATION */
const authUser = (req, res, next) => {
  //grab user credentials form authorisation header
  const credentials = auth(req);

  //conditionals to see if user email/password/email password combo matches those in db
  if (credentials) {
    //match emailAddress to credentials via User model
    User.findOne({
      where: {
        emailAddress: credentials.name
      }
    }).then(user => {
      if (user) {
        //use bcrypt compare to compare password to credential password
        const authenticated = bcryptjs.compareSync(
          credentials.pass,
          user.password
        );

        if (authenticated) {
          console.log(
            `Authentication successful for email Address: ${user.emailAddress}`
          );

          //also store user on req obj
          req.currentUser = user;
          next();
        } else {
          //if emailAddress and password not matched
          const err = new Error(
            `Authentication failure for email Address: ${user.emailAddress}`
          );
          err.status = 401;
          next(err);
        }
      } else {
        //if emailAddress not found
        const err = new Error(
          `User not found for email Address: ${credentials.name}`
        );
        err.status = 401;
        next(err);
      }
    });
  }
};

/* ROUTES */
//GET / - 200

router.get("/", authUser, (req, res, next) => {
  console.log(req.currentUser);
  const user = req.currentUser;

  //filter out password, createdAt and updatedAt
  res.json({
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    emailAddress: user.emailAddress
  });
});

//POST / - 201
router.post(
  "/",
  [
    // firstname should not be empty
    check("firstName")
      .exists({ checkNull: true, checkFalsy: true })
      .withMessage('Please provide a value for "firstName"'),
    check("lastName")
      .exists({ checkNull: true, checkFalsy: true })
      .withMessage('Please provide a value for "lastName"'),
    check("emailAddress")
      .exists({ checkNull: true, checkFalsy: true })
      .isEmail()
      .withMessage('Please provide a valid value for "emailAddress"'),
    check("password")
      .exists({ checkNull: true, checkFalsy: true })
      .withMessage('Please provide a value for "password"')
  ],
  (req, res, next) => {
    // Finds the validation errors in this request and wraps them in an object with handy functions
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    let newUser = req.body;
    console.log("here " + newUser.emailAddress);

    //check if user exist with emailAddress
    User.findOne({
      where: {
        emailAddress: newUser.emailAddress
      }
    }).then(foundUser => {
      //if user found
      if (foundUser) {
        const err = new Error("This email already exists in the database");
        res.status(409);
        next(err);
      } else {
        //hash new user password using bcryptjs
        newUser.password = bcryptjs.hashSync(newUser.password);
      }

      //create the user
      User.create(newUser)
        .then(() => {
          res
            .location("/")
            .status(201)
            .end();
        })
        .catch(err => {
          if (err.name === "SequelizeValidationError") {
            res.status(400);
          } else {
            res.status(500);
          }
        });
    });
  }
);

module.exports = router;
