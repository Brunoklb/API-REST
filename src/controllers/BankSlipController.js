const bankSlipRepository = require('../db/bankSlipRepository');
const calculate = require('../payment/calculator');

async function getBankSlipOr404(id) {
	const bankSlip = await getOne(id);
	if (!bankSlip) {
		const err = new Error('Bank slip not found');
		err.status = 404;
		throw err;
	}
	return bankSlip;
}

async function createBankSlip(req, res, next) {
	const { due_date, total_in_cents, customer } = req.body;
	if (!due_date || !total_in_cents || !customer) {
		const err = new Error('Bank slip not provided in the request body');
		err.status = 422;
		return next(err);
	}

	const entity = {
		due_date,
		total_in_cents,
		customer,
		status: 'PENDING'
	};

	try {
		const id = await bankSlipRepository.create(entity);
		const createdBankSlip = { id, ...entity };
		res.status(201).json(createdBankSlip);
		next();
	} catch(err) {
		err.status = 422;
		next(err);
	}
}

async function getBankSlipById(req, res) {
	const { id } = req.params;

	const bankSlip = await getBankSlipOr404(id);
	const { due_date, payment_date, total_in_cents, customer, status } = bankSlip;
	const fine = calculate(due_date, payment_date, total_in_cents);

	const updatedBankSlip = {
		id,
		due_date,
		payment_date,
		total_in_cents,
		customer,
		fine,
		status
	};

	res.status(200).json(updatedBankSlip);
}

async function getAllBankSlips(req, res) {
	const bankSlips = await getAll();
	res.json(bankSlips);
}

async function deleteBankSlipById(req, res) {
	const { id } = req.params;

	const bankSlip = await getBankSlipOr404(id);
	await remove(id);
	res.status(200).json({ message: 'Bank Slip deleted' });
}

async function payBankSlip(req, res) {
	const { id } = req.params;
	const { payment_date } = req.body;

	if (!payment_date) {
		const err = new Error('Payment date not provided in the request body');
		err.status = 422;
		return next(err);
	}

	const bankSlip = await getBankSlipOr404(id);
	bankSlip.status = 'PAID';
	bankSlip.payment_date = payment_date;

	const result = await update(bankSlip);
	if (result) {
		return res.status(204).send();
	} else {
		const err = new Error('Error updating bank slip status');
		err.status = 500;
		throw err;
	}
}

async function cancelBankSlipById(req, res) {
	const { id } = req.params;

	const bankSlip = await getBankSlipOr404(id);
	if (bankSlip.status !== 'PENDING') {
		const err = new Error('Cannot cancel bank slip that is not in pending status');
		err.status = 422;
		throw err;
	}

	bankSlip.status = 'CANCELED';
	const result = await update(bankSlip);
	if (result) {
		return res.json(bankSlip);
	} else {
		const err = new Error('Error canceling bank slip');
		err.status = 500;
		throw err;
	}
}

module.exports = {
	createBankSlip,
	getBankSlipById,
	getAllBankSlips,
	deleteBankSlipById,
	payBankSlip,
	cancelBankSlipById
};
