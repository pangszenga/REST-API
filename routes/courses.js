/* IMPORT */

const express = require("express");
const router = express.Router();
const { Course, User } = require("../models");
const bcryptjs = require("bcryptjs");
const auth = require("basic-auth");
const { check, validationResult } = require("express-validator");
const authUser = require("./authenticate");

/* ROUTES */

//GET /courses 200 - return list of courses including user

router.get("/", (req, res, next) => {
  Course.findAll().then(courses => {
    res.status(200).json(courses);
  });
});

//GET /:id 200 - returns course that belongs to use, if course id is provided

router.get("/:id", (req, res, next) => {
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

//POST / - 201 - Creates a course, sets the Location header to the URI for the course, and returns no content
router.post(
  "/",
  [
    check("title")
      .exists({ checkNull: true, checkFalsy: true })
      .withMessage('Please provide a value for "title"'),
    check("description")
      .exists({ checkNull: true, checkFalsy: true })
      .withMessage('Please provide a value for "description"'),
    check("userId")
      .exists({ checkNull: true, checkFalsy: true })
      .withMessage('Please provide a value for "userId"'),
    check("estimatedTime"),
    check("materialsNeeded")
  ],
  authUser,
  (req, res, next) => {
    // Finds the validation errors in this request and wraps them in an object with handy functions
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    let newCourse = req.body;
    console.log(newCourse);

    //check if course already exist
    Course.findOne({ where: { title: newCourse.title } }).then(foundCourse => {
      if (foundCourse) {
        const err = new Error("This Course already exists in the database");
        res.status(409);
        next(err);
      } else {
        Course.create(req.body).then(course => {
          res.location(`/api/courses/${course.id}`);
          res.status(201).end();
        });
      }
    });
  }
);

//PUT /:id 204 - Updates a course and returns no content
router.put(
  "/:id",
  [
    check("title")
      .exists({ checkNull: true, checkFalsy: true })
      .withMessage('Please provide a value for "title"'),
    check("description")
      .exists({ checkNull: true, checkFalsy: true })
      .withMessage('Please provide a value for "description"')
  ],
  authUser,
  (req, res, next) => {
    // Finds the validation errors in this request and wraps them in an object with handy functions
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    //find current userId
    const currentUser = req.currentUser;
    Course.findOne({
      where: {
        id: req.params.id
      }
    }).then(foundCourse => {
      console.log(req.params.id);
      if (foundCourse) {
        //check if currentUser id matches course userId, then update
        if (currentUser.id === foundCourse.userId) {
          console.log(req.body);
          foundCourse.update(req.body);
          res.status(204).end();
        } else {
          res
            .status(403)
            .json(
              "Oops! This course does not belong to you. You do not have permission to update this."
            );
        }
      }
    });
  }
);

//DELETE /:id - 204 - Deletes a course and returns no content
router.delete("/:id", authUser, (req, res, next) => {
  //find current userId
  const currentUser = req.currentUser;
  Course.findOne({
    where: {
      id: req.params.id
    }
  }).then(foundCourse => {
    console.log(req.params.id);
    if (foundCourse) {
      //check if currentUser id matches course userId, then destroy
      if (currentUser.id === foundCourse.userId) {
        console.log(req.body);
        foundCourse.destroy();
        res.status(204).end();
      } else {
        res
          .status(403)
          .json(
            "Oops! This course does not belong to you. You do not have permission to delete this."
          );
      }
    } else {
      res.status(404).json("This course does not exist");
    }
  });
});

module.exports = router;
