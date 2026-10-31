const ApiResponse = require("../utils/ApiResponse");

const authorizeRoles = (...roles) => (req, res, next) => {
    
    if (!req.user || !roles.includes(req.user.role)) {
        return new ApiResponse(403, "You do not have permission to access this resource").send(res);
    }
    return next();
};

module.exports = { authorizeRoles };
