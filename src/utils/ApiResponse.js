class ApiResponse{
    constructor (statusCode=200,message="Successfull",data=null){
        this.statusCode=statusCode;
        this.success=statusCode<400;
        this.message=message;
        this.data=data;
        
    }
    send(res) {
    return res.status(this.statusCode).json(this);
  }
}
module.exports=ApiResponse;
