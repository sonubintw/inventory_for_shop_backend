const mongoose = require("mongoose");

const productSchema = mongoose.Schema({

    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "User",
    },
    name: {
        type: String,
        require: [true, "please add a name"],
        trim: true// this is for trimming the name if any space is there
    },
    //A stock-keeping unit (SKU) is a scannable bar code
    sku: {
        type: String,
        require: true,
        default: "SKU",
        trim: true,// this is for trimming the name if any space is there
    },

    category: {
        type: String,
        required: [true, "Please add a category"],
        trim: true,
    },
    quantity: {
        type: String,
        required: [true, "Please add a category"],
        trim: true,
    },
    price: {
        type: String,
        required: [true, "Please add a price"],
        trim: true,
    },
    description: {
        type: String,
        required: [true, "Please add a description"],
        trim: true,
    },
    image: {
        type: Object,
        default: {}
    }


},
    {
        timestamps: true
    })



const Product = mongoose.model("Product", productSchema)
module.exports = Product