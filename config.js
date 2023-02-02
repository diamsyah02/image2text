const Tesseract = require('tesseract.js')
const multer = require("multer")
const path = require("path")

const diskStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "uploads/"));
  },
  filename: function (req, file, cb) {
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    )
  },
})

const convert = async (img) => {
  try {
    return {
      code: 200,
      status: 1,
      data: await (await Tesseract.recognize(img)).data.text
    }
  } catch(e) {
    return {
      code: 400,
      status: 0,
      data: e
    }
  }
}

module.exports = {
  diskStorage,
  convert
}