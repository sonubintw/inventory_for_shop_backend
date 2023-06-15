const nodemailer = require("nodemailer")

const sendEmail = async (subject, message, send_to, sent_from, reply_to) => {
    //all this below are the argument for the nodemailer check the documentation 
    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: 587, //according to the documentation
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD
        },
        //search this on document...
        tls: {
            rejectUnauthorized: false
        }
    })

    //options for sending Email 
    const options = {
        from: sent_from,
        to: send_to,
        replyTo: reply_to,
        subject: subject,
        html: message
    }

    //send the email
    transporter.sendMail(options, function (err, info) {
        if (err) {
            console.log(err)
        }
        else {

            console.log(info);
        }
    })

}

module.exports = sendEmail