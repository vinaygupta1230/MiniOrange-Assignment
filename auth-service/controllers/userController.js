import userModel from "../models/UserModel.js";

export const getUserData = async(req, res) =>{
    try {
        const {userid} = req.body;

        const user = await userModel.findById(userid);

        if(!user){
            return res.json({success: false, massage: "User not found"});
        }

        res.json({
            success: true,
            userData: {
                name: user.name,
                isAccountVerified : user.isAccountVerified,
                email: user.email
            }
        })
    } catch (error) {
        res.json({success: false, message: error.message})
    }
}