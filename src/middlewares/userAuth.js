const jwt = require("jsonwebtoken")
const db = require("../../models");
const ApiResponse = require("../utils/ApiResponse");

const userAuth = async (req, res, next) => {
    try {
        const token = req.cookies?.token;
        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Authentication required. Please log in."
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
        // Validate the decoded token structure
        if (!decoded || typeof decoded !== "object" || !["player", "club", "admin"].includes(decoded.role) || !decoded.id) {
            return res.status(401).json({
                success: false,
                message: "Authentication failed. Please log in again. decoded object not found"
            });
        }

        //data kis Model se lena hai 
        const model = decoded.role === "club" ? db.Club : db.User;

        // finding the account of user
        const account = await model.findByPk(decoded.id);

        //validating the checks 
        if (!account || (decoded.role !== "club" && account.role !== decoded.role)) {
            return res.status(401).json({
                success: false,
                message: "Authentication failed. Please log in again.   //validating the checks "
            });
        }
        if (decoded.role === "club" && !account.approved) {
            return res.status(403).json({
                success: false,
                code: "CLUB_NOT_APPROVED",
                message: "Your club is waiting for admin approval."
            });
        }

        const accountData = account.toJSON();

        // Remove sensitive fields before attaching to req.user
        const { password, sessionToken, sessionExpiresIn, ...safeAccount } = accountData;
        req.user = { ...safeAccount, role: decoded.role };
        req.authSession = { sessionToken, sessionExpiresIn };
        return next();
    } catch (error) {
        if (error.name === "TokenExpiredError" || error.name === "JsonWebTokenError") {
            return res.status(401).json({
                success: false,
                message: "Authentication failed. Please log in again."
            });
        }
        return next(error);
    }
}
module.exports = { userAuth }