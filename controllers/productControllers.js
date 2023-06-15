const Product = require("../models/productModel");
// const { findById } = require("../models/userModel");
const cloudinary = require("cloudinary").v2;

const createProduct = async (req, res, next) => {
    const { name, sku, category, quantity, price, description } = req.body;

    //validation
    if (!name || !category || !quantity || !price || !description) {
        res.status(400)
        let error = new Error("please fill in all the fields")
        return next(error)
    }

    //Handle Image upload
    let fileData = {}
    if (req.file) {
        //save image to cloudinary server
        let uploadedFile;
        try {                                                              //folder name in the server of cloudinary 
            uploadedFile = await cloudinary.uploader.upload(req.file.path, { folder: "AjaypowertoolImg", resource_type: "image" })
        } catch (error) {
            res.status(500)
            let err = new Error("image could not be uploaded")
            return next(err)
        }


        fileData = {
            fileName: req.file.originalname,
            filePath: uploadedFile.secure_url,
            filetType: req.file.mimetype,
            fileSize: req.file.size
        }

    }

    //create product using different style check ,go and check in userRoutes.js 
    const product = await Product.create({
        user: req.user.id, //got the user from protect middleware
        name,
        sku,
        category,
        quantity,
        price,
        description,
        image: fileData
    })

    res.status(201).json(product)

}

//get all products
const getProducts = async (req, res) => {

    const allProducts = await Product.find({ user: req.user.id }).sort("-createdAt")
    res.status(200).json(allProducts)

}


//get Single products
const getSingleProduct = async (req, res, next) => {
    const singleProduct = await Product.findById(req.params.id)
    // if product is not present
    if (!singleProduct) {
        res.status(404)
        let error = new Error("product not found")
        return next(error)
    }
    //the user is in object format, check that in productSchema to know the type of user
    //matching the product to its user
    if (singleProduct.user.toString() !== req.user.id) {
        res.status(401)
        let error = new Error("user not authorized")
        return next(error)
    }

    res.status(200).json(singleProduct)
}

//delete product
const deleteProduct = async (req, res, next) => {
    const singleProduct = await Product.findById(req.params.id)

    if (!singleProduct) {
        res.status(404)
        let error = new Error("product not found")
        return next(error)
    }
    if (singleProduct.user.toString() !== req.user.id) {
        res.status(401)
        let error = new Error("user not authorized")
        return next(error)
    }

    const deletedProduct = await Product.deleteOne({ _id: singleProduct.id })
    res.status(200).json(deletedProduct)
}



//update product
const updateProduct = async (req, res, next) => {
    const { name, category, quantity, price, description, } = req.body;
    // console.log(req)
    const singleProduct = await Product.findById(req.params.id);

    if (!singleProduct) {
        res.status(404)
        let error = new Error("product not found")
        return next(error)
    }

    if (singleProduct.user.toString() !== req.user.id) {
        res.status(401)
        let error = new Error("user not authorized")
        return next(error)
    }

    //Handle Image upload
    let fileData = {}
    if (req.file) {
        //save image to cloudinary server
        let uploadedFile;
        try {                                                              //folder name in the server of cloudinary 
            uploadedFile = await cloudinary.uploader.upload(req.file.path, { folder: "AjaypowertoolImg", resource_type: "image" })
        } catch (error) {
            res.status(500)
            let err = new Error("image could not be uploaded")
            return next(err)
        }


        fileData = {
            fileName: req.file.originalname,
            filePath: uploadedFile.secure_url,
            filetType: req.file.mimetype,
            fileSize: req.file.size
        }

    }


    //update product using different style check ,go and check in userRoutes.js 

    const updatedProduct = await Product.findByIdAndUpdate(
        //filter    
        { _id: req.params.id },


        //values to update
        {
            name,
            category,
            quantity,
            price,
            description,
            image: Object.keys(fileData).length === 0 ? singleProduct.image : fileData
            //if no new image than the old one i.e singleProduct.image
        },
        //letting know the model new data is entered or modified and use the validators as well
        {
            new: true,
            runValidators: true
        })



    res.status(200).json(updatedProduct)

}





module.exports = {
    createProduct,
    getProducts,
    getSingleProduct,
    deleteProduct,
    updateProduct
}