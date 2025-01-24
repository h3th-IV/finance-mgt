const cloudinary = require('cloudinary').v2;



const uploadToCloudinary = (pdfBuffer, quoteId) => {
    return new Promise((resolve, reject) => {
        const bufferData = Buffer.from(pdfBuffer);
  
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                public_id: `pdfs/${quoteId}.pdf`,
                resource_type: 'raw',
                folder: 'pdfs',
            },
            (error, result) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(result);
                }
            }
        );
  
        uploadStream.end(bufferData);
    });
  };

module.exports = uploadToCloudinary;