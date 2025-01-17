import bcrypt from "bcrypt";
import generateAndSetCookies from "../utils/generateToken.js";
import User from "../models/userModel.js";
import fetch from 'node-fetch';

export const signUp = async (req, res) => {
    try {
        const { Companyname, ContactPersonName, Password, MobileNo, GST_No, PAN_No, City } = req.body;

        // Check if the user already exists
        let user = await User.findOne({ ContactPersonName });
        if (user) {
            console.log("User already exists");
            return res.status(400).json({ message: "Username already exists." });
        }

        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashPassword = await bcrypt.hash(Password, salt);

        // Generate a temporary token and verification link
        const tempToken = Math.floor(Math.random() * 9000000) + 1000000;
        const tempLink = `<a href="http://localhost:8000/api/auth/user/userVerification/${tempToken}?MobileNo=${MobileNo}" 
   style="
     display: inline-block;
     background-color: #009900;
     color: white;
     padding: 12px 24px;
     text-decoration: none;
     border-radius: 8px;
     font-weight: bold;
     font-size: 16px;
     text-align: center;
     margin-top: 25px;
     margin-bottom: 25px;
     transition: background-color 0.3s ease;
   ">
  Verify User
</a>`
//         const tempLink = `<a href="https://jsrprime-order-app.onrender.com/api/auth/user/userVerification/${tempToken}?MobileNo=${MobileNo}" 
//    style="
//      display: inline-block;
//      background-color: #009900;
//      color: white;
//      padding: 12px 24px;
//      text-decoration: none;
//      border-radius: 8px;
//      font-weight: bold;
//      font-size: 16px;
//      text-align: center;
//      margin-top: 25px;
//      margin-bottom: 25px;
//      transition: background-color 0.3s ease;
//    ">
//   Verify User
// </a>`

        // Create the new user instance
        let newUser = new User({
            Companyname,
            ContactPersonName,
            Password: hashPassword,
            MobileNo,
            GST_No,
            PAN_No,
            City,
            Temp_Token: tempToken,
            Authorized: false
        });

        // Prepare form data for the email notification
        const formData = {
            Companyname,
            ContactPersonName,
            MobileNo,
            Password,
            GST_No,
            PAN_No,
            City
        };

        // Send an email notification
        try {
            let response = await fetch(`https://forms-flow.onrender.com/api/sendmail/mail/custom/22amtics298@gmail.com`, {
            // let response = await fetch(`https://forms-flow.onrender.com/api/sendmail/mail/custom/gaurav2tally@gmail.com`, {
                method: "POST",
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    heading: "A new registration for order application. Do you want to allow it?",
                    formData,
                    text: tempLink
                })
            });

            if (!response.ok) {
                throw new Error(`Email notification failed with status: ${response.status}`);
            }

            // Save the new user to the database
            await newUser.save();

            // Retrieve the saved user for the response
            user = await User.findOne({ ContactPersonName });

            res.status(200).json({
                _id: user._id,
                MobileNo: user.MobileNo,

            });
        } catch (fetchError) {
            console.error("Error sending email notification:", fetchError);
            res.status(500).json({ message: "Failed to send notification email. Please try again later." });
        }
    } catch (error) {
        console.error("Error in Signup:", error);
        res.status(500).json({ error: error.message });
    }
};

export const userVerification = async (req, res) => {
    const tempToken = req.params.tempToken;
    const MobileNo = req.query.MobileNo;
    try {
        let user = await User.findOne({ MobileNo });
        if (!user) {
            res.status(404).json({ message: "No user found" })
            return
        }
        if (tempToken == user.Temp_Token) {
            user.Authorized = true
            await user.save()
            res.status(200).json({ message: "user verified" })
        }
    } catch (error) {
        res.status(500).json({ message: "Invalid Token" })
    }
}

export const login = async (req, res) => {
    try {
        const { MobileNo, Password } = req.body;
        let user = await User.findOne({ MobileNo: MobileNo });
        if (!user) {
            res.status(500).json("No User Exist");
        }
        else {
            const isMatch = await bcrypt.compare(Password, user.Password);
            // console.log(user.Password)3
            if (isMatch) {
                if (user.Authorized == true) {
                    const token = generateAndSetCookies(user._id,res);
                    res.status(200).json({userData:{
                        _id: user._id,
                        Companyname: user.Companyname,
                        ContactPersonName: user.ContactPersonName,
                        MobileNo: user.MobileNo,
                        GSTIN: user.GST_No,
                        city: user.City
                    },jwt:token})
                }else{
                    res.status(401).json("User Not Authorized")
                }
            }
            else {
                res.status(400).json("Password is incorrect");
            }
        }
    } catch (error) {
        console.log("Error in Login", error);
        res.status(500).json({ error: error.message });
    }
}