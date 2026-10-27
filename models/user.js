'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      // relations baad mein yahan likhna
    }
  }

  User.init({
    email: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
      validate: { notEmpty: true, isEmail: true }
    },
    firstName: {
      type: DataTypes.STRING(40),
      allowNull: false,
      validate: { notEmpty: true }
    },
    lastName: {
      type: DataTypes.STRING
    },
    mobileNO: {
      type: DataTypes.STRING(15),
      allowNull: false,
      unique: true,
      validate: { is: /^\+?[0-9]{10,15}$/ }
    },
    city: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    state: {
      type: DataTypes.STRING(40),
      allowNull: false
    },
    fullAddress: {
      type: DataTypes.STRING(400),
      allowNull: false
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    },
    gender: {
      type: DataTypes.ENUM("Male", "Female", "Others"),
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'User',   // table automatically "Users" banega
    tableName: 'Users'   // optional, but safe: migration wale naam se exact match
  });

  return User;
};