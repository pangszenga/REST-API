var express = require("express");
var router = express.Router();

// Redirect to paginated page
router.get("/", function(req, res, next) {
  res.json({ message: "Welcome to the REST API project!" });
});

router.get("/api", function(req, res, next) {
  res.json({ message: "Welcome to the REST API project!" });
});

module.exports = router;
