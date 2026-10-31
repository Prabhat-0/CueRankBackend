const validator = require('validator');

const LIMITS = {
    clubName: { min: 2, max: 200 },
    tables: { min: 1, max: 500 },
    city: { min: 2, max: 100 },
    state: { min: 2, max: 100 },
    fullAddress: { min: 10, max: 1000 },
    fullName: { min: 2, max: 100 },
    email: { max: 200 },
};
const isString = (v) => typeof v === 'string';

const validateClubSignUpData = (body = {}) => {
    const errors = {};

    // ---- Clean (trim / normalize) ----
    const data = {
        clubName: isString(body.clubName) ? body.clubName.trim() : body.clubName,
        tables: body.tables,
        city: isString(body.city) ? body.city.trim() : body.city,
        state: isString(body.state) ? body.state.trim() : body.state,
        fullAddress: isString(body.fullAddress) ? body.fullAddress.trim() : body.fullAddress,
        clubWebsite: isString(body.clubWebsite) ? body.clubWebsite.trim() : '',
        fullName: isString(body.fullName) ? body.fullName.trim() : body.fullName,
        mobileNo: isString(body.mobileNo) ? body.mobileNo.replace(/\s+/g, '') : body.mobileNo,
        email: isString(body.email) ? body.email.trim().toLowerCase() : body.email,
    };

    // ---- Reusable text check: type -> empty -> length ----
    const checkText = (key, label) => {
        const v = data[key];
        const { min, max } = LIMITS[key];
        if (!isString(v)) errors[key] = `${label} is required`;
        else if (v.length === 0) errors[key] = `${label} is required`;
        else if (v.length < min) errors[key] = `${label} must be at least ${min} characters`;
        else if (v.length > max) errors[key] = `${label} must be at most ${max} characters`;
    };

    checkText('clubName', 'Club name');
    checkText('city', 'City');
    checkText('state', 'State');
    checkText('fullAddress', 'Full address');
    checkText('fullName', 'Full name');

    // ---- Tables (number hona chahiye, whole number) ----
    const tablesNum = Number(data.tables);
    if (data.tables === undefined || data.tables === null || data.tables === '')
        errors.tables = 'Number of tables is required';
    else if (!Number.isInteger(tablesNum))
        errors.tables = 'Tables must be a whole number';
    else if (tablesNum < LIMITS.tables.min)
        errors.tables = `At least ${LIMITS.tables.min} table is required`;
    else if (tablesNum > LIMITS.tables.max)
        errors.tables = `Tables cannot be more than ${LIMITS.tables.max}`;
    else data.tables = tablesNum;

    // ---- Website (optional) ----
    if (data.clubWebsite && !validator.isURL(data.clubWebsite, { require_protocol: true }))
        errors.clubWebsite = 'Enter a valid website URL (include https://)';

    // ---- Mobile ----
    if (!isString(data.mobileNo) || !data.mobileNo)
        errors.mobileNo = 'Mobile number is required';
    else if (!/^\+?[0-9]{10,15}$/.test(data.mobileNo))
        errors.mobileNo = 'Enter a valid mobile number (10 to 15 digits)';

    // ---- Email ----
    if (!isString(data.email) || !data.email)
        errors.email = 'Email is required';
    else if (data.email.length > LIMITS.email.max)
        errors.email = 'Email is too long';
    else if (!validator.isEmail(data.email))
        errors.email = 'Enter a valid email address';

    return { isValid: Object.keys(errors).length === 0, errors, data };
};

module.exports = { validateClubSignUpData, LIMITS };