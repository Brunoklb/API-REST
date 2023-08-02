const bankSlipRepository = require('../model/bankSlipRepository');
const calculate = require('../middlewares/calculator');

async function getBankSlipOr404(id) {
	const bankSlip = await bankSlipRepository.getOne(id);
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
	} catch (err) {
		err.status = err.status || 500;
		next(err);
	}
}

async function getBankSlipById(req, res, next) {
	try {
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
	} catch (err) {
		err.status = err.status || 500;
		next(err);
	}
}

async function getAllBankSlips(req, res, next) {
	try {
		const bankSlips = await bankSlipRepository.getAll();
		res.json(bankSlips);
	} catch (err) {
		err.status = err.status || 500;
		next(err);
	}
}

async function deleteBankSlipById(req, res, next) {
	try {
		const { id } = req.params;
		await getBankSlipOr404(id);
		await bankSlipRepository.remove(id);
		res.status(200).json({ message: 'Bank Slip deleted' });
	} catch (err) {
		err.status = err.status || 500;
		next(err);
	}
}

async function payBankSlip(req, res, next) {
	try {
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

		const result = await bankSlipRepository.update(bankSlip);
		if (result) {
			return res.status(204).send();
		} else {
			const err = new Error('Error updating bank slip status');
			err.status = 500;
			throw err;
		}
	} catch (err) {
		err.status = err.status || 500;
		next(err);
	}
}

async function cancelBankSlipById(req, res, next) {
	try {
		const { id } = req.params;

		const bankSlip = await getBankSlipOr404(id);
		if (bankSlip.status !== 'PENDING') {
			const err = new Error('Cannot cancel bank slip that is not in pending status');
			err.status = 422;
			throw err;
		}

		bankSlip.status = 'CANCELED';
		const result = await bankSlipRepository.update(bankSlip);
		if (result) {
			return res.json(bankSlip);
		} else {
			const err = new Error('Error canceling bank slip');
			err.status = 500;
			throw err;
		}
	} catch (err) {
		err.status = err.status || 500;
		next(err);
	}
}

module.exports = {
	getBankSlipOr404,
	createBankSlip,
	getBankSlipById,
	getAllBankSlips,
	deleteBankSlipById,
	payBankSlip,
	cancelBankSlipById
};
