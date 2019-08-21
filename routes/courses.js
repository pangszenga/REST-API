//load modules
const express = require("express");
const router = express.Router();
const Course = require("../models").Course;
const Op = require("Sequelize").Op;

//GET /api/courses -
//Returns a list of courses (including the user that owns each course)
router.get("/", (req, res) => {
  res.json({ message: "looking at courses" });
});

module.exports = router;
