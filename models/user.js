"use strict";
module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define(
    "User",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      firstName: {
        type: DataTypes.STRING,
        validate: {
          notEmpty: {
            msg: "Please provide a value for firstName"
          }
        }
      },
      lastName: {
        type: DataTypes.STRING,
        validate: {
          notEmpty: {
            msg: "Please provide a value for firstName"
          }
        }
      },
      emailAddress: {
        type: DataTypes.STRING,
        unique: {
          args: true,
          msg: "This email already exist"
        },
        validate: {
          notEmpty: {
            msg: "An email address is required"
          }
        }
      },
      password: {
        type: DataTypes.STRING,
        validate: {
          notEmpty: {
            msg: "A password is required"
          }
        }
      }
    },
    {}
  );
  User.associate = function(models) {
    // associations can be defined here
    User.hasMany(models.Course, {
      foreignKey: {
        fieldName: "userId",
        allowNull: false
      }
    });
  };
  return User;
};
