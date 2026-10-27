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


/** @type {typeof import("sequelize").Model} */
const User = db.User;
const Otp = db.Otp;
console.log(typeof (Otp));

const OTP_VALID_MINUTES = 10;
const MAX_ATTEMPTS = 5;
const RESEND_AFTER_SECONDS = 60;

const handleSendOtp = async (req, res) => {
    try {
        const email = String(req.body.email || "").trim().toLowerCase();
        if (!email) {
            return new ApiResponse(400, "Email is required to send OTP").send(res);
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
        //validation check if the data of user is valid or not 
        validateUserSignupData(req.body);
        //destructing the values of body
        const { email, firstName, lastName, mobileNO, city, state, fullAddress, password, gender } = req.body;
        const hashPassword = await bcrypt.hash(password, 10);

        const newUser = await User.create({
            email, firstName, lastName, mobileNO, city, state, fullAddress, password: hashPassword, gender
        });
        if (!newUser) {
            throw new Error("Something went wrong");

        }
        return new ApiResponse(200, "Signup Completed Please login", newUser.id).send(res);
        // return res.status(200).json({success:true,
        //     message:"Signup Complete Please Login again",
        //     id:newUser.id
        // });


    } catch (err) {
        console.log(err);
        // Duplicate value in a unique column (e.g. email)
        if (err.name === "SequelizeUniqueConstraintError") {
            return res.status(409).json({
                message: "Already exists",
                errors: err.errors.map(e => ({
                    field: e.path,
                    message: `${e.path} already exists`
                }))
            });
        }

        // Model validation failed (allowNull, isEmail, notEmpty, etc.)
        if (err.name === "SequelizeValidationError") {
            return res.status(400).json({
                message: "Validation failed",
                errors: err.errors.map(e => ({
                    field: e.path,
                    message: e.message
                }))
            });
        }
        return res.status(400).json({
            success: false,
            message: err.message,

        })

    }
};

const handleLogin = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ where: { email } });
        if (!user) {
            throw new Error("Invalid credentials");
        }

        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            throw new Error("Invalid credentials");
        }

        // token 6 din ke liye valid
        const token = generateJwt(user.id);

        // cookie ka naam "token", 6 din baad expire
        res.cookie('token', token, {
            maxAge: 6 * 24 * 60 * 60 * 1000,
            httpOnly: true,                     // JS se cookie padhi nahi ja sakti (XSS se bachav)
            sameSite: 'lax'
        });
        sendMail({ to: user.email, ...loginAlert(user.firstName) })
            .catch(err => console.log("Mail failed:", err.message));

        const { password: _, ...safeUser } = user.toJSON();   // password hata diya
        return new ApiResponse(200, "Login Successful", safeUser).send(res);

    } catch (error) {
        console.log(error);
        return new ApiResponse(400, error.message).send(res);
    }
};
const userProfile = async (req, res) => {
    return new ApiResponse(200, 'Profile fethced successfully', req.user).send(res);
}


module.exports = { handleSignup, handleLogin, userProfile,handleSendOtp,handleVerifyOtp };