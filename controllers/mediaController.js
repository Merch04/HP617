const uuid = require('uuid')
const multer = require('multer');
const { User } = require('../models/models');
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './avatars');
  },
  filename: function (req, file, cb) {
    cb(null, uuid.v4() + file.originalname);
  }
});
const uploadImg = multer({ storage: storage }).single('avatar');

module.exports = uploadImg

