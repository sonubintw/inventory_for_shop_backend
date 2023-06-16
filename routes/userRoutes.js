const express = require("express")
const router = express.Router()
const User = require("../models/userModel")
const jwt = require("jsonwebtoken")
const bcrypt = require('bcryptjs')
const protect = require("../middleware/authoMiddleware")
const Token = require("../models/tokenModel")//token from tokenModel
const crypto = require("crypto")
const sendEmail = require("../utils/sendEmail")


// function to create token
const generateToken = (id) => {
    //arguments payload,secret key and expiry date
    // console.log("inside token generation function")
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "1d" })
}
//register
router.post("/register", async (req, res, next) => {
    const { name, email, password, image, bio } = req.body



    if (!name || !email || !password) {
        // return res.status(400).send("all input field must be filled")
        let err = new Error("please fill all the required input fields")
        res.status(400)
        //this next will go to middleware errorHandlerMiddleware
        return next(err)
    }

    if (password.length < 6) {
        let err = new Error("pass length must be more than 6")
        res.status(400)
        return next(err)

    }

    const userExists = await User.findOne({ email })
    if (userExists) {
        let err = new Error("Email already exists")
        res.status(400)
        return next(err)
    }


    //creating new user
    const newuser = await new User({
        name,
        email,
        password
    }).save()


    //jwt token generation
    const token = generateToken(newuser._id)

    //send http-only cookie
    //search res.cookie
    res.cookie("token", token, {
        path: "/",//by default its "/" no need to mention but still
        httpOnly: true,
        expires: new Date(Date.now() + 1000 * 86400),//1 day
        sameSite: "none",//frontEnd and backend can have different url
        secure: true

    })


    //getting back what is created
    if (newuser) {
        const { _id, name, email, image, phoneNo, bio } = newuser
        res.status(201).json({
            _id,
            name,
            email,
            image,
            phoneNo,
            bio,
            token
        })
    }



})

//login user
router.post("/login", async (req, res, next) => {
    const { email, password } = req.body

    //validation
    if (!email || !password) {
        let error = new Error("pls add email and password")
        res.status(400)
        return next(error)
    }

    const userExists = await User.findOne({ email })
    if (!userExists) {
        let error = new Error("user does not exists")
        res.status(400)
        return next(error)
    }
    //checking password
    const passwordIsCorrect = await bcrypt.compare(password, userExists.password)

    //password from line 85 that we got from req.body is compared with password retreived from mongodb

    //token generation again 
    const token = generateToken(userExists._id)

    //send http-only cookie
    //search res.cookie
    res.cookie("token", token, {
        path: "/",
        httpOnly: true,
        secure: true,
        sameSite: "none",
        expires: new Date(Date.now() + 1000 * 86400),//1 day
    })



    //if both are present and valid then login
    if (userExists && passwordIsCorrect) {
        const { _id, name, email, image, phoneNo, bio } = userExists
        res.status(200).json({
            _id,
            name,
            email,
            image,
            phoneNo,
            bio,
            token
        })
    }
    else {
        let error = new Error("invalid credential")
        return next(error)
    }

})


//logout user
router.get("/logout", async (req, res) => {
    //making the token emplty and expire
    res.cookie("token", "", {
        path: "/",
        httpOnly: true,
        expires: new Date(0),
        sameSite: "none",
        secure: true
    })
    return res.status(200).json({ message: "succesfully logged Out" })
})

//getUser data for profile viewing
//middleware because we have to check if we are logged in or not
router.get("/getuser", protect, async (req, res, next) => {
    //this req.user._id is received from the middlware protect

    const user = await User.findById(req.user._id)
    if (user) {
        const { _id, name, email, image, phoneNo, bio } = user
        res.status(200).json({
            _id,
            name,
            email,
            image,
            phoneNo,
            bio,

        })
    }
    else {
        res.status(400);
        let error = new Error("User not found")
        return next(error)
    }
})



//user logged in status
router.get("/loggedinstatus", async (req, res) => {
    const token = req.cookies.token;
    if (!token) {
        return res.json(false)
    }

    const verified = jwt.verify(token, process.env.JWT_SECRET)

    if (verified) {
        return res.json(true)
    }
    return res.json(false)
})


