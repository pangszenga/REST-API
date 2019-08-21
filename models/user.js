"use strict";
const Op = require("Sequelize").Op;

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define("User", {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    emailAddress: {
      type: DataTypes.STRING,
      allowNull: false
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    }
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
  return User;
};

// id (Integer, primary key, auto-generated)
// firstName (String)
// lastName (String)
// emailAddress (String)
// password (String)
