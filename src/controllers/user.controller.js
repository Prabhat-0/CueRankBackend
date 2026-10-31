const jwt = require("jsonwebtoken");
const { validateUserSignupData } = require("../utils/validateUserSignUpData");
const bcrypt = require("bcrypt");
const { generateJwt } = require("../utils/generateJWT");
const db = require("../../models");
const ApiResponse = require("../utils/ApiResponse");
const sendMail = require("../utils/sendMail.js");
const { loginAlert, otpMail } = require("../utils/mailTemplate");
const ApiError = require("../utils/ApiError.js");
const crypto = require("crypto");
const { isStrongPassword } = require("validator");
const { validateUpdateProfileData } = require("../utils/validateUpdateProfileData.js");



/** @type {typeof import("sequelize").Model} */
const User = db.User;
const Otp = db.Otp;
// const Admin=db.Admin;
// console.log(typeof (Otp));

const OTP_VALID_MINUTES = 10;
const MAX_ATTEMPTS = 5;
const RESEND_AFTER_SECONDS = 60;

const handleSendOtp = async (req, res) => {
    try {
        const email = String(req.body.email || "").trim().toLowerCase();
        if (!email) {
            return new ApiResponse(400, "Email is required to send an OTP").send(res);
        }

        // Stop people from spamming the send button
        const existing = await Otp.findByPk(email);
        if (existing) {
            const sentAt = existing.expiresAt.getTime() - OTP_VALID_MINUTES * 60 * 1000;
            if (Date.now() - sentAt < RESEND_AFTER_SECONDS * 1000) {
                return new ApiResponse(429, "Please wait a minute before requesting another code").send(res);
            }
        }

        // 1. Create a secure 6-digit code
        const otp = crypto.randomInt(100000, 1000000).toString();

        // 2. Hash it (await is required) and set expiry to now + 10 minutes
        const hashOtp = await bcrypt.hash(otp, 10);
        const expiresAt = new Date(Date.now() + OTP_VALID_MINUTES * 60 * 1000);

        await Otp.upsert({ email, otp: hashOtp, expiresAt, attempts: 0 });

        // 3. Email the plain code
        await sendMail({ to: email, ...otpMail(otp) });

        return new ApiResponse(200, "OTP sent to your email").send(res);
    } catch (error) {
        console.log(error.message);
        return new ApiResponse(500, "Could not send OTP, please try again").send(res);
    }
};

const handleVerifyOtp = async (req, res) => {
    try {
        const email = String(req.body.email || "").trim().toLowerCase();
        const otp = String(req.body.otp || "").trim();

        if (!email || !otp) {
            return new ApiResponse(400, "Email and OTP are both required").send(res);
        }

        // 1. Find the saved OTP
        const otpData = await Otp.findByPk(email);
        if (!otpData) {
            return new ApiResponse(400, "Invalid or expired OTP").send(res);
        }

        // 2. Expired?
        if (otpData.expiresAt < new Date()) {
            await otpData.destroy();
            return new ApiResponse(400, "OTP has expired, please request a new one").send(res);
        }

        // 3. Too many wrong guesses?
        if (otpData.attempts >= MAX_ATTEMPTS) {
            await otpData.destroy();
            return new ApiResponse(429, "Too many wrong attempts, please request a new OTP").send(res);
        }

        // 4. Compare: plain OTP first, saved hash second
        const isValid = await bcrypt.compare(otp, otpData.otp);
        if (!isValid) {
            await otpData.increment("attempts");
            return new ApiResponse(400, "Invalid OTP").send(res);
        }

        // 5. Correct: delete it so it can't be used twice
        await otpData.destroy();

        return new ApiResponse(200, "OTP verified successfully").send(res);
    } catch (error) {
        console.log(error.message);
        return new ApiResponse(500, "Something went wrong").send(res);
    }
};


const handleSignup = async (req, res) => {
    try {
        validateUserSignupData(req.body);

        const {
            email,
            firstName,
            lastName,
            mobileNO,
            city,
            state,
            fullAddress,
            password,
            gender
        } = req.body;

        const hashPassword = await bcrypt.hash(password, 10);
        // Generate session token
        const sessionToken = crypto.randomUUID();

        // Session expiry: 30 minutes
        const sessionExpiresIn = new Date(
            Date.now() + 30 * 60 * 1000
        );
        // Create user first
        const newUser = await User.create({
            email: email.trim().toLowerCase(),
            firstName,
            lastName,
            mobileNO,
            city,
            state,
            fullAddress,
            password: hashPassword,
            gender,
            sessionToken,
            sessionExpiresIn
        });

        // Generate JWT (30 minutes )
        const token = generateJwt(newUser.id, newUser.role);

        // Set JWT cookie
        res.cookie("token", token, {
            maxAge: 30 * 60 * 1000,
            httpOnly: true,
            sameSite: "lax",
            secure: process.env.NODE_ENV === "production"
        });

        // Set session cookie
        res.cookie("sessionToken", sessionToken, {
            expires: sessionExpiresIn,
            httpOnly: true,
            sameSite: "lax",
            secure: process.env.NODE_ENV === "production"
        });

        return new ApiResponse(
            201,
            "Signup completed successfully",
            { id: newUser.id, role: newUser.role }
        ).send(res);

    } catch (err) {
        console.log(err);

        if (err.name === "SequelizeUniqueConstraintError") {
            console.log(err);
            return new ApiResponse(
                409,
                "Already exists",
                err.errors.map(e => ({
                    field: e.path,
                    message: `${e.path} already exists`
                }))
            ).send(res);
        }

        if (err.name === "SequelizeValidationError") {
            return new ApiResponse(
                400,
                "Validation failed",
                err.errors.map(e => ({
                    field: e.path,
                    message: e.message
                }))
            ).send(res);
        }

        if (err.name === "Error") {
            return new ApiResponse(400, err.message).send(res);
        }

        return new ApiResponse(
            500,
            "Internal server error"
        ).send(res);
    }
};

