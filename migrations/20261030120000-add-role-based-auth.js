'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        // await queryInterface.addColumn('Users', 'role', {
        //     type: Sequelize.ENUM('player', 'admin'),
        //     allowNull: false,
        //     defaultValue: 'player',
        // });
        // await queryInterface.addColumn('Clubs', 'password', {
        //     type: Sequelize.STRING,
        //     allowNull: true,
        // });
        // await queryInterface.addColumn('Clubs', 'sessionToken', {
        //     type: Sequelize.STRING,
        //     allowNull: true,
        // });
        // await queryInterface.addColumn('Clubs', 'sessionExpiresIn', {
        //     type: Sequelize.DATE,
        //     allowNull: true,
        // });
        await queryInterface.addColumn('Users','profileURL',{
            type:Sequelize.STRING,
            allowNull:true,
        })
    },

    async down(queryInterface) {
        
        await queryInterface.removeColumn('Users','profileURL');
    },
};
