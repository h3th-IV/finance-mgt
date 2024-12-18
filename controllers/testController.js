const sendOtp = require("../helpers/messenger");
const { generateOTP } = require("../helpers/otp");
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


// async function smstest(){
//     try{
//         console.log('blue');
//         const otp = generateOTP()
//         const response = await sendOtp('2347035643850', otp)
//         console.log('verification successfull: ', response);
//     } catch(error){
//         console.error('Error: ', error);
//     }
// }

// // smstest();

// const mobile = '09045647830'
// let tel;
// if (mobile[0]==='0'){
//     console.log('has 0')
//     tel = '234' + mobile.slice(1);
//     console.log(tel);
// }else{
//     console.log('has not 0')
//     tel = mobile;
//     console.log(tel);
// }
// console.log(tel);
