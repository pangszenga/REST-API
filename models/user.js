"use strict";
const Op = require("Sequelize").Op;

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define("User", {
    id: {
      type: Datatypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    firstName: DataTypes.STRING,
    lastName: DataTypes.STRING,
    emailAddress: DataTypes.STRING,
    password: DataTypes.STRING
  });

  //Has Many associations
  //Users can have many courses
  User.assoicate = function(models) {
    User.hasMany(models.Course, {
      as: "user",
      foreignKey: {
        fieldName: "userId",
        allowNull: false
      }
    });
  };
};

// id (Integer, primary key, auto-generated)
// firstName (String)
// lastName (String)
// emailAddress (String)
// password (String)
