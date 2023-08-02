/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */

const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
chai.use(sinonChai);
const { expect } = chai;
const bankSlipController = require('../../src/controllers/BankSlipController');
const bankSlipRepository = require('../../src/model/bankSlipRepository');
const calculate = require('../../src/middlewares/calculator');

describe('Bank Slip Controller', () => {
	let createStub, getOneStub, getAllStub, removeStub, updateStub;

	beforeEach(() => {
		createStub = sinon.stub(bankSlipRepository, 'create');
		getOneStub = sinon.stub(bankSlipRepository, 'getOne');
		getAllStub = sinon.stub(bankSlipRepository, 'getAll');
		removeStub = sinon.stub(bankSlipRepository, 'remove');
		updateStub = sinon.stub(bankSlipRepository, 'update');
	});


	afterEach(() => {
		sinon.restore();
	});

	describe('createBankSlip()', () => {
		it('Should respond with 422 when bank slip is not provided in request body', async () => {
			const req = {
				body: {},
			};
			const res = {
				status: sinon.stub().returnsThis(),
				json: sinon.stub(),
			};

			const next = sinon.stub();

			await bankSlipController.createBankSlip(req, res, next);

			expect(next.calledOnce).to.be.true;
			expect(next.args[0][0].message).to.equal('Bank slip not provided in the request body');
			expect(next.args[0][0].status).to.equal(422);
		});

		it('Should respond with 422 when bank slip creation fails', async () => {
			const req = {
				body: {
					due_date: '2023-06-02',
					total_in_cents: 10000,
					customer: 'John Doe',
				},
			};
			const res = {
				status: sinon.stub().returnsThis(),
				json: sinon.stub(),
			};

			const next = sinon.stub();

			createStub.rejects(new Error('Invalid bank slip provided'));

			await bankSlipController.createBankSlip(req, res, next);

			expect(next.calledOnce).to.be.true;
			expect(next.args[0][0].message).to.equal('Invalid bank slip provided');
			expect(next.args[0][0].status).to.equal(500);
		});

		it('Should create a bank slip with successful', async () => {
			const req = {
				body: {
					due_date: '2023-06-02',
					total_in_cents: 10000,
					customer: 'John Doe',
				},
			};

			const res = {
				status: sinon.stub().returnsThis(),
				json: sinon.stub(),
			};

			const next = sinon.stub();

			const entity = {
				due_date: req.body.due_date,
				total_in_cents: req.body.total_in_cents,
				customer: req.body.customer,
				status: 'PENDING',
			};

			const createdId = '1';
			createStub.resolves(createdId);

			await bankSlipController.createBankSlip(req, res, next);

			expect(res.status.calledWith(201)).to.be.true;
			expect(res.json.calledOnce).to.be.true;
			expect(res.json.args[0][0]).to.deep.equal({ id: createdId, ...entity });
		});

		it('Should respond with 500 when bank slip creation returns an error', async () => {
			const req = {
				body: {
					due_date: '2023-06-02',
					total_in_cents: 10000,
					customer: 'John Doe',
				},
			};

			const res = {
				status: sinon.stub().returnsThis(),
				json: sinon.stub(),
			};

			const next = sinon.stub();

			createStub.rejects(new Error('Database connection error'));

			await bankSlipController.createBankSlip(req, res, next);

			expect(res.status.called).to.be.false;
			expect(res.json.called).to.be.false;
			expect(next.calledOnce).to.be.true;
			expect(next.args[0][0].message).to.equal('Database connection error');
			expect(next.args[0][0].status).to.equal(500);
		});
	});

	describe('cancelBankSlipById()', () => {
		it('Should cancel a pending bank slip and return it', async () => {
			const req = {
				params: {
					id: 'valid-id'
				}
			};
			const res = {
				json: sinon.stub(),
			};

			const next = sinon.stub();

			const bankSlip = {
				id: 'valid-id',
				status: 'PENDING'
			};

			getOneStub.returns(bankSlip);
			updateStub.returns({ ...bankSlip, status: 'CANCELED' });

			await bankSlipController.cancelBankSlipById(req, res, next);

			expect(res.json.calledWith({ ...bankSlip, status: 'CANCELED' })).to.be.true;
			expect(next.called).to.be.false;
		});

		it('Should respond with 422 when bank slip is not pending', async () => {
			const req = {
				params: {
					id: 'valid-id'
				}
			};
			const res = {
				status: sinon.stub().returnsThis(),
				json: sinon.stub(),
			};

			const next = sinon.stub();

			const bankSlip = {
				id: 'valid-id',
				status: 'PAID'
			};

			getOneStub.returns(bankSlip);

			await bankSlipController.cancelBankSlipById(req, res, next);

			expect(next.calledOnce).to.be.true;
			expect(next.args[0][0].message).to.equal('Cannot cancel bank slip that is not in pending status');
			expect(next.args[0][0].status).to.equal(422);
		});

		it('Should respond with 404 when bank slip does not exist', async () => {
			const req = {
				params: {
					id: 'non-existent-id'
				}
			};
			const res = {
				status: sinon.stub().returnsThis(),
				json: sinon.stub(),
			};

			const next = sinon.stub();

			getOneStub.returns(null);

			await bankSlipController.cancelBankSlipById(req, res, next);

			expect(next.calledOnce).to.be.true;
			expect(next.args[0][0].message).to.equal('Bank slip not found');
			expect(next.args[0][0].status).to.equal(404);
		});

		it('Should respond with 500 when bank slip cancellation update returns an error', async () => {
			const req = {
				params: {
					id: 'valid-id',
				},
			};
			const res = {
				status: sinon.stub().returnsThis(),
				json: sinon.stub(),
			};
			const next = sinon.stub();

			const bankSlip = {
				id: 'valid-id',
				status: 'PENDING',
			};

			getOneStub.returns(bankSlip);

			const updateError = new Error('Bank slip update error');
			updateStub.rejects(updateError);

			await bankSlipController.cancelBankSlipById(req, res, next);

			expect(updateStub.calledOnceWithExactly({ ...bankSlip, status: 'CANCELED' })).to.be.true;
			expect(next.calledOnce).to.be.true;
			expect(next.args[0][0]).to.equal(updateError);
			expect(next.args[0][0].status).to.equal(500);
		});
	});

	describe('getBankSlipOr404()', () => {
		it('Should return a bank slip', async () => {
			const validBankSlipId = 'valid-id';
			const bankSlip = {
				id: validBankSlipId,
				due_date: '2023-07-30',
				payment_date: null,
				total_in_cents: 5000,
				customer: 'John Doe',
				status: 'PENDING',
			};

			getOneStub.withArgs(validBankSlipId).resolves(bankSlip);

			const result = await bankSlipController.getBankSlipOr404(validBankSlipId);

			expect(result).to.deep.equal(bankSlip);

			expect(getOneStub.calledOnceWithExactly(validBankSlipId)).to.be.true;
		});

		it('Should respond with 404 when bank slip does not exist', async () => {
			const nonExistentBankSlipId = 'non-existent-id';

			getOneStub.withArgs(nonExistentBankSlipId).resolves(null);

			const expectedErrorMessage = 'Bank slip not found';

			try {
				await bankSlipController.getBankSlipOr404(nonExistentBankSlipId);

				expect.fail('Expected an error to be thrown');
			} catch (err) {
				expect(err.message).to.equal(expectedErrorMessage);
				expect(err.status).to.equal(404);

				expect(getOneStub.calledOnceWithExactly(nonExistentBankSlipId)).to.be.true;
			}
		});
	});

	describe('getBankSlipById()', () => {
		it('Should get a bankslip by id and return a status 200', async () => {
			const validBankSlipId = 'valid-id';
			const bankSlip = {
				id: validBankSlipId,
				due_date: '2023-07-30',
				payment_date: null,
				total_in_cents: 5000,
				customer: 'John Doe',
				status: 'PENDING'
			};

			getOneStub.withArgs(validBankSlipId).resolves(bankSlip);

			const req = {
				params: {
					id: validBankSlipId
				}
			};

			const res = {
				status: sinon.stub().returnsThis(),
				json: sinon.stub()
			};

			const next = sinon.stub();

			await bankSlipController.getBankSlipById(req, res, next);

			expect(getOneStub.calledOnceWithExactly(validBankSlipId)).to.be.true;
			expect(res.status.calledWith(200)).to.be.true;
			expect(res.json.calledOnce).to.be.true;
			expect(res.json.args[0][0]).to.deep.equal({
				id: bankSlip.id,
				due_date: bankSlip.due_date,
				payment_date: bankSlip.payment_date,
				total_in_cents: bankSlip.total_in_cents,
				customer: bankSlip.customer,
				fine: -489200,
				status: bankSlip.status
			});
			expect(next.called).to.be.false;
		});

		it('Should return the bank slip when the bank slip ID exists', async () => {

			const existingBankSlipId = 'existing-id';

			const existingBankSlip = {
				id: existingBankSlipId,
				due_date: '2023-07-30',
				payment_date: null,
				total_in_cents: 5000,
				customer: 'John Doe',
				status: 'PENDING',
			};

			getOneStub.withArgs(existingBankSlipId).resolves(existingBankSlip);

			const req = {
				params: {
					id: existingBankSlipId,
				},
			};

			const res = {
				status: sinon.stub().returnsThis(),
				json: sinon.stub(),
			};

			const next = sinon.stub();

			await bankSlipController.getBankSlipById(req, res, next);

			expect(getOneStub.calledOnceWithExactly(existingBankSlipId)).to.be.true;
			expect(res.status.calledWith(200)).to.be.true;
			expect(res.json.calledOnce).to.be.true;
			expect(res.json.args[0][0]).to.deep.equal({
				id: existingBankSlip.id,
				due_date: existingBankSlip.due_date,
				payment_date: existingBankSlip.payment_date,
				total_in_cents: existingBankSlip.total_in_cents,
				customer: existingBankSlip.customer,
				fine: -489200,
				status: existingBankSlip.status,
			});
			expect(next.called).to.be.false;
		});

		it('Should respond with 500 when there is an error retrieving the bank slip', async () => {

			const existingBankSlipId = 'existing-id';

			const retrievalError = new Error('Error retrieving bank slip');
			getOneStub.withArgs(existingBankSlipId).rejects(retrievalError);

			const req = {
				params: {
					id: existingBankSlipId,
				},
			};

			const res = {
				status: sinon.stub().returnsThis(),
				json: sinon.stub(),
			};

			const next = sinon.stub();

			await bankSlipController.getBankSlipById(req, res, next);

			expect(getOneStub.calledOnceWithExactly(existingBankSlipId)).to.be.true;

			expect(res.status.called).to.be.false;
			expect(res.json.called).to.be.false;
			expect(next.calledOnce).to.be.true;
			expect(next.args[0][0]).to.equal(retrievalError);
			expect(next.args[0][0].status).to.equal(500);
		});
	});

	describe('getAllBankSlips()', () => {
		it('Should return all slips with a status of 200', async () => {
			const bankSlips = [
				{
					id: '1',
					due_date: '2023-07-30',
					payment_date: null,
					total_in_cents: 5000,
					customer: 'John Doe',
					status: 'PENDING',
				},
				{
					id: '2',
					due_date: '2023-08-15',
					payment_date: null,
					total_in_cents: 7500,
					customer: 'Jane Smith',
					status: 'PENDING',
				},
			];

			getAllStub.resolves(bankSlips);

			const req = {};
			const res = {
				json: sinon.stub(),
			};
			const next = sinon.stub();

			await bankSlipController.getAllBankSlips(req, res, next);

			expect(getAllStub.calledOnce).to.be.true;
			expect(res.json.calledWith(bankSlips)).to.be.true;
			expect(res.json.calledOnce).to.be.true;
			expect(next.called).to.be.false;
		});

		it('Should respond with 500 when there is an error retrieving bank slips', async () => {
			const retrievalError = new Error('Error retrieving bank slips');
			getAllStub.rejects(retrievalError);

			const req = {};
			const res = {
				status: sinon.stub().returnsThis(),
				json: sinon.stub(),
			};
			const next = sinon.stub();

			await bankSlipController.getAllBankSlips(req, res, next);

			expect(getAllStub.calledOnce).to.be.true;
			expect(res.status.called).to.be.false;
			expect(res.json.called).to.be.false;
			expect(next.calledOnce).to.be.true;
			expect(next.args[0][0]).to.equal(retrievalError);
			expect(next.args[0][0].status).to.equal(500);
		});

		it('Should return an empty array when there are no bank slips', async () => {
			const emptyBankSlips = [];

			getAllStub.resolves(emptyBankSlips);

			const req = {};
			const res = {
				json: sinon.stub(),
			};
			const next = sinon.stub();

			await bankSlipController.getAllBankSlips(req, res, next);

			expect(getAllStub.calledOnce).to.be.true;
			expect(res.json.calledWith(emptyBankSlips)).to.be.true;
			expect(res.json.calledOnce).to.be.true;
			expect(next.called).to.be.false;
		});
	});

	describe('deleteBankSlipById()', () => {
		it('should delete a bank slip and return status 200', async () => {
			const validBankSlipId = 'valid-id';

			const req = {
				params: {
					id: validBankSlipId,
				},
			};

			const res = {
				status: sinon.stub().returnsThis(),
				json: sinon.stub(),
			};

			const next = sinon.stub();

			const bankSlip = {
				id: validBankSlipId,
				due_date: '2023-06-02',
				total_in_cents: 10000,
				customer: 'John Doe',
				status: 'PENDING',
			};

			getOneStub.withArgs(validBankSlipId).resolves(bankSlip);

			removeStub.withArgs(validBankSlipId).resolves(true);

			await bankSlipController.deleteBankSlipById(req, res, next);

			expect(getOneStub.calledOnceWithExactly(validBankSlipId)).to.be.true;
			expect(removeStub.calledOnceWithExactly(validBankSlipId)).to.be.true;
			expect(res.status.calledWith(200)).to.be.true;
			expect(res.json.calledOnce).to.be.true;
			expect(res.json.args[0][0]).to.deep.equal({ message: 'Bank Slip deleted' });
			expect(next.called).to.be.false;
		});

		it('Should respond with status 500 when error occurs while checking bank slip existence', async () => {
			const validBankSlipId = 'valid-id';

			const req = {
				params: {
					id: validBankSlipId,
				},
			};
			const res = {
				status: sinon.stub().returnsThis(),
				json: sinon.stub(),
			};
			const next = sinon.stub();

			const existenceError = new Error('Bank slip existence check error');
			getOneStub.rejects(existenceError);

			await bankSlipController.deleteBankSlipById(req, res, next);

			expect(getOneStub.calledOnceWithExactly(validBankSlipId)).to.be.true;
			expect(res.status.called).to.be.false;
			expect(res.json.called).to.be.false;
			expect(next.calledOnce).to.be.true;
			expect(next.args[0][0]).to.equal(existenceError);
			expect(next.args[0][0].status).to.equal(500);
		});

		it('Should respond with status 500 when error occurs while deleting bank slip', async () => {
			const validBankSlipId = 'valid-id';

			const req = {
				params: {
					id: validBankSlipId,
				},
			};

			const res = {
				status: sinon.stub().returnsThis(),
				json: sinon.stub(),
			};

			const next = sinon.stub();

			const bankSlip = {
				id: validBankSlipId,
				due_date: '2023-06-02',
				total_in_cents: 10000,
				customer: 'John Doe',
				status: 'PENDING',
			};

			getOneStub.withArgs(validBankSlipId).resolves(bankSlip);

			const deletionError = new Error('Bank slip deletion error');
			removeStub.withArgs(validBankSlipId).rejects(deletionError);

			await bankSlipController.deleteBankSlipById(req, res, next);

			expect(getOneStub.calledOnceWithExactly(validBankSlipId)).to.be.true;
			expect(removeStub.calledOnceWithExactly(validBankSlipId)).to.be.true;
			expect(res.status.called).to.be.false;
			expect(res.json.called).to.be.false;
			expect(next.calledOnce).to.be.true;
			expect(next.args[0][0]).to.equal(deletionError);
			expect(next.args[0][0].status).to.equal(500);
		});
	});

	describe('payBankSlip()', () => {
		it('Should pay a bank slip and return status 204', async () => {
			const validBankSlipId = 'valid-id';
			const paymentDate = '2023-08-02';

			const req = {
				params: {
					id: validBankSlipId,
				},
				body: {
					payment_date: paymentDate,
				},
			};

			const res = {
				status: sinon.stub().returnsThis(),
				send: sinon.stub(),
			};

			const next = sinon.stub();

			const pendingBankSlip = {
				id: validBankSlipId,
				due_date: '2023-08-10',
				payment_date: null,
				total_in_cents: 10000,
				customer: 'John Doe',
				status: 'PENDING',
			};
			getOneStub.withArgs(validBankSlipId).resolves(pendingBankSlip);

			updateStub.withArgs(sinon.match({ id: validBankSlipId, status: 'PAID', payment_date: paymentDate })).resolves(true);

			await bankSlipController.payBankSlip(req, res, next);

			expect(getOneStub.calledOnceWithExactly(validBankSlipId)).to.be.true;
			expect(updateStub.calledOnce).to.be.true;
			expect(updateStub.args[0][0]).to.deep.include({
				id: validBankSlipId,
				status: 'PAID',
				payment_date: paymentDate,
			});
			expect(res.status.calledWith(204)).to.be.true;
			expect(res.send.calledOnce).to.be.true;
			expect(next.called).to.be.false;
		});

		it('Should respond with status 500 when there is an error updating bank slip status', async () => {
			const validBankSlipId = 'valid-id';
			const paymentDate = '2023-08-02';

			const req = {
				params: {
					id: validBankSlipId,
				},
				body: {
					payment_date: paymentDate,
				},
			};

			const res = {
				status: sinon.stub().returnsThis(),
				json: sinon.stub(),
			};

			const next = sinon.stub();

			const pendingBankSlip = {
				id: validBankSlipId,
				due_date: '2023-08-10',
				payment_date: null,
				total_in_cents: 10000,
				customer: 'John Doe',
				status: 'PENDING',
			};

			getOneStub.withArgs(validBankSlipId).resolves(pendingBankSlip);

			const updateError = new Error('Error updating bank slip status');
			updateStub.rejects(updateError);

			await bankSlipController.payBankSlip(req, res, next);

			expect(getOneStub.calledOnceWithExactly(validBankSlipId)).to.be.true;
			expect(updateStub.calledOnce).to.be.true;
			expect(updateStub.args[0][0]).to.deep.include({
				id: validBankSlipId,
				status: 'PAID',
				payment_date: paymentDate,
			});
			expect(res.status.called).to.be.false;
			expect(res.json.called).to.be.false;
			expect(next.calledOnce).to.be.true;
			expect(next.args[0][0]).to.equal(updateError);
			expect(next.args[0][0].status).to.equal(500);
		});

		it('Should respond with status 500 when there is an error updating bank slip status', async () => {
			const validBankSlipId = 'valid-id';
			const paymentDate = '2023-08-02';

			const req = {
				params: {
					id: validBankSlipId,
				},
				body: {
					payment_date: paymentDate,
				},
			};

			const res = {
				status: sinon.stub().returnsThis(),
				json: sinon.stub(),
			};

			const next = sinon.stub();

			const pendingBankSlip = {
				id: validBankSlipId,
				due_date: '2023-08-10',
				payment_date: null,
				total_in_cents: 10000,
				customer: 'John Doe',
				status: 'PENDING',
			};

			getOneStub.withArgs(validBankSlipId).resolves(pendingBankSlip);

			const updateError = new Error('Error updating bank slip status');
			updateStub.rejects(updateError);

			await bankSlipController.payBankSlip(req, res, next);

			expect(getOneStub.calledOnceWithExactly(validBankSlipId)).to.be.true;
			expect(updateStub.calledOnce).to.be.true;
			expect(updateStub.args[0][0]).to.deep.include({
				id: validBankSlipId,
				status: 'PAID',
				payment_date: paymentDate,
			});
			expect(res.status.called).to.be.false;
			expect(res.json.called).to.be.false;
			expect(next.calledOnce).to.be.true;
			expect(next.args[0][0]).to.equal(updateError);
			expect(next.args[0][0].status).to.equal(500);
		});
	});
});
