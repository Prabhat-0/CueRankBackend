const { isEmail, isStrongPassword } = require('validator');

const GENDERS = ['Male', 'Female', 'Others'];

const validateUserSignupData = (body) => {
    const { email, firstName, lastName, mobileNO, city, state, fullAddress, password, gender } = body;

    // 1. Required fields (lastName optional hai)
    const required = { email, firstName, mobileNO, city, state, fullAddress, password, gender };
    for (const [key, value] of Object.entries(required)) {
        if (value === undefined || value === null || String(value).trim() === '') {
            throw new Error(`${key} is required`);
        }
    }

    // 2. Email
    if (!isEmail(email)) {
        throw new Error('Email is not valid');
    }
    if (email.length > 100) {
        throw new Error('Email must not be more than 100 characters');
    }

    // 3. Names (DB: firstName 40, lastName 255)
    if (firstName.trim().length < 2 || firstName.trim().length > 40) {
        throw new Error('First name must be 2 to 40 characters');
    }
    if (lastName && lastName.length > 255) {
        throw new Error('Last name is too long');
    }

    // 4. Mobile
    if (!/^\+?[0-9]{10,15}$/.test(mobileNO)) {
        throw new Error('Mobile number must be 10 to 15 digits, optional + at start');
    }

    // 5. Address
    if (city.length > 100) throw new Error('City must be at most 100 characters');
    if (state.length > 40) throw new Error('State must be at most 40 characters');
    if (fullAddress.length > 400) throw new Error('Address must be at most 400 characters');

    // 6. Gender
    if (!GENDERS.includes(gender)) {
        throw new Error(`Gender must be one of: ${GENDERS.join(', ')}`);
    }

    // 7. Password
    if (!isStrongPassword(password, { minLength: 8, minUppercase: 1, minSymbols: 1, minNumbers: 1, minLowercase: 1 })) {
        throw new Error('Password must be 8+ characters with uppercase, lowercase, number and symbol');
    }
};

module.exports = { validateUserSignupData };