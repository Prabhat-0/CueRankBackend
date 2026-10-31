const { validateClubSignUpData } = require('../utils/validateClubSignupData');
const { Club,User } = require('../../models');
const ApiResponse = require('../utils/ApiResponse');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const { generateJwt } = require('../utils/generateJWT');
const sendMail = require('../utils/sendMail');
const { clubApproved, clubUnApproved } = require('../utils/mailTemplate');
const { isStrongPassword } = require('validator');

const createTemporaryPassword = () => {
    const lowercase = 'abcdefghijkmnopqrstuvwxyz';
    const uppercase = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
    const digits = '23456789';
    const symbols = '!@#$%&*_-+';
    const allCharacters = lowercase + uppercase + digits + symbols;
    const password = [
        lowercase[crypto.randomInt(lowercase.length)],
        uppercase[crypto.randomInt(uppercase.length)],
        digits[crypto.randomInt(digits.length)],
        symbols[crypto.randomInt(symbols.length)],
        ...Array.from({ length: 16 }, () => allCharacters[crypto.randomInt(allCharacters.length)]),
    ];

    for (let index = password.length - 1; index > 0; index -= 1) {
        const swapIndex = crypto.randomInt(index + 1);
        [password[index], password[swapIndex]] = [password[swapIndex], password[index]];
    }

    return password.join('');
};

const registerClub = async (req, res) => {
    const { isValid, errors, data } = validateClubSignUpData(req.body);
    if (!isValid) return new ApiResponse(400, 'valdations failed', errors).send(res);
    const {email}=data;
    
    try {
        const isEmailAvailabelInPlayer=await User.findOne({where:{email}});
        if(isEmailAvailabelInPlayer){
            return new ApiResponse(409,"Single email can only be used once as a player or as a club").send(res);
        }
        const club = await Club.create(data);
        return new ApiResponse(201, "Club registration successful; waiting for admin approval", club).send(res);
    } catch (err) {
        console.log(err);
        if (err.name === 'SequelizeUniqueConstraintError') {
            return new ApiResponse(409, "Club email or mobile number already exists").send(res);
        }
        return new ApiResponse(500, 'Something Went Wrong').send(res);
    }
};

const loginClub = async (req, res) => {
    try {
        const email = typeof req.body.email === 'string' ? req.body.email.trim().toLowerCase() : '';
        const { password } = req.body;

        // Validate email and password
        if (!email || typeof password !== 'string' || !password) {
            return new ApiResponse(400, 'Email and password are required').send(res);
        }

        //check if the password is strong enough
        if (!isStrongPassword(password)) {
            return new ApiResponse(400, 'Password is too weak', { message: 'Use at least 8 characters with uppercase, lowercase, number and symbol' }).send(res);
        }
        // Find the club by email
        const club = await Club.findOne({ where: { email } });
        if (!club || !club.password || !(await bcrypt.compare(password, club.password))) {
            return new ApiResponse(401, 'Invalid credentials').send(res);
        }
        // Check if the club is approved
        if (!club.approved) {
            return new ApiResponse(403, 'Club account is waiting for admin approval').send(res);
        }
        const sessionToken = crypto.randomUUID();
        const sessionExpiresIn = new Date(Date.now() + 30 * 60 * 1000);
        await club.update({ sessionToken, sessionExpiresIn });

        res.cookie('token', generateJwt(club.id, 'club'), {
            maxAge: 30 * 60 * 1000,
            httpOnly: true,
            sameSite: 'lax',
            secure: process.env.NODE_ENV === 'production',
        });
        res.cookie('sessionToken', sessionToken, {
            expires: sessionExpiresIn,
            httpOnly: true,
            sameSite: 'lax',
            secure: process.env.NODE_ENV === 'production',
        });

        return new ApiResponse(200, 'Login successful', club).send(res);
    } catch (error) {
        console.error(error);
        return new ApiResponse(500, 'Internal server error').send(res);
    }
};

const clubProfile = async (req, res) => (
    new ApiResponse(200, 'Profile fetched successfully', req.user).send(res)
);

const changeClubPassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        if (typeof currentPassword !== 'string' || !currentPassword ||
            typeof newPassword !== 'string' || !newPassword) {
            return new ApiResponse(400, 'Current password and new password are required').send(res);
        }
        if (!isStrongPassword(newPassword)) {
            return new ApiResponse(
                400,
                'Password is too weak',
                { message: 'Use at least 8 characters with uppercase, lowercase, number and symbol' }
            ).send(res);
        }

        const club = await Club.findByPk(req.user.id);
        if (!club || !club.password) {
            return new ApiResponse(401, 'Please log in again').send(res);
        }
        if (!(await bcrypt.compare(currentPassword, club.password))) {
            return new ApiResponse(401, 'Current password is incorrect').send(res);
        }

        const sessionToken = crypto.randomUUID();
        const sessionExpiresIn = new Date(Date.now() + 30 * 60 * 1000);
        await club.update({
            password: await bcrypt.hash(newPassword, 10),
            sessionToken,
            sessionExpiresIn,
        });
        res.cookie('sessionToken', sessionToken, {
            expires: sessionExpiresIn,
            httpOnly: true,
            sameSite: 'lax',
            secure: process.env.NODE_ENV === 'production',
        });
        return new ApiResponse(200, 'Password changed successfully').send(res);
    } catch (error) {
        console.error(error);
        return new ApiResponse(500, 'Could not change password').send(res);
    }
};

const listPendingClubs = async (req, res) => {
    try {
        const clubs = await Club.scope('pending').findAll();
        if (!clubs) {
            return new ApiResponse(200, "Pending request has not been found").send(res);
        }
        return new ApiResponse(200, 'Pending clubs fetched successfully', clubs).send(res);
    } catch (error) {
        console.error(error);
        return new ApiResponse(500, 'Could not fetch pending clubs').send(res);
    }
};

const approveClub = async (req, res) => {
    console.log("printing the res.params", req.params);

    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id < 1) {
        return new ApiResponse(400, 'Invalid club ID').send(res);
    }
    let transaction;
    try {
        transaction = await Club.sequelize.transaction();
        const club = await Club.findByPk(id, {
            transaction,
            lock: transaction.LOCK.UPDATE,
        });

        if (!club) {
            await transaction.rollback();
            return new ApiResponse(404, 'Club not found').send(res);
        }

        if (club.approved) {
            await transaction.rollback();
            return new ApiResponse(409, 'Club is already approved').send(res);
        }

        const temporaryPassword = createTemporaryPassword();
        const passwordHash = await bcrypt.hash(temporaryPassword, 10);

        try {
            await sendMail({
                to: club.email,
                ...clubApproved(club.clubName, club.email, temporaryPassword),
            });
        } catch (mailError) {
            await transaction.rollback();
            console.error('Club approval email failed:', mailError.message);
            return new ApiResponse(502, 'Approval email could not be sent; the club remains pending').send(res);
        }
        await club.update({ password: passwordHash, approved: true }, { transaction });
        await transaction.commit();
        return new ApiResponse(200, 'Club approved successfully', club).send(res);
    } catch (error) {
        if (transaction && !transaction.finished) {
            await transaction.rollback();
        }
        console.error(error);
        return new ApiResponse(500, 'Could not approve club').send(res);
    }
};

const unApproveClub = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id || isNaN(id)) {
            return new ApiResponse(400, "Valid club id is required").send(res);
        }

        const club = await Club.findByPk(id);
        if (!club) {
            return new ApiResponse(404, "Club not found").send(res);
        }
        if (!club.approved) {
            return new ApiResponse(409, "Club is already unApproved").send(res);
        }
        await club.update({ approved: false });

        try {
            await sendMail({
                to: club.email,
                ...clubUnApproved(club.clubName, club.email)
            })
        } catch (mailError) {
            console.log("Something went wrong in sending of mail to the club owner")
            return new ApiResponse(502, "unAppproval email could not be sent; the club remains approved").send(res);
        }

        const { password, ...safeDataOfClub } = club.toJSON();
        return new ApiResponse(200, "Club registration has been unapproved", safeDataOfClub).send(res);
    } catch (error) {
        return new ApiResponse(500, error.message).send(res);
    }
};

module.exports = { registerClub, loginClub, clubProfile, changeClubPassword, listPendingClubs, approveClub, unApproveClub };