const multer = require('multer');
const path = require('path');


exports.storage = multer.diskStorage({
    destination: (req, file, callback) => {
        callback(null, path.resolve("uploads"))
    },
    filename: (req, file, callback) => {
        const time = new Date().getTime();

        callback(null, `${time}_${file.originalname}`)
    }
})