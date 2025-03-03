const fs = require('fs');
const sharp = require('sharp');
const mime = require('mime-types');
const cloudinary = require('cloudinary').v2;
const path = require('path');
const axios = require('axios');
const { default: jsPDF } = require('jspdf');
require('jspdf-autotable');

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    folder: process.env.FOLDER_NAME
});

const saveLocally = (buffer, loan_id) => {
    fs.writeFileSync(`${loan_id}.pdf`, Buffer.from(buffer));
    console.log(`pdf saved as ${loan_id}.pdf`);
};


const uploadToCloudinary = (pdfBuffer, loan_id) => {
    return new Promise((resolve, reject) => {
        const bufferData = Buffer.from(pdfBuffer);
  
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                public_id: `pdfs/${loan_id}.pdf`,
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


exports.generateOfferLetter = async(offer_data) =>{
    //pdf generation logic hia
    const pdfName = offer_data.quote_no + '-' + offer_data.to; 
    try {
        const result = await uploadToCloudinary(buffer, pdfName);
        return {
            success: true,
            message: 'Offer Letter uploaded successfully',
            url: result.url,
            buffer: buffer
        };
    } catch (error) {
        console.error('Error uploading to Cloudinary:', error);
        return {
            success: false,
            message: 'Failed to upload to Cloudinary',
            error: error.message
        };
    }
}