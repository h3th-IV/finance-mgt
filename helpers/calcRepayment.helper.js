const calculateRepaymentPlan = (loanAmount, loanDuration, interestRate, interestType, processing_fee) => {
    let monthlyPayment, totalPayment, totalInterest = 0, totalCapital = loanAmount;
    let repaymentSchedule = []; //this will only be populated for reducing balance loans.

    if (interestType === "flat_rate") {
        //flat-rate calculation
        totalInterest = (interestRate / 100) * loanAmount * loanDuration / 12;
        total = loanAmount + totalInterest;
        monthlyPayment = total / loanDuration;
        totalPayment = loanAmount + totalInterest + processing_fee;
        //nein repayment schedule required for flat-rate loans
    } else if (interestType === "reducing_balance") {
        const monthlyPrincipal = loanAmount / loanDuration;
        let remainingPrincipal = loanAmount;

        //simulate detailed repayment schedule
        for (let i = 1; i <= loanDuration; i++) {
            //calculate monthly interest using the simplified formula
            const monthlyInterest = (remainingPrincipal * interestRate) / 100 / 12;
            const monthly = monthlyPrincipal + monthlyInterest;

            if (i === 1) {
                monthlyPayment = monthly; //save the first month's payment
            }

            repaymentSchedule.push({
                month: i,
                payment: monthly.toFixed(2),
                interest: monthlyInterest.toFixed(2),
                principal: monthlyPrincipal.toFixed(2),
                remainingPrincipal: (remainingPrincipal - monthlyPrincipal).toFixed(2),
            });

            totalInterest += monthlyInterest;
            remainingPrincipal -= monthlyPrincipal;
        }

        totalPayment = loanAmount + totalInterest + processing_fee;
        console.log('Outside loop:');
        console.log('Per month payment:', monthlyPayment);
        console.log('Total payment:', totalPayment);
        console.log('Initial loan amount:', totalCapital);
        console.log('Total interest:', totalInterest);
    } else {
        throw new Error("Invalid interest type");
    }

    return {
        monthlyPayment: monthlyPayment.toFixed(2),
        totalPayment: totalPayment.toFixed(2),
        totalCapital: totalCapital.toFixed(2),
        totalInterest: totalInterest.toFixed(2),
        duration: loanDuration,
        interestRate: interestRate,
        interestType: interestType,
        repaymentSchedule: interestType === "reducing_balance" ? repaymentSchedule : null,
    };
};

module.exports = {
    calculateRepaymentPlan,
};
