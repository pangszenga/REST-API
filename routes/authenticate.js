/* IMPORT */

const { User } = require("../models");
const bcryptjs = require("bcryptjs");
const auth = require("basic-auth");

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
  } else {
    //if credentials does not exist
    res.status(401);
    res.json("Access denied");
  }
};

module.exports = authUser;
