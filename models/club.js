'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Club extends Model {
        static associate(models) {
            // Baad mein relations yahan aayenge, jaise:
            // Club.hasMany(models.Tournament, { foreignKey: 'clubId' });
        }

        // Club ko approve karne ke liye: await club.approve()
        async approve() {
            this.approved = true;
            return this.save();
        }

        // Password jaisi sensitive cheez nahi hai, par response saaf rakhne ke liye
        toJSON() {
            const values = { ...this.get() };
            return values;
        }
    }

    Club.init(
        {
            clubName: {
                type: DataTypes.STRING(200),
                allowNull: false,
                validate: {
                    notEmpty: { msg: 'Club name is required' },
                    len: { args: [2, 200], msg: 'Club name must be 2 to 200 characters' },
                },
            },
            tables: {
                type: DataTypes.INTEGER,
                allowNull: false,
                validate: {
                    isInt: { msg: 'Tables must be a whole number' },
                    min: { args: [1], msg: 'At least 1 table is required' },
                    max: { args: [500], msg: 'Tables cannot be more than 500' },
                },
            },
            city: {
                type: DataTypes.STRING(100),
                allowNull: false,
                validate: { notEmpty: { msg: 'City is required' } },
            },
            state: {
                type: DataTypes.STRING(100),
                allowNull: false,
                validate: { notEmpty: { msg: 'State is required' } },
            },
            fullAddress: {
                type: DataTypes.TEXT,
                allowNull: false,
                validate: {
                    notEmpty: { msg: 'Full address is required' },
                    len: { args: [10, 1000], msg: 'Address must be at least 10 characters' },
                },
            },
            clubWebsite: {
                type: DataTypes.STRING(200),
                allowNull: true,
                validate: { isUrl: { msg: 'Enter a valid website URL' } },
            },
            fullName: {
                type: DataTypes.STRING(100),
                allowNull: false,
                validate: { notEmpty: { msg: 'Owner name is required' } },
            },
            mobileNo: {
                type: DataTypes.STRING(15),
                allowNull: false,
                unique: { name: 'clubs_mobileNo_unique', msg: 'Mobile number already registered' },
                validate: {
                    is: {
                        args: /^\+?[0-9]{10,15}$/,
                        msg: 'Enter a valid mobile number (10 to 15 digits)',
                    },
                },
            },
            email: {
                type: DataTypes.STRING(200),
                allowNull: false,
                unique: { name: 'clubs_email_unique', msg: 'Email already registered' },
                validate: { isEmail: { msg: 'Enter a valid email address' } },
            },
            approved: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: false,
            },
        },
        {
            sequelize,
            modelName: 'Club',
            tableName: 'Clubs',
            timestamps: true, // createdAt, updatedAt

            indexes: [
                { fields: ['city'] },
                { fields: ['state'] },
                { fields: ['approved'] },
            ],

            // Save hone se pehle data saaf karo
            hooks: {
                beforeValidate: (club) => {
                    ['clubName', 'city', 'state', 'fullAddress', 'fullName', 'clubWebsite'].forEach((f) => {
                        if (typeof club[f] === 'string') club[f] = club[f].trim();
                    });
                    if (typeof club.email === 'string') club.email = club.email.trim().toLowerCase();
                    if (typeof club.mobileNo === 'string') club.mobileNo = club.mobileNo.replace(/\s+/g, '');
                    if (club.clubWebsite === '') club.clubWebsite = null; // khali string ko null banao
                },
            },

            // Scopes
            scopes: {
                approved: { where: { approved: true } },
                pending: { where: { approved: false } },
            },
        }
    );

    return Club;
};