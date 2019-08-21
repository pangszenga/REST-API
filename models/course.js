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
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
      type: DataTypes.STRING,
      allowNull: false
    },
    estimatedTime: {
      type: DataTypes.STRING,
      allowNull: true
    },
    materialsNeeded: {
      type: DataTypes.STRING,
      allowNull: true
    }
  });

  //Has Many associations
  // Course will belong to User, User will not belong to course
  //This also grabs the userID
  Course.assoicate = function(models) {
    Course.belongsTo(models.Course, {
      as: "course",
      foreignKey: {
        fieldName: "userId",
        allowNull: false
      }
    });
  };
  return Course;
};

// id (Integer, primary key, auto-generated)
// userId (id from the Users table)
// title (String)
// description (Text)
// estimatedTime (String, nullable)
// materialsNeeded (String, nullable)
