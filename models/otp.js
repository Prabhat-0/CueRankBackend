module.exports = (sequelize, DataTypes) => {
    const Otp = sequelize.define("Otp", {
        email: {
            type: DataTypes.STRING(100),
            primaryKey: true,
            allowNull: false,
            validate: { notEmpty: true, isEmail: true }
        },
        otp: { type: DataTypes.STRING(100), allowNull: false },
        expiresAt: { type: DataTypes.DATE, allowNull: false },
        attempts: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 }
    }, {
        tableName: "otps",
        timestamps: false
    });

    return Otp;
};