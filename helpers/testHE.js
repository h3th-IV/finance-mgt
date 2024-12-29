const calculateRepaymentPlan = (loanAmount, loanDuration, interestRate, interestType, processing_fee) => {
    let monthlyPayment, totalPayment, totalInterest = 0, totalCapital = loanAmount;

    if (interestType === "flat_rate") {
        // Flat-rate calculation
        totalInterest = (interestRate / 100) * loanAmount * loanDuration / 12;
        totalPayment = loanAmount + totalInterest + processing_fee;
        monthlyPayment = (loanAmount + totalInterest) / loanDuration;
    } else if (interestType === "reducing_balance") {
        // Reducing balance calculation
        const monthlyRate = interestRate / 100 / 12;
        monthlyPayment = loanAmount * monthlyRate / (1 - Math.pow(1 + monthlyRate, -loanDuration));
        totalPayment = monthlyPayment * loanDuration + processing_fee;

        let remainingPrincipal = loanAmount;

        // Simulate monthly breakdown
        const repaymentSchedule = [];
        for (let i = 1; i <= loanDuration; i++) {
            const monthlyInterest = remainingPrincipal * monthlyRate;
            const principalRepayment = monthlyPayment - monthlyInterest;

            repaymentSchedule.push({
                month: i,
                payment: monthlyPayment.toFixed(2),
                interest: monthlyInterest.toFixed(2),
                principal: principalRepayment.toFixed(2),
                remainingPrincipal: (remainingPrincipal - principalRepayment).toFixed(2),
            });

            totalInterest += monthlyInterest;
            remainingPrincipal -= principalRepayment;
        }

        console.log(repaymentSchedule); // Logs the breakdown for debugging
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
    };
};