//updateUser exclude password
router.patch("/updateuser", protect, async (req, res, next) => {
    const user = await User.findById(req.user._id)
    const { _id, name, email, image, phoneNo, bio } = user

    const filter = user._id
    const toUpdate = {
        email: email,
        name: req.body.name || name, //if new name is send from body then update it or keep the previous value only
        phoneNo: req.body.phoneNo || phoneNo,
        image: req.body.image || image,
        bio: req.body.bio || bio,

    }
    if (user) {
        const updatedUser = await User.findByIdAndUpdate(filter, toUpdate, { new: true })
        res.status(200).send(updatedUser)
    }
    else {
        res.status(404)
        let error = new Error("user not found")
        return next(error)
    }

})

//change Password
router.patch("/changepassword", protect, async (req, res, next) => {
    const user = await User.findById(req.user._id)
    // const { password } = user
    // console.log(password)
    const { oldPassword, newPassword } = req.body

    if (!user) {
        res.status(400)
        let error = new Error("user not found , pls sign up")
        return next(error)
    }

    if (!oldPassword || !newPassword) {
        res.status(400)
        let error = new Error("please add old pass and new pass")
        return next(error)
    }

    //////fix this
    //check if password is correct
    const passwordIsCorrect = await bcrypt.compare(oldPassword, user.password)


    if (user && passwordIsCorrect) {


        user.password = newPassword
        user.image = "image.gif"//testing
        // console.log(user)
        await user.save()//details updated and saved
        res.status(200).send("password successfully updated")
    }
    else {
        res.status(400)
        let error = new Error("old password is incorrect")
        return next(error)
    }

})

//forgot password
router.post("/forgotpassword", async (req, res, next) => {
    const { email } = req.body
    const user = await User.findOne({ email })
    if (!user) {
        res.status(404)
        let err = new Error("user no found")
        return next(err)
    }
    let tokenExistChecking = await Token.findOne({ userID: user._id })//userID is the key name and value is user._id

    if (tokenExistChecking) {
        // console.log("delete token");
        await Token.deleteOne()
    }
    //delete token if it exists in db becoz the token expires after 30min but the user press 
    //the forgot pass again then within 30min then we have to delete the token already availabe and create new one






    //create Reset token
    let resetToken = crypto.randomBytes(32).toString("hex") + user._id // this crypto module is core module of node
    // console.log(resetToken);

    //Hash token before saving to DB
    const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex")
    // console.log(hashedToken);


    //save token to db with new method btw all this properties are in tokenModel which are written below

    await new Token({
        userID: user._id,
        token: hashedToken,
        createdAt: Date.now(),
        expireAt: Date.now() + 30 * (60 * 1000) //thirty minutes
    }).save()

    // construct reset url to send in email to user
    const resetUrl = `${process.env.FRONTEND_URL}/resetpassword/${resetToken}`

    //Reset Email
    //this is for sendEmail.js 
    const message =
        //href something is missing deliberately
        `
        <h2>Hello ${user.name}</h2>
        <p>Please use the url below to reset your password</p>
        <p>This reset link is valid for only 30 minutes</p>

        <a href=${resetUrl} >${resetUrl}<a/> 

        <p>Regards <b>DADDY</b></p>
    `;

    const subject = "Password Rest Request"
    const send_to = user.email;
    const sent_from = process.env.EMAIL_USER

    try {
        //sendEmail is form sendEmail.js in utils folder
        await sendEmail(subject, message, send_to, sent_from)
        res.status(200).json({ success: true, message: "reset email sent" })
    } catch (error) {
        res.status(500)
        let err = new Error("Email not send, please try again or check you email")
        return next(err)

    }

})

//reset password
//param because resetting a password we need token from url that we received in email
router.put("/resetPassword/:resetToken", async (req, res, next) => {
    // // const {password}=req.body
    // const {resetToken}=req.params

    //hash token, then compare to token in db
    const hashedToken = crypto.createHash("sha256").update(req.params.resetToken).digest("hex")
    // console.log(hashedToken + " from db ")
    //find token from db 
    const userTokenFromDb = await Token.findOne({
        token: hashedToken,
        expireAt: { $gt: Date.now() }//checking if the token is expired by comparing the current time to the expireAt time of the userToken from DB

    })

    //checking if token in not found or if its expired
    if (!userTokenFromDb) {
        let error = new Error("invalid or expired token")
        return next(error)
    }

    //if the token is valid finding the user of that token
    const user = await User.findOne({ _id: userTokenFromDb.userID })

    user.password = req.body.password //could've used destructed but i was like i want to use req.body.password
    await user.save()
    res.status(200).json({
        message: "password reset Successfully"
    })

})



module.exports = router