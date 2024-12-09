const verifyBVN = require("../helpers/verifyBVN");

async function test() {
    try {
        console.log('red')
        const response = await verifyBVN('22605189021'); // Replace with a valid BVN
        console.log('Verification Successful:', response);
    } catch (error) {
        console.error('Error:', error.message);
    }
}
test();