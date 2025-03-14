const fs = require('fs');
const sharp = require('sharp');
const mime = require('mime-types');
const cloudinary = require('cloudinary').v2;
const path = require('path');
const axios = require('axios');
const { default: jsPDF } = require('jspdf');
require('jspdf-autotable');
const { PDFDocument } = require('pdf-lib');

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
    const picturesBasePath = path.join(__dirname, '..', 'img');
    const logoPathPage = path.join(picturesBasePath, 'logo.png');
    const pdfDocLet = path.join(picturesBasePath, 'OFFER_LETTER-I.pdf');

    const logoPathBytes = fs.readFileSync(logoPathPage);
    const logoTemplateDataUri = 'data:image/png;base64,'+logoPathBytes.toString('base64');


    const pdf = new jsPDF({
        format: 'a4',
        orientation: 'portrait',
        unit: 'mm',
        compressPdf: true,
    });

    const pageHeight = pdf.internal.pageSize.height;

    pdf.addImage(logoTemplateDataUri, 'PNG', 147,15,47,8.5, '', 'FAST');

    let lineHeight = pdf.getLineHeight() / pdf.internal.scaleFactor + 3
    const margins = {left: 7, top: 1, right: 202, bottom: 280};

    function checkPageOverflow(currentPositionY, neededHeight, nflTemplateDataUri, lineHeight) {
        if (currentPositionY + neededHeight > pageHeight) {
            pdf.addPage();
            pdf.addImage(nflTemplateDataUri, 'PNG', 0,0,210,300, '', 'FAST');
            currentPositionY = margins.top + 3 * lineHeight;
        }
        return currentPositionY;
    }
    let currentPositionY;

    currentPositionY = margins.top + lineHeight;
    currentPositionY += lineHeight

    // write header, address, and description here...
    pdf.setFont('Helvetica', 'normal');
    pdf.setTextColor(0,0,0);
    pdf.setFontSize(13);
    pdf.text('OFFER LETTER', margins.left + 5, currentPositionY + 5);
    
    pdf.setFont('Helvetica', 'normal');
    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(12);

    currentPositionY += lineHeight + 7;
    //headers
    const date = new Date()
    pdf.text(`Date: ${date.toISOString().slice(0, 10)}`, margins.left + 5, currentPositionY);
    currentPositionY += lineHeight;
    pdf.text(`Name: ${offer_data.name}`, margins.left + 5, currentPositionY - 3);
    pdf.text(`Address: ${offer_data.address}`, margins.left + 5, currentPositionY + 3);

    currentPositionY += lineHeight + 7;
    pdf.setFont('Helvetica', 'bold');
    const reText = `Re: N${offer_data.loan_amount}(NAIRA ONLY) LOAN`;
    const reTextWidth = pdf.getTextWidth(reText);
    const centerX = (pdf.internal.pageSize.width - reTextWidth) / 2;
    pdf.text(reText, centerX + 33.3, currentPositionY , { align: 'center' });
    pdf.line(centerX, currentPositionY + 1, centerX + reTextWidth, currentPositionY + 1);
    // margins.left + 50, currentPositionY + 6);
    // pdf.line(margins.left + 50,  currentPositionY + 6.7, margins.right - 64, currentPositionY + 6.7);

    pdf.setFont('Helvetica', 'normal');
    currentPositionY += lineHeight + 5
    const intro = 'Further to your request, we are pleased to inform you that the facility has been approved\nunder the following terms and conditions:'
    pdf.text(intro, margins.left + 5, currentPositionY);

    currentPositionY += lineHeight + 10;
    pdf.setFont('Helvetica', 'normal');
    pdf.text(`Facility Type: ${offer_data.facility_type}`, margins.left + 5, currentPositionY);
    pdf.text(`Amount: N${offer_data.loan_amount} (Naira only)`, margins.left +5, currentPositionY + 6);
    pdf.text(`Tenor: ${offer_data.duration} months i.e. ${offer_data.duration * 30} days`, margins.left +5, currentPositionY + 12);
    pdf.text(`Purpose: ${offer_data.purpose}`, margins.left +5, currentPositionY + 18);
    const loanAmount = offer_data.loan_amount
    const interest = offer_data.interest_rate / 100;
    pdf.text(`Interest rate: ${offer_data.interest_rate}% per month i.e. ${loanAmount * interest} (naira only) as interest.`, margins.left +5, currentPositionY + 24);
    pdf.text(`Processing fee: Upfront payment of ${offer_data.processing_fee} (naira only)`, margins.left +5, currentPositionY + 30);


    currentPositionY += lineHeight + 35
    pdf.setFont('Helvetica', 'normal');
    pdf.text('Security:', margins.left + 5, currentPositionY);

    //securities
    const spce = 6
    currentPositionY += spce + 1;
    pdf.text(`(a) Personal guarantee of ${offer_data.security_guarantors.guarantor_1}`, margins.left + 10, currentPositionY);
    currentPositionY += spce;

    pdf.text(`(b) Personal guarantee of ${offer_data.security_guarantors.guarantor_2}`, margins.left + 10, currentPositionY);
    currentPositionY += spce;

    // Add other securities dynamically with proper numbering
    let securityCounter = 3; // Start from (c)
    if(offer_data.security_others){
        offer_data.security_others.forEach((security) => {
            const securityNumber = `(${String.fromCharCode(96 + securityCounter)})`; // Generate (d), (e), etc.
            pdf.text(`${securityNumber} ${security}`, margins.left + 10, currentPositionY);
            currentPositionY += spce;
            securityCounter++;
        });
    }

    const cur_height = offer_data.security_others.length;
    currentPositionY += cur_height + 5;

    //account to reapy section
    pdf.text('Repayment mode: Payment of Interest of both interest and principal will be paid monthly\ninto the following account.',margins.left + 5, currentPositionY);

    currentPositionY += lineHeight + 2;
    pdf.text('Account Name: Capitalwise Dynamic Pay Ltd\nAccount Number: XXXXXXXXXX\nBank: FCMB', margins.left + 5, currentPositionY);

    //reapyment table
    pdf.setFont('Helvetica', 'bold');
    pdf.setFontSize(10);

    currentPositionY += lineHeight + 10;
    pdf.text('Repayment Plan', margins.left +5, currentPositionY);
    currentPositionY += 5;

    //repayment table
    const repaymentPlanColumns = ["Repayment", "Repayment Date", "Amount"];
    const repaymentPlanRows = offer_data.repayment_plan.map((plan, index) => [
        `Payment ${index + 1}`,
        plan.date,
        `${plan.amount.toFixed(2)}`
    ]);
    pdf.autoTable({
        head: [repaymentPlanColumns],
        body: repaymentPlanRows,
        startY: currentPositionY,
        margin: { left: margins.left + 5 },
        styles: { fontSize: 10, cellPadding: 1.5 },
        headStyles: { fillColor: [230, 230, 230], textColor: [0, 0, 0] },
    });


    //load pdfDocinstead of rewring static content
    const existingPdfBytes = fs.readFileSync(pdfDocLet);
    const existingPdfDoc = await PDFDocument.load(existingPdfBytes);

    //create a new PDF document to combine everything
    const combinedPdfDoc = await PDFDocument.create();

    //embed the font for the dynamically generated first page
    const [firstPage] = await combinedPdfDoc.embedPdf(pdf.output('arraybuffer'));

    //add the first page to the combined PDF
    const copiedFirstPage = combinedPdfDoc.addPage();
    copiedFirstPage.drawPage(firstPage);

    const pageCount = existingPdfDoc.getPageCount();
    for (let i = 1; i < pageCount; i++) { //start from index 1 to skip the first page
        const [copiedPage] = await combinedPdfDoc.copyPages(existingPdfDoc, [i]);
        combinedPdfDoc.addPage(copiedPage);
    }

    //save the combined doc
    const buffer = await combinedPdfDoc.save();
    saveLocally(buffer, offer_data.loan_id);

    const pdfName = offer_data.loan_id + '-' + offer_data.name; 
    try {
        const result = await uploadToCloudinary(buffer, pdfName);
        console.log("uploaded successfully: ", result.url);
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


