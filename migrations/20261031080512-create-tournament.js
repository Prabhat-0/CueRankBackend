
'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Tournaments', {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },

      clubId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'clubs',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },

      tournamentName: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },

      registrationAmount: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
	  venueName: {
        type: Sequelize.STRING(400),
        allowNull: false,
      },

      venueAddress: {
        type: Sequelize.STRING(400),
        allowNull: false,
      },

      gender: {
        type: Sequelize.ENUM('Male', 'Female', 'Others'),
        allowNull: false,
        defaultValue: 'Male',
      },

      minimumAge: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 18,
      },

      maximumAge: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },

      registrationOpeningDate: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },

      registrationClosingDate: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal(
          "CURRENT_TIMESTAMP + INTERVAL '30 days'"
        ),
      },
      prizePool: {
        type: Sequelize.INTEGER,
        allowNull: true, 
      },
	  minimumRegistratinRequired:{
		type:Sequelize.INTEGER,
		allowNull:true,
	  },

    });

    // Tournament name: 4 to 100 characters
    await queryInterface.addConstraint('Tournaments', {
      fields: ['tournamentName'],
      type: 'check',
      where: Sequelize.literal(
        'char_length("tournamentName") BETWEEN 4 AND 100'
      ),
      name: 'tournaments_name_length_check',
    });

    // Registration amount cannot be negative
    await queryInterface.addConstraint('Tournaments', {
      fields: ['registrationAmount'],
      type: 'check',
      where: Sequelize.literal('"registrationAmount" >= 0'),
      name: 'tournaments_registration_amount_check',
    });
	//venue must contain atleast 4 character
	await queryInterface.addConstraint('Tournaments',{
		fields:['venueName'],
		type:'check',
		where:Sequelize.literal('char_length("venueName")Between 4 AND 100'),
		name:'tournaments_venue_name_length_check',
	})
    // Venue must contain at least 10 characters
    await queryInterface.addConstraint('Tournaments', {
      fields: ['venueAddress'],
      type: 'check',
      where: Sequelize.literal(
        'char_length("venueAddress") BETWEEN 10 AND 400'
      ),
      name: 'tournaments_venue_address_length_check',
    });

    // Minimum age cannot be negative
    await queryInterface.addConstraint('Tournaments', {
      fields: ['minimumAge'],
      type: 'check',
      where: Sequelize.literal('"minimumAge" >= 0'),
      name: 'tournaments_minimum_age_check',
    });

    // Maximum age must be greater than or equal to minimum age
    await queryInterface.addConstraint('Tournaments', {
      fields: ['maximumAge'],
      type: 'check',
      where: Sequelize.literal(
        '"maximumAge" IS NULL OR "maximumAge" >= "minimumAge"'
      ),
      name: 'tournaments_maximum_age_check',
    });

    // Closing date must be after opening date
    await queryInterface.addConstraint('Tournaments', {
      fields: ['registrationClosingDate'],
      type: 'check',
      where: Sequelize.literal(
        '"registrationClosingDate" > "registrationOpeningDate"'
      ),
      name: 'tournaments_registration_dates_check',
    });

    // Prize pool cannot be negative
    await queryInterface.addConstraint('Tournaments', {
      fields: ['prizePool'],
      type: 'check',
      where: Sequelize.literal(
        '"prizePool" IS NULL OR "prizePool" >= 0'
      ),
      name: 'tournaments_prize_pool_check',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Tournaments');
  },
};
