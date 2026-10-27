const jwt = require("jsonwebtoken")

const generateJwt=(id)=>{
    return jwt.sign({id:id},process.env.JWT_SECRET_KEY,{expiresIn:process.env.JWT_EXPIRY});
    
};
module.exports={generateJwt}