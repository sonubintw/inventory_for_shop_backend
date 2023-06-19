const express = require("express")
const app = express()
const mongoose = require("mongoose")
const cors = require("cors")
const bodyParser = require("body-parser")
const userRoutes = require("./routes/userRoutes")
const env = require("dotenv").config()
const erroHandler = require("./middleware/errorHandlerMiddleware")
const cookieParser = require("cookie-parser")
const PORT = process.env.PORT || 8000
const productRoute = require("./routes/productRoutes")
const path = require("path")// core module
const contactRoute = require("./routes/contactRoutes")



//middleware
app.use(express.json())
app.use(cookieParser())
app.use(express.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.use(cors({
    origin: ["http://localhost:3000", "https://inventory-for-shop.vercel.app", "https://front-inventory.onrender.com", "https://inventory-for-shop-4k1onxnh5-sonubintw.vercel.app"],
    // origin: true,//origin :"*" not working
    credentials: true,

}))


app.use("/v1/api/users", userRoutes)
app.use("/v1/api/products", productRoute)
app.use("/uploads", express.static(path.join(__dirname, "uploads")))//seen from yt
app.use("/v1/api/contactus", contactRoute)
//error_middleware custom_made
app.use(erroHandler)



mongoose.connect(process.env.MONGO_URI).then(() => {
    app.listen(PORT, () => {
        console.log(`server is running on port ${PORT}`)
    })
    console.log("database connected")
}).catch((err) => {
    console.log(`something is not good ${err}`)
})






