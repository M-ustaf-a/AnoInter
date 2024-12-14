const express = require("express");
const Approvaladmin = require( "../models/adminApproval" );
const router = express.Router();
const multer = require("multer");
const {storage} = require("../cloudConfig");
const User = require( "../models/user" );
const upload = multer({storage});
const bcrypt = require("bcryptjs")

router.get("/adminApproval", (req,res)=>{
    res.render("admin/adminApprovalForm");
});

router.post("/adminApproval", upload.single("approval[image]"), async(req,res)=>{
    try{
        const newAdmin = new Approvaladmin(req.body.approval);
        let url = req.file.path;
        let filename = req.file.filename;
        
        newAdmin.image = {url: url, filename: filename};
    
        await newAdmin.save();
        res.send("The application successfully send");
    }catch(err){
        console.log("Error application not send:", err);
    }
});

router.post("/adminLogin", async(req,res)=>{
   const {email,password} = req.body;
   try{
    const user = await User.findOne({email});
    if(!user){
        res.status(401).send("Permission denied");
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if(!isMatch){
        res.send("Password incorrect!");
    }

    res.redirect("/commForm")

   }catch(err){
    console.log("problem in login:", err);
   }
});


module.exports = router;