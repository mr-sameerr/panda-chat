const multer = require('multer')
const path = require('path')

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/images/')
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`)
    }
})

const size = {
    fileSize: 100
 }
const fileFilter = (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|JPEG|JPG|PNG/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname));
    return cb(null,true);
    // if(!fileTypes.includes(file.mimetype)){
    //     const error = new Error('Invalid file type')
    //     error.code = 'INVALID_FILE_TYPE'
    //     return cb(error, false)
    // }
    // cb(null, true)
  };

const upload = multer({ storage, fileFilter })
module.exports = upload