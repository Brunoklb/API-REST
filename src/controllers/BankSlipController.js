const { create, getOne, getAll, remove, update } = require('../db/bankSlipRepository');
const calculate = require('../payment/calculator');

async function createBankSlip(req, res) {
	const { due_date, total_in_cents, customer } = req.body;
	if (!due_date || !total_in_cents || !customer) {
		return res.status(400).json({ message: 'Bank slip not provided in the request body' });
	}

	const entity = {
		due_date,
		total_in_cents,
		customer,
		status: 'PENDING'
	};

	try {
		const id = await create(entity);
		const createdBankSlip = { id, ...entity };
		res.status(201).json(createdBankSlip);
	} catch (err) {
		res.status(422).json({ message: 'Invalid bank slip provided' });
	}
}

async function getBankSlipById(req, res) {
	const { id } = req.params;

	try {
		const bankSlip = await getOne(id);
		if (!bankSlip) {
			return res.status(404).json({ message: 'Bank slip not found' });
		}

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
		res.status(500).json({ message: 'Error retrieving bank slip' });
	}
}

async function getAllBankSlips(req, res) {
	try {
		const bankSlips = await getAll();
		res.json(bankSlips);
	} catch (err) {
		res.status(500).json({ message: 'Error retrieving bank slips' });
	}
}

async function deleteBankSlipById(req, res) {
	const { id } = req.params;

	try {
		const bankSlip = await remove(id);
		if (!bankSlip) {
			return res.status(404).json({ message: 'Bank slip not found' });
		}
		res.status(200).json({ message: 'Bank Slip deleted' });
	} catch (err) {
		res.status(500).json({ message: 'Error retrieving bank slip' });
	}
}

async function payBankSlip(req, res) {
	const { id } = req.params;
	const { payment_date } = req.body;

	if (!payment_date) {
		return res.status(400).json({ message: 'Payment date not provided in the request body' });
	}

	try {
		const bankSlip = await getOne(id);
		if (!bankSlip) {
			return res.status(404).json({ message: 'Bank slip not found with the specified id' });
		}

		bankSlip.status = 'PAID';
		bankSlip.payment_date = payment_date;

		const result = await update(bankSlip);
		if (result) {
			return res.status(204).send();
		} else {
			return res.status(500).json({ message: 'Error updating bank slip status' });
		}
	} catch (err) {
		console.log(err.message);
		res.status(500).json({ message: 'Error paying bank slip' });
	}
}

async function cancelBankSlipById(req, res) {
	const { id } = req.params;

	try {
		const bankSlip = await getOne(id);
		if (!bankSlip) {
			return res.status(404).json({ message: 'Bank slip not found' });
		}

		if (bankSlip.status !== 'PENDING') {
			return res.status(400).json({ message: 'Cannot cancel bank slip that is not in pending status' });
		}

		bankSlip.status = 'CANCELED';
		const result = await update(bankSlip);
		if (result) {
			return res.json(bankSlip);
		} else {
			return res.status(500).json({ message: 'Error canceling bank slip' });
		}
	} catch (err) {
		res.status(500).json({ message: 'Error retrieving bank slip' });
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
