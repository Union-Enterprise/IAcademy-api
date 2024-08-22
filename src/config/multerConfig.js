const multer = require('multer');
const path = require('path');


exports.fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Tipo de arquivo não suportado'), false);
    }
  };

exports.storage = multer.diskStorage({
    destination: (req, file, callback) => {
        callback(null, path.resolve("uploads"))
    },
    filename: (req, file, callback) => {
        const time = new Date().getTime();

        callback(null, `${time}_${file.originalname}`)
    }
})