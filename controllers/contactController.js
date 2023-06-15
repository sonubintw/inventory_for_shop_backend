const User = require("../models/userModel")
const sendEmail = require("../utils/sendEmail")

const contactUs = async (req, res, next) => {
    const { subject, message } = req.body
    const user = await User.findById(req.user._id)
    // console.log(user)

    if (!user) {
        let error = new Error("user not found pls signup")
        res.status(400)
        return next(error)
    }

    //validate 
    if (!subject || !message) {
        let error = new Error("pls add subject and message")
        res.status(400)
        return next(error)
    }

    const send_to = process.env.EMAIL_USER;
    const sent_from = process.env.EMAIL_USER;
    const reply_to = user.email

    try {
        //sendEmail is form sendEmail.js in utils folder
        await sendEmail(subject, message, send_to, sent_from, reply_to)
        res.status(200).json({ success: true, message: " Email sent" })
    } catch (error) {
        res.status(500)
        let err = new Error("Email not send, please try again or check you email")
        return next(err)

    }

}

module.exports = {
    contactUs
}