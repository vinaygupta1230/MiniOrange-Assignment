import jwt from 'jsonwebtoken';

const userAuth = async(req, res, next) =>{
    const {token} = req.cookies;
    console.log("Hello1");
    if(!token){
        return res.json({success: false,  message: "Not Authorized, Login again"})
    }
    console.log("Hello2");
    
    try {
        const tokenDecode = jwt.verify(token, process.env.JWT_SECRET_KEY);
        console.log("Hello3");
        
        if(tokenDecode.id){
            req.body.userid = tokenDecode.id;
        }
        else{
            return res.json({success: false,  message: "Not Authorized, Login again"})
        }
        console.log("Hello4");

        next();
    } catch (error) {
        return res.json({success: false,  message: error.message})
    }
}

export default userAuth;