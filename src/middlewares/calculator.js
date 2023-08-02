function calculateFine(dueDate, paymentDate, totalInCents) {
	const oneDay = 24 * 60 * 60 * 1000; // milliseconds in a day
	const dueDateObj = new Date(dueDate);
	const paymentDateObj = new Date(paymentDate);
	const daysDifference = Math.round((paymentDateObj - dueDateObj) / oneDay);
  
	if (daysDifference <= 10) {
		return Math.round(totalInCents * 0.005 * daysDifference);
	} else {
		return Math.round(totalInCents * 0.01 * daysDifference);
	}
}
module.exports = calculateFine;