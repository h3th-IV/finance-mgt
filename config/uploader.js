const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME || "dtwujehfs",
  api_key: process.env.CLOUDINARY_API_KEY || "391293758798946",
  api_secret: process.env.CLOUDINARY_API_SECRET || "MHQsLQfjrxldFeLc7xTYAeRBcG0"
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'kyc-uploads',
    allowed_formats: ['jpg', 'jpeg', 'png', 'pdf'],
  }
});

const parser = multer({ storage: storage });
module.exports = parser;
