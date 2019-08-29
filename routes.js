"use strict";

/*  */
const express = require("express");
const router = express.Router();
// const morgan = require("morgan");
const { check, validationResult } = require("express-validator");
const bcryptjs = require("bcryptjs");
const auth = require("basic-auth");
const User = require("./models").User;
const Course = require("./models").Course;
const bodyParser = require("body-parser");
const Sequelize = require("sequelize");

/* SETUP */
// format
router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());

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
        const err = new Err(
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
router.get("/", (req, res, next) => {
  res.json({
    message: "Welcome to the REST API project!"
  });
});

//GET /users - 200

router.get("/users", authUser, (req, res, next) => {
  const user = req.currentUser;

  //filter out password, createdAt and updatedAt
  res.json({
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    emailAddress: user.emailAddress
  });
});

//POST /users 201

router.post(
  "/users",
  [
    //check that none of the below is empty
    check("firstName")
      .exists({ checkNull: true, checkFalsy: true })
      .withMessage('Please provide a value for "firstName"'),
    check("lastName")
      .exists({ checkNull: true, checkFalsy: true })
      .withMessage('Please provide a value for "lastName"'),
    check("emailAddress")
      .exists({ checkNull: true, checkFalsy: true })
      .withMessage('Please provide a value for "emailAddress"'),
    check("password")
      .exists({ checkNull: true, checkFalsy: true })
      .withMessage('Please provide a value for "password"')
  ],
  async (req, res, next) => {
    //validation errors and shove in an obj
    const err = validationResult(req);

    if (!err.isEmpty()) {
      return res.status(400).json({ err: err.array() });
    }

    //async wait for req.body.emailAddress, then check if exist
    User.findOne({
      where: {
        emailAddress: req.body.emailAddress
      }
    }).then(user => {
      if (user) {
        //if emailAddress identifies user - throw error to prevent dupes
        const err = new Error("This email already exists in the database");
        next(err);
      } else {
        //if emailAddress does not identify user - create user
        const newUser = {
          firstName: req.body.firstName,
          lastName: req.body.lastName,
          emailAddress: req.body.emailAddress,
          password: req.body.password
        };

        //hash new user password using bcryptjs
        newUser.password = bcryptjs.hashSync(newUser.password);

        //create this new user with hashed password in db
        User.create(newUser)
          .then(() => {
            //set location header to "/" and return no content
            res
              .location("/")
              .status(201)
              .end();
          })
          .catch(err => {
            res.status(400).json(err.message);
          });
      }
    });
  }
);

//GET /courses 200 - return list of courses including user

router.get("/courses", (req, res, next) => {
  Course.findAll().then(courses => {
    res.status(200).json(courses);
  });
});

//GET courses/:id 200 - returns course that belongs to use, if course id is provided

router.get("/courses/:id", (req, res, next) => {
  // find the course that matches the course id, filter out createdAt and updatedAt
  Course.findOne({
    where: {
      id: req.params.id
    },
    attributes: [
      "id",
      "title",
      "description",
      "estimatedTime",
      "materialsNeeded",
      "userId"
    ],
    include: [
      {
        model: User,
        attributes: ["id", "firstName", "lastName", "emailAddress"]
      }
    ]
  }).then(course => {
    //if this (singular) course is found
    if (course) {
      //do this
      res.status(200).json({ course });
    } else {
      const err = new Error(
        "We could not find a course that matches the provide ID : ${req.params.id}"
      );
      //set err status to bad request
      err.status = 400;
      next(err);
    }
  });
});

//POST courses 201 - creates course, set the location header to the URI, returning no content

router.post(
  "/courses",
  [
    //check that none of the below is empty
    check("userId")
      .exists({ checkNull: true, checkFalsy: true })
      .withMessage('Please provide a value for "userId"'),
    check("title")
      .exists({ checkNull: true, checkFalsy: true })
      .withMessage('Please provide a value for "title"'),
    check("description")
      .exists({ checkNull: true, checkFalsy: true })
      .withMessage('Please provide a value for "description"'),
    check("estimatedTime").exists({ checkNull: false, checkFalsy: false }),
    check("materialsNeeded").exists({ checkNull: false, checkFalsy: false })
  ],
  (req, res, next) => {
    //validation errors and shove in an obj
    const err = validationResult(req);

    if (!err.isEmpty()) {
      return res.status(400).json({ err: err.array() });
    }

    //create course if no err found & return no content
    Course.create(req.body).then(course => {
      res.location(`/courses/${course.id}`);
      res.status(201).end();
    });
  }
);
module.exports = router;
