const calculateRepaymentPlan = (loanAmount, loanDuration, interestRate, interestType, processing_fee) => {
    let monthlyPayment, totalPayment_, totalInterest, totalCapital, totalPayment;

    if (interestType === "flat_rate") {
        //flat-rate calculation
        totalInterest = (interestRate / 100) * loanAmount * loanDuration / 12;
        totalCapital = loanAmount;
        totalPayment_ = totalCapital + totalInterest;
        monthlyPayment = totalPayment_ / loanDuration;
        totalPayment =  totalCapital + totalInterest + processing_fee
    } else if (interestType === "reducing_balance") {
        //reducing balance calculation
        const monthlyRate = interestRate / 100 / 12;
        monthlyPayment = loanAmount * monthlyRate / (1 - Math.pow(1 + monthlyRate, -loanDuration));
        totalPayment_ = monthlyPayment * loanDuration;
        totalPayment = monthlyPayment * loanDuration + processing_fee;
        totalInterest = totalPayment_ - loanAmount;
    } else {
        throw new Error("Invalid interest type");
    }

    return {
        monthlyPayment: monthlyPayment.toFixed(2),
        totalPayment: totalPayment.toFixed(2),
        totalCapital: loanAmount.toFixed(2),
        totalInterest: totalInterest.toFixed(2),
        duration: loanDuration,
        interestRate: interestRate,
        interestType: interestType,
    };
};

module.exports = {
    calculateRepaymentPlan,
};
