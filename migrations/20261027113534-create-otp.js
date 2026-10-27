'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('otps', {
      email: {
        type: Sequelize.STRING(100),
        allowNull: false,
        primaryKey: true
      },
      otp: {
        type: Sequelize.STRING(100),   // fits a bcrypt hash
        allowNull: false
      },
      expiresAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      attempts: {                      // optional: limit wrong guesses
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      }
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('otps');
  }
};