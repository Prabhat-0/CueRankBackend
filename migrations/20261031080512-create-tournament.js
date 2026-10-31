'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(async (t) => {
      await queryInterface.createTable(
        'Tournaments',
        {
          id: {
            type: Sequelize.INTEGER,
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
          },
          clubId: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: { model: 'Clubs', key: 'id' },
            onUpdate: 'CASCADE',
            onDelete: 'RESTRICT',
          },
          tournamentName: {
            type: Sequelize.STRING(100),
            allowNull: false,
          },
          tournamentBannerUrl: {
            type: Sequelize.STRING,
            allowNull: true,
          },
          tables: {
            type: Sequelize.INTEGER,
            allowNull: true,
          },
          registrationAmount: {
            type: Sequelize.INTEGER,
            allowNull: false,
            defaultValue: 0,
          },
          venueName: {
            type: Sequelize.STRING(100),
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
            defaultValue: Sequelize.literal("CURRENT_TIMESTAMP + INTERVAL '30 days'"),
          },
          prizePool: {
            type: Sequelize.INTEGER,
            allowNull: true,
          },
          minimumRegistrationRequired: {
            type: Sequelize.INTEGER,
            allowNull: true,
          },
          maximumRegistration: {
            type: Sequelize.INTEGER,
            allowNull: false,
          },
          createdAt: {
            type: Sequelize.DATE,
            allowNull: false,
            defaultValue: Sequelize.NOW,
          },
          updatedAt: {
            type: Sequelize.DATE,
            allowNull: false,
            defaultValue: Sequelize.NOW,
          },
        },
        { transaction: t }
      );

      // Index: club ke saare tournaments jaldi milein
      await queryInterface.addIndex('Tournaments', ['clubId'], {
        name: 'tournaments_club_id_idx',
        transaction: t,
      });

      // ---------- CHECK constraints ----------
      const checks = [
        {
          name: 'tournaments_name_length_check',
          fields: ['tournamentName'],
          where: 'char_length(trim("tournamentName")) BETWEEN 4 AND 100',
        },
        {
          name: 'tournaments_venue_name_length_check',
          fields: ['venueName'],
          where: 'char_length(trim("venueName")) BETWEEN 4 AND 100',
        },
        {
          name: 'tournaments_venue_address_length_check',
          fields: ['venueAddress'],
          where: 'char_length(trim("venueAddress")) BETWEEN 10 AND 400',
        },
        {
          name: 'tournaments_registration_amount_check',
          fields: ['registrationAmount'],
          where: '"registrationAmount" >= 0',
        },
        {
          name: 'tournaments_tables_check',
          fields: ['tables'],
          where: '"tables" IS NULL OR "tables" >= 1',
        },
        {
          name: 'tournaments_minimum_age_check',
          fields: ['minimumAge'],
          where: '"minimumAge" >= 0',
        },
        {
          name: 'tournaments_maximum_age_check',
          fields: ['maximumAge'],
          where: '"maximumAge" IS NULL OR "maximumAge" >= "minimumAge"',
        },
        {
          name: 'tournaments_registration_dates_check',
          fields: ['registrationClosingDate'],
          where: '"registrationClosingDate" > "registrationOpeningDate"',
        },
        {
          name: 'tournaments_prize_pool_check',
          fields: ['prizePool'],
          where: '"prizePool" IS NULL OR "prizePool" >= 0',
        },
        {
          name: 'tournaments_minimum_registration_required_check',
          fields: ['minimumRegistrationRequired'],
          where: '"minimumRegistrationRequired" IS NULL OR "minimumRegistrationRequired" >= 0',
        },
        {
          name: 'tournaments_maximum_registration_check',
          fields: ['maximumRegistration'],
          where: '"maximumRegistration" >= 2',
        },
        {
          // min registration kabhi max se zyada na ho
          name: 'tournaments_min_not_above_max_registration_check',
          fields: ['minimumRegistrationRequired'],
          where: '"minimumRegistrationRequired" IS NULL OR "minimumRegistrationRequired" <= "maximumRegistration"',
        },
      ];

      for (const c of checks) {
        await queryInterface.addConstraint('Tournaments', {
          fields: c.fields,
          type: 'check',
          where: Sequelize.literal(c.where),
          name: c.name,
          transaction: t,
        });
      }
    });
  },

  async down(queryInterface) {
    await queryInterface.sequelize.transaction(async (t) => {
      await queryInterface.dropTable('Tournaments', { transaction: t });
      // Postgres mein ENUM type alag se hatana padta hai
      await queryInterface.sequelize.query(
        'DROP TYPE IF EXISTS "enum_Tournaments_gender";',
        { transaction: t }
      );
    });
  },
};