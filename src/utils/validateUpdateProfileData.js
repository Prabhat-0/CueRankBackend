
const validator = require("validator");

const validateUpdateProfileData = (req) => {
    const {
        firstName,
        lastName,
        mobileNO,
        city,
        state,
        fullAddress,
        gender
    } = req.body;

    if (firstName !== undefined) {
        if (typeof firstName !== "string" || !validator.isLength(firstName.trim(), { min: 2, max: 50 })) {
            throw new Error("First name must be between 2 and 50 characters");
        }
    }

    if (lastName !== undefined) {
        if (typeof lastName !== "string" || !validator.isLength(lastName.trim(), { min: 2, max: 50 })) {
            throw new Error("Last name must be between 2 and 50 characters");
        }
    }

    if (mobileNO !== undefined) {
        if (typeof mobileNO !== "string" || !validator.isMobilePhone(mobileNO, "any")) {
            throw new Error("Please enter a valid mobile number");
        }
    }

    if (city !== undefined) {
        if (typeof city !== "string" || validator.isEmpty(city.trim())) {
            throw new Error("City cannot be empty");
        }
    }

    if (state !== undefined) {
        if (typeof state !== "string" || validator.isEmpty(state.trim())) {
            throw new Error("State cannot be empty");
        }
    }

    if (fullAddress !== undefined) {
        if (typeof fullAddress !== "string" || validator.isEmpty(fullAddress.trim())) {
            throw new Error("Address cannot be empty");
        }
    }

    if (gender !== undefined) {
        if (
            typeof gender !== "string" ||
            !["Male", "Female", "Other"].includes(gender)
        ) {
            throw new Error("Gender must be Male, Female or Other");
        }
    }
};

module.exports = { validateUpdateProfileData };
