const formatMobileNumber = (mobile) => {
    if (mobile[0] === '0') {
        return '234' + mobile.slice(1);
    }
    return mobile;
};

module.exports = formatMobileNumber;