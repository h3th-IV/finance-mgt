const calculateRepaymentPlan = (loanAmount, loanDuration, interestRate) => {
    const monthlyInterest = (interestRate / 100) * loanAmount;
    const monthlyRepayment = loanAmount / loanDuration + monthlyInterest;
    const totalPayment = monthlyRepayment * loanDuration;
    const totalCapital = loanAmount;
    const totalInterest = totalPayment - totalCapital;

    return {
        monthlyPayment: monthlyRepayment.toFixed(2),
        totalPayment: totalPayment.toFixed(2),
        totalCapital: totalCapital.toFixed(2),
        totalInterest: totalInterest.toFixed(2),
        duration: loanDuration,
    };
};


module.exports = {
    calculateRepaymentPlan,
}