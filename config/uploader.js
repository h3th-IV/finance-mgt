require('dotenv').config(); // Use dotenv to load variables from .env file

const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier'); // To convert file buffer into a readable stream

// Configure Cloudinary with environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Set up multer storage (store file in memory)
const storage = multer.memoryStorage(); // Store file in memory
const parser = multer({ storage: storage }); // Middleware for handling file uploads

/**
 * Upload an image to Cloudinary
 * @param {Buffer} fileBuffer - The buffer of the image file to be uploaded
 * @param {string} fileName - The name to be assigned to the uploaded image file
 * @returns {Promise<Object>} - The result of the Cloudinary upload
 */

// Configure Cloudinary with environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

/**
 * Upload an image to Cloudinary
 * @param {Buffer} fileBuffer - The buffer of the image file to be uploaded
 * @param {string} fileName - The name to be assigned to the uploaded image file
 * @returns {Promise<Object>} - The result of the Cloudinary upload
 */
const uploadImageToCloudinary = (fileBuffer, fileName) => {
  return new Promise((resolve, reject) => {
    // Log the file size for debugging purposes
    console.log(`File size: ${fileBuffer.length} bytes`);

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        public_id: fileName, 
        resource_type: 'auto' 
      },
      (error, result) => {
        if (error) {
          console.error('Cloudinary upload error:', error);
          reject(error);
        } else {
          console.log('Cloudinary upload result:', result);
          resolve(result);
        }
      }
    );


    const bufferStream = streamifier.createReadStream(fileBuffer);
    bufferStream.pipe(uploadStream);
    bufferStream.on('error', (err) => {
      console.error('Stream error:', err);
      reject(err);
    });

    bufferStream.on('end', () => {
      console.log('Stream ended successfully.');
    });
  });
};


/**
 * Cloudinary upload middleware
 * @param {Object} req - The express request object
 * @param {Object} res - The express response object
 * @param {Function} next - The express next middleware function
 */
const uploadImageMiddleware = async (req, res, next) => {
  try {
    console.log({x: req.files});  // Logs the files object

    // Check if files exist in the request
    if (!req.files || Object.keys(req.files).length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    // Initialize an object to hold the Cloudinary results
    const cloudinaryResults = {};

    // Loop through all file fields (e.g., statement_of_account, security_cheque, etc.)
    for (let fieldName in req.files) {
      const files = req.files[fieldName];  // Get the array of files for the field
      if (files && files.length > 0) {
        const file = files[0];  // Take the first file if multiple are uploaded
        const cloudinaryResult = await uploadImageToCloudinary(file.buffer, file.originalname);
        
        // Attach the Cloudinary result (e.g., URL) to the cloudinaryResults object
        cloudinaryResults[fieldName] = cloudinaryResult;
      }
    }

    console.log({cloudinaryResults});

    // Attach the Cloudinary results object to the request for further use in the route
    req.cloudinaryResults = cloudinaryResults;

    // Proceed to the next middleware or route handler
    next();
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    return res.status(500).json({ error: 'Error uploading to Cloudinary' });
  }
};


module.exports = {
  uploadImageMiddleware, // Export the upload middleware for use in routes
  parser // Export the multer parser if needed in routes
};
