const ApiResponse = require("../utils/ApiResponse");
const validSession=async(req,res,next)=>{
    const { sessionToken, sessionExpiresIn } = req.authSession || {};
    if (!sessionToken || !sessionExpiresIn || !Number.isFinite(Date.parse(sessionExpiresIn)) ||
        new Date(sessionExpiresIn) <= new Date() ||
        req.cookies?.sessionToken !== sessionToken) {
        return new ApiResponse(401, "Session expired. Please log in again.").send(res);
    }
    return next();
};
module.exports={validSession}