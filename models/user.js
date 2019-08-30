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
        validate: {
          notEmpty: {
            msg: "emailAddress is required"
          },
          notNull: {
            msg: "emailAddress is required"
          },
          isEmail: {
            msg: "not valid email"
          }
        },
        allowNull: false
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: {
            arg: true,
            msg: "Please provide a password"
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
