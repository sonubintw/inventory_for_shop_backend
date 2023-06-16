const mongoose = require("mongoose")
const { Schema, model } = mongoose

const tokenSchema = new Schema({
    userID: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "Users"//User schema id will be passed here from the fuction forgot password not from here this ref is just for showing the developer
    },
    token: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        required: true
    },
    expireAt: {
        type: Date,
        required: true,
    }
})


const Token = model("Token", tokenSchema)
module.exports = Token