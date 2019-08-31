"use strict";
module.exports = (sequelize, DataTypes) => {
  const Course = sequelize.define(
    "Course",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      title: {
        type: DataTypes.STRING,
        unique: {
          args: true,
          msg: "This title already exist"
        },
        validate: {
          // allowNull: false,
          notEmpty: {
            msg: "The title is required"
          }
        }
      },
      description: {
        type: DataTypes.TEXT,
        validate: {
          // allowNull: false,
          notEmpty: {
            msg: "Description is required"
          }
        }
      },
      estimatedTime: {
        type: DataTypes.STRING,
        allowNull: true
      },
      materialsNeeded: {
        type: DataTypes.STRING,
        allowNull: true
      }
    },
    {}
  );
  Course.associate = function(models) {
    // associations can be defined here
    Course.belongsTo(models.User, {
      foreignKey: {
        fieldName: "userId",
        allowNull: false,
        validate: {
          notNull: {
            args: true,
            msg: "You must enter a userId"
          }
        }
      }
    });
  };
  return Course;
};
