'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('Users', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
            },
            email: {
                type: Sequelize.STRING(100),
                allowNull: false,
                unique: true
            },
            firstName: {
                type: Sequelize.STRING(40),
                allowNull: false
            },
            lastName: {
                type: Sequelize.STRING
            },
            mobileNO: {
                type: Sequelize.STRING(15),
                allowNull: false,
                unique: true
            },
            city: {
                type: Sequelize.STRING(100),
                allowNull: false
            },
            state: {
                type: Sequelize.STRING(40),
                allowNull: false
            },
            fullAddress: {
                type: Sequelize.STRING(400),
                allowNull: false
            },
            password: {
                type: Sequelize.STRING,
                allowNull: false
            },
            gender: {
                type: Sequelize.ENUM("Male", "Female", "Others"),
                allowNull: false,
                defaultValue:"Male"
            },
            createdAt: {
                allowNull: false,
                type: Sequelize.DATE,
                defaultValue: Sequelize.fn('NOW')
            },
            updatedAt: {
                allowNull: false,
                type: Sequelize.DATE,
                defaultValue: Sequelize.fn('NOW')
            }
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('Users');
    }
};