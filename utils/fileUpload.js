//file is copied from multer npm

//file to upload image from user's pc 
const multer = require("multer")

//Define file storage // copy pasted from  multer package
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads')
    },
    filename: function (req, file, cb) {
        cb(null, new Date().toISOString().replace(/:/g, "-") + "-" + file.originalname)
    }
})

//specify file format that can be saved
function fileFilter(req, file, cb) {

    if (file.mimetype === "image/png" || file.mimetype === "image/jpg" || file.mimetype === "image/jpeg") {

        cb(null, true)
    } else {

        cb(null, false)
    }

}


//es6 storage:storage can be storage only
const upload = multer({ storage, fileFilter })

module.exports = { upload };