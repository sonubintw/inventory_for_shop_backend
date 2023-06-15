const express = require("express")
const router = express.Router()
const Product = require("../models/productModel")
const protect = require("../middleware/authoMiddleware")
const { createProduct, getProducts, getSingleProduct, deleteProduct, updateProduct } = require("../controllers/productControllers")//controller Function
const { upload } = require("../utils/fileUpload")

//create Products
router.post("/", protect, upload.single("image"), createProduct)


//get All products
router.get("/", protect, getProducts)

//get single product
router.get("/:id", protect, getSingleProduct)

//delete single product
router.delete("/delete/:id", protect, deleteProduct)

//update single product
router.patch("/update/:id", upload.single("image"), protect, updateProduct)


module.exports = router;


