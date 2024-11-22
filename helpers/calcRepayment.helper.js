const calculateRepaymentPlan = (loanAmount, loanDuration, interestRate) => {
    const monthlyInterest = (interestRate / 100) * loanAmount;
    const monthlyRepayment = loanAmount / loanDuration + monthlyInterest;
    return {
        monthly_payment: monthlyRepayment.toFixed(2),
        total_payment: (monthlyRepayment * loanDuration).toFixed(2),
    };
};

module.exports = {
    calculateRepaymentPlan,
}