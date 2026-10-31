
const { DataTypes } = require("sequelize");
const 
const Admin = sequelize.define(
    "Admin",
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false
        },

        email: {
            type: DataTypes.STRING(100),
            allowNull: true,
            validate: {
                isEmail: {
                    msg: "Please enter a valid email address"
                }
            }
        },

        password: {
            type: DataTypes.STRING,
            allowNull: true
        }
    },
    {
        tableName: "Admins",
        timestamps: false
    }
);

module.exports = Admin;
