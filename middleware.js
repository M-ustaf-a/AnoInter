const User = require( "./models/user" );

module.exports.isVerifiedAdmin = async(req,res, next)=>{
    const {email} = req.body;

    try{

        const user = await User.findOne({email});
        if(!user){
            res.send("sorry user not found");
        }
        if(user && user.email === email){
            res.render("login.ejs");
        }else{
            res.redirect("/admin/adminApprovalForm");
        }

    }catch(err){
        console.log("something problem in login: ", err);
    }
}

module.exports.isLoggedIn = async(req,res,next)=>{
    try{
        if(!req.session || !req.session.userId){
            return res.redirect("/commForm");
        }
        const user = await User.findById(req.session.userId);
        if(!user){
            return res.redirect("/commForm");
        }
        req.user = user;
        next();
    }catch(err){
        console.log("server error during login:", err);
    }
}