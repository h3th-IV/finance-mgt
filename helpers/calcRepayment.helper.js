const calculateRepaymentPlan = (loanAmount, loanDuration, interestRate) => {
    const monthlyInterestRate = interestRate / 100 / 12;
    const totalMonths = loanDuration;
    
    //amortized monthly payment calc
    const monthlyPayment = loanAmount * (monthlyInterestRate / (1 - Math.pow(1 + monthlyInterestRate, -totalMonths))); 
    const totalPayment = monthlyPayment * totalMonths;

    //calc total capital and total interest
    const totalCapital = loanAmount;
    const totalInterest = totalPayment - totalCapital;

    return {
        monthlyPayment: monthlyPayment.toFixed(2),
        totalPayment: totalPayment.toFixed(2),
        totalCapital: totalCapital.toFixed(2), //total principal amount
        totalInterest: totalInterest.toFixed(2), //total interest paid over the loan period
        duration: loanDuration,
    };
};


module.exports = {
    calculateRepaymentPlan,
}