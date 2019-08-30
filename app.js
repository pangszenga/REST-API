"use strict";

// load modules
const express = require("express");
const morgan = require("morgan");
const usersRoute = require("./routes/users");
const coursesRoute = require("./routes/courses");
const sequelize = require("./models").sequelize;
const bodyParser = require("body-parser");

/* SETUP */
// variable to enable global error logging
const enableGlobalErrorLogging =
  process.env.ENABLE_GLOBAL_ERROR_LOGGING === "true";

// create the Express app
const app = express();

// format
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.json());

// setup morgan which gives us http request logging
app.use(morgan("dev"));

// check database connection
sequelize
  .authenticate()
  .then(() => {
    console.log("Successfully connected to the database!");
    return sequelize.sync();
  })
  .catch(err => {
    console.log("Problem connecting to the database!");
    throw err;
  });

// setup a friendly greeting for the root route
app.get("/", (req, res) => {
  res.json({
    message: "Welcome to the REST API project!"
  });
});

app.get("/api", (req, res) => {
  res.redirect("/");
});

// API routes
app.use("/api/users", usersRoute);
app.use("/api/courses", coursesRoute);

// send 404 if no other route matched
app.use((req, res) => {
  res.status(404).json({
    message: "Route Not Found"
  });
});

// setup a global error handler
app.use((err, req, res, next) => {
  if (enableGlobalErrorLogging) {
    console.error(`Global error handler: ${JSON.stringify(err.stack)}`);
  }

  res.status(err.status || 500).json({
    message: err.message,
    error: {}
  });
});

// set our port
app.set("port", process.env.PORT || 5000);

// start listening on our port
const server = app.listen(app.get("port"), () => {
  console.log(`Express server is listening on port ${server.address().port}`);
});
