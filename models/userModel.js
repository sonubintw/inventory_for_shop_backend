const mongoose = require("mongoose")
const { Schema, model } = mongoose
const bcrypt = require('bcryptjs')

const userSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        match: [/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/, "please enter valid email"]
    },
    password: {
        type: String,
        required: true,
        minLength: [6, "password must be upto 6 char"],
    }
    ,
    image: {
        type: String,
        required: true,
        default: "https://i.stack.imgur.com/l60Hf.png"
    },
    phoneNo: {
        type: String,
    },
    bio: {
        type: String,
        default: "bio"
    }

}, {
    timestamps: true
})
//this will execute after ever change in any of the above property so to fix that use condition
userSchema.pre('save', async function (next) {
    //mongoose inbuit function
    if (!this.isModified("password")) {
        return next()
    }

    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(this.password, salt)
    // console.log(this.password)
    // console.log(hashedPassword)
    //converting normal pass to hasedpassword
    this.password = hashedPassword

})


const User = model("User", userSchema)
module.exports = User