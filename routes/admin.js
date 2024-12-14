const express = require("express");
const Approvaladmin = require( "../models/adminApproval" );
const router = express.Router();
const multer = require("multer");
const {storage} = require("../cloudConfig");
const User = require( "../models/user" );
const upload = multer({storage});
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const Notification = require( "../models/notification" );
require("dotenv").config();

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
    pool: true,
    maxConnections: 5,
    rateLimit: 1000,
});

transporter.verify((error) => {
    if (error) {
        console.error("SMTP verification failed:", error);
    } else {
        console.log("SMTP server is ready to send emails");
    }
});

router.get("/adminApproval", (req,res)=>{
    res.render("admin/adminApprovalForm");
});

router.post("/adminApproval", upload.single("approval[image]"), async(req,res)=>{
    try {
        const { name, email, role, company, reason } = req.body.approval;

        if (!name || !email || !role || !req.file) {
            return res.status(400).send("All required fields must be provided, including an image.");
        }

        const { path: url, filename } = req.file;

        const newRequest = new Approvaladmin({
            name,
            email,
            role,
            company,
            reason,
            image: { url, filename },
        });
        await newRequest.save();

        const notification = new Notification({
            type: "membership_request",
            content: { requestId: newRequest._id, name, email, role, company, imageUrl: url },
        });
        await notification.save();

        const sanitizedHTML = `
            <p>A new membership request has been submitted:</p>
            <ul>
                <li>Name: ${name}</li>
                <li>Email: ${email} </li>
                <li>Role: ${role}</li>
                <li>Company: ${company}</li>
                <li>Reason: ${reason} </li>
            </ul>
            <p><a href="${url}">View Attached Image</a></p>
        `;

        await transporter.sendMail({
            from: `Admin Dashboard <${process.env.EMAIL_USER}>`,
            to: process.env.ADMIN_EMAIL,
            subject: "New Membership Request",
            html: sanitizedHTML,
        });

        res.status(200).send("Membership request submitted successfully!");
    } catch (err) {
        console.error("Error processing request:", err);
        res.status(500).send("An error occurred while processing the request.");
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