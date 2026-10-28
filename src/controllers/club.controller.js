const { validateClubSignUpData } = require('../utils/validateClubSignupData');
const { Club } = require('../../models');
const ApiResponse = require('../utils/ApiResponse');

const registerClub = async (req, res) => {
    const { isValid, errors, data } = validateClubSignUpData(req.body);
    if (!isValid) return new ApiResponse(400,'valdations failed',errors).send(res);

    try {
        // Sirf allowed fields ja rahi hain, 'approved' user se nahi aayega
        const club = await Club.create(data);
        return new ApiResponse(200,"Club registration successful waiting for the admin for approval",club).send(res);
    } catch (err) {
        console.log(err);
        if (err.name === 'SequelizeUniqueConstraintError') {
            return new ApiResponse(409 ,"User already exists" ).send(res);
        }
        return new ApiResponse(500,'Something Went Wrong').send(res);
    }
};

module.exports={registerClub};