"use strict";
const Op = require("Sequelize").Op;

module.exports = (sequelize, DataTypes) => {
  const Course = sequelize.define("Course", {
    //Autoincrementing id
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    firstName: DataTypes.STRING,
    lastName: DataTypes.STRING,
    emailAddress: DataTypes.STRING,
    password: DataTypes.STRING
  });

  //Has Many associations
  // Course will belong to User, User will not belong to course
  Course.assoicate = function(models) {
    Course.belongsTo(models.Course, {
      as: "course",
      foreignKey: {
        fieldName: "userId",
        allowNull: false
      }
    });
  };
};

// id (Integer, primary key, auto-generated)
// userId (id from the Users table)
// title (String)
// description (Text)
// estimatedTime (String, nullable)
// materialsNeeded (String, nullable)
