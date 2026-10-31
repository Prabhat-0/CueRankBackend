'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Tournament extends Model {
    static associate(models) {
      Tournament.belongsTo(models.Club, { foreignKey: 'clubId', as: 'club' });
    }
  }

  Tournament.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },

      clubId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          isInt: { msg: 'Club id must be an integer' },
        },
      },

      tournamentName: {
        type: DataTypes.STRING(100),
        allowNull: false,
        set(value) {
          this.setDataValue('tournamentName', typeof value === 'string' ? value.trim() : value);
        },
        validate: {
          notEmpty: { msg: 'Tournament name is required' },
          len: { args: [4, 100], msg: 'Tournament name must be 4 to 100 characters' },
        },
      },

      tournamentBannerUrl: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: {
          isUrl: { msg: 'Banner must be a valid URL' },
        },
      },

      tables: {
        type: DataTypes.INTEGER,
        allowNull: true,
        validate: {
          isInt: { msg: 'Tables must be a whole number' },
          min: { args: [1], msg: 'Tables must be at least 1' },
        },
      },

      registrationAmount: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        validate: {
          isInt: { msg: 'Registration amount must be a whole number' },
          min: { args: [0], msg: 'Registration amount cannot be negative' },
        },
      },

      venueName: {
        type: DataTypes.STRING(100),
        allowNull: false,
        set(value) {
          this.setDataValue('venueName', typeof value === 'string' ? value.trim() : value);
        },
        validate: {
          notEmpty: { msg: 'Venue name is required' },
          len: { args: [4, 100], msg: 'Venue name must be 4 to 100 characters' },
        },
      },

      venueAddress: {
        type: DataTypes.STRING(400),
        allowNull: false,
        set(value) {
          this.setDataValue('venueAddress', typeof value === 'string' ? value.trim() : value);
        },
        validate: {
          notEmpty: { msg: 'Venue address is required' },
          len: { args: [10, 400], msg: 'Venue address must be 10 to 400 characters' },
        },
      },

      gender: {
        type: DataTypes.ENUM('Male', 'Female', 'Others'),
        allowNull: false,
        defaultValue: 'Male',
        validate: {
          isIn: { args: [['Male', 'Female', 'Others']], msg: 'Gender must be Male, Female or Others' },
        },
      },

      minimumAge: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 18,
        validate: {
          isInt: { msg: 'Minimum age must be a whole number' },
          min: { args: [0], msg: 'Minimum age cannot be negative' },
        },
      },

      maximumAge: {
        type: DataTypes.INTEGER,
        allowNull: true,
        validate: {
          isInt: { msg: 'Maximum age must be a whole number' },
        },
      },

      registrationOpeningDate: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        validate: {
          isDate: { msg: 'Registration opening date must be a valid date' },
        },
      },

      registrationClosingDate: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // DB default: +30 din
        validate: {
          isDate: { msg: 'Registration closing date must be a valid date' },
        },
      },

      prizePool: {
        type: DataTypes.INTEGER,
        allowNull: true,
        validate: {
          isInt: { msg: 'Prize pool must be a whole number' },
          min: { args: [0], msg: 'Prize pool cannot be negative' },
        },
      },

      minimumRegistrationRequired: {
        type: DataTypes.INTEGER,
        allowNull: true,
        validate: {
          isInt: { msg: 'Minimum registrations must be a whole number' },
          min: { args: [0], msg: 'Minimum registrations cannot be negative' },
        },
      },

      maximumRegistration: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          isInt: { msg: 'Maximum registrations must be a whole number' },
          min: { args: [2], msg: 'Maximum registrations must be at least 2' },
        },
      },
    },
    {
      sequelize,
      modelName: 'Tournament',
      tableName: 'Tournaments',
      timestamps: true,

      // Cross-field checks 
      validate: {
        maxAgeNotLessThanMinAge() {
          if (this.maximumAge != null && this.maximumAge < this.minimumAge) {
            throw new Error('Maximum age cannot be less than minimum age');
          }
        },
        closingAfterOpening() {
          if (new Date(this.registrationClosingDate) <= new Date(this.registrationOpeningDate)) {
            throw new Error('Registration closing date must be after opening date');
          }
        },
        minRegistrationWithinMax() {
          if (
            this.minimumRegistrationRequired != null &&
            this.minimumRegistrationRequired > this.maximumRegistration
          ) {
            throw new Error('Minimum registrations cannot exceed maximum registrations');
          }
        },
      },
    }
  );

  return Tournament;
};