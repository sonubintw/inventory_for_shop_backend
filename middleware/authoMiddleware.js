//middleware
//this middleware is used for checking if the user is logged in and user can access data init
const jwt = require("jsonwebtoken")
const User = require("../models/userModel")

const protect = async (req, res, next) => {
    try {
        const token = req.cookies.token
        // console.log(req.body)
        if (!token) {
            res.status(401)
            let error = new Error("Token expired")
            return next(error)
        }

        //verify token 
        //NOTE jwt.verify returns a decoded payload if the token is valid and has not expired
        const verified = jwt.verify(token, process.env.JWT_SECRET)
        //get userID from this token
        // console.log(verified)
        const user = await User.findById(verified.id).select("-password")//("-password means give all exclude password")
        // console.log(user)
        if (!user) {
            res.status(401)
            let error = new Error("User not found")
            return next(error)
        }

        //if user is found then, store the user's (console and see whats inside it) whole data as below then this data can be access by the downstream middleware or route handlers.
        //  user: {
        //     _id: new ObjectId("644eb0b2690e569842f5d234"),
        //     name: '123456',
        //     email: '12345@gmail.com',
        //     image: 'https://i.stack.imgur.com/l60Hf.png',
        //     bio: 'bio',
        //     createdAt: 2023-04-30T18:17:22.608Z,
        //     updatedAt: 2023-04-30T18:17:22.608Z,
        //     __v: 0
        //   },
        req.user = user
        // console.log(req)
        next()

    } catch (err) {
        res.status(401)
        err = new Error("Not authorized, please login")
        return next(err)
    }
}

module.exports = protect