const loginUserWithRole = async (req, res, role) => {
    try {
        const email = typeof req.body.email === "string" ? req.body.email.trim().toLowerCase() : "";
        const { password } = req.body;
        if (!email || typeof password !== "string" || !password) {
            return new ApiResponse(400, "Email and password are required").send(res);
        }

        const user = await User.findOne({ where: { email, role } });
        if (!user) {
            return new ApiResponse(401, "Invalid credentials").send(res);
        }

        const isValidPassword = await bcrypt.compare(
            password,
            user.password
        );

        if (!isValidPassword) {
            return new ApiResponse(401, "Invalid credentials").send(res);
        }

        // Generate JWT
        const token = generateJwt(user.id, user.role);

        // Generate session token
        const sessionToken = crypto.randomUUID();

        // 30 minutes expiry
        const sessionExpiresIn = new Date(
            Date.now() + 30 * 60 * 1000
        );

        // Save session in database
        await user.update({
            sessionToken,
            sessionExpiresIn
        });

        // JWT cookie
        res.cookie("token", token, {
            maxAge: 30 * 60 * 1000,
            httpOnly: true,
            sameSite: "lax",
            secure: process.env.NODE_ENV === "production"
        });

        // Session cookie
        res.cookie("sessionToken", sessionToken, {
            expires: sessionExpiresIn,
            httpOnly: true,
            sameSite: "lax",
            secure: process.env.NODE_ENV === "production"
        });

        sendMail({
            to: user.email,
            ...loginAlert(user.firstName)
        }).catch(err => console.log("Mail failed:", err.message));

        const {
            password: _,
            sessionToken: __,
            sessionExpiresIn: ___,
            ...safeUser
        } = user.toJSON();

        return new ApiResponse(
            200,
            "Login Successful",
            safeUser
        ).send(res);

    } catch (error) {
        console.log(error);
        return new ApiResponse(500, "Internal server error").send(res);
    }
};
const handleLogin = (req, res) => loginUserWithRole(req, res, "player");
const handleAdminLogin = (req, res) => loginUserWithRole(req, res, "admin");
const userProfile = async (req, res) => {
    return new ApiResponse(200, 'Profile fethced successfully', req.user).send(res);
}
const updatePassword = async (req, res) => {
    try {
        const { password, newPassword } = req.body;
        //all fields are mandatory
        if (!password || !newPassword) {
            return new ApiResponse(400, "All fields are mandatory").send(res);
        }
        //finding user from database
        const user = await User.findByPk(req.user.id);
        if (!user) {
            return new ApiResponse(404, { message: "Details not found!!", secondaryMessage: "Please Login Again" }).send(res)
        }

        //old password
        const hashPassword = user.password;

        //validating the old password
        const isValidPassword = await bcrypt.compare(password, hashPassword);
        if (!isValidPassword) {
            return new ApiResponse(401, "Invalid Credentials").send(res);
        }
        //password must contanisn the constrains
        if (!isStrongPassword(newPassword)) {
            return new ApiResponse(
                400,
                "Password is too weak",
                {
                    message: "Password must contain at least 8 characters",
                    subMessage: "Include uppercase, lowercase, number and special character"
                }
            ).send(res);
        }
        //generating new hash password
        const newHashPassword = await bcrypt.hash(newPassword, 10);
        user.password = newHashPassword;
        await user.save();

        return new ApiResponse(200, "Password updated successfully").send(res);

    } catch (error) {
        return new ApiResponse(400, error.message).send(res);
    }
}


const updateProfile = async (req, res) => {
    try {
        // Validate request data
        validateUpdateProfileData(req);
        const allowedFields = [
            "firstName",
            "lastName",
            "mobileNO",
            "city",
            "state",
            "fullAddress",
            "gender"
        ];

        const updateData = {};

        // Allow only selected fields
        for (const field of allowedFields) {
            if (req.body[field] !== undefined) {
                updateData[field] = req.body[field].trim();
            }
        }

        // Check empty update request
        if (Object.keys(updateData).length === 0) {
            return new ApiResponse(
                400,
                "Please provide at least one field to update"
            ).send(res);
        }

        // Find logged-in user
        const user = await User.findByPk(req.user.id);

        if (!user) {
            return new ApiResponse(
                404,
                "User not found"
            ).send(res);
        }

        // Update profile
        await user.update(updateData);

        // Remove sensitive information
        const {
            password,
            sessionToken,
            ...safeUser
        } = user.toJSON();

        return new ApiResponse(
            200,
            "Profile updated successfully",
            safeUser
        ).send(res);

    } catch (error) {
        console.log(error);

        if (error.name === "SequelizeValidationError") {
            return new ApiResponse(
                400,
                "Validation failed",
                error.errors.map(e => ({
                    field: e.path,
                    message: e.message
                }))
            ).send(res);
        }

        if (error.name === "SequelizeUniqueConstraintError") {
            return new ApiResponse(
                409,
                "Mobile number already exists"
            ).send(res);
        }

        if (
            error.message.includes("First name") ||
            error.message.includes("Last name") ||
            error.message.includes("mobile number") ||
            error.message.includes("City") ||
            error.message.includes("State") ||
            error.message.includes("Address") ||
            error.message.includes("Gender")
        ) {
            return new ApiResponse(
                400,
                error.message
            ).send(res);
        }

        return new ApiResponse(
            500,
            "Internal server error"
        ).send(res);
    }
};


module.exports = { handleSignup, handleLogin, handleAdminLogin, userProfile, handleSendOtp, handleVerifyOtp, updatePassword,  updateProfile ,};