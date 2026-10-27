class ApiError extends Error{
    constructor(statusCode=500,message="Something Went Wrong",data=null){
        super(message);
        this.statusCode=statusCode;
        this.message=message;
        this.data=data;
         this.success = false;
    Error.captureStackTrace(this, this.constructor);
    }
};
module.exports=ApiError;