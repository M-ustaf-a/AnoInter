module.exports.isLoggedIn = async(req,res,next)=>{
    if(!req.isAuthenticated()){
        req.session.redirectUrl = req.orginalUrl;
        req.flash("error", "You must be login");
        return res.redirect("/admin/login");
    }
    next();
};

module.exports.saveRedirectUrl = (req,res,next)=>{
    if(req.session.redirectUrl){
        res.locals.redirectUrl = req.session.redirectUrl;
    }
    next();
};

module.exports.isAuthenticated = (req,res,next)=>{
    if(req.session.userId){
      return next();
    }
    res.redirect("/admin/login");
};



