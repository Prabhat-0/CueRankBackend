'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('Clubs', {
            id: {
                type: Sequelize.INTEGER,
                autoIncrement: true,
                primaryKey: true,
                allowNull: false,
            },
            clubName: {
                type: Sequelize.STRING(200),
                allowNull: false,
            },
            tables: {
                type: Sequelize.INTEGER,
                allowNull: false,
            },
            city: {
                type: Sequelize.STRING(100),
                allowNull: false,
            },
            state: {
                type: Sequelize.STRING(100),
                allowNull: false,
            },
            fullAddress: {
                type: Sequelize.TEXT,
                allowNull: false,
            },
            clubWebsite: {
                type: Sequelize.STRING(200),
                allowNull: true,
            },
            fullName: {
                type: Sequelize.STRING(100),
                allowNull: false,
            },
            mobileNo: {
                type: Sequelize.STRING(15),
                allowNull: false,
                unique: true,
            },
            email: {
                type: Sequelize.STRING(200),
                allowNull: false,
                unique: true,
            },
            approved: {
                type: Sequelize.BOOLEAN,
                allowNull: false,
                defaultValue: false,
            },
            createdAt: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
            },
            updatedAt: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
            },
        });
    },

    async down(queryInterface) {
        await queryInterface.dropTable('Clubs');
    },
};