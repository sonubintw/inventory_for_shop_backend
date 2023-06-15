const express = require("express")
const router = express.Router()
const protect = require("../middleware/authoMiddleware");
const { contactUs } = require("../controllers/contactController");



router.post("/", protect, contactUs)



module.exports = router;