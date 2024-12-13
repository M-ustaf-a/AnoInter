const express = require("express");
const Approvaladmin = require( "../models/adminApproval" );
const router = express.Router();
const multer = require("multer");
const {storage} = require("../cloudConfig");
const upload = multer({storage});

router.get("/adminApprovalForm", (req,res)=>{
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

module.exports = router;