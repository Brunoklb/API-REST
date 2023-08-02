/* eslint-disable no-undef */
const { create, getAll, getOne, init, remove, update } = require('../../src/model/bankSlipRepository');
const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
chai.use(sinonChai);
const { expect } = chai;
const mysql2 = require('mysql2/promise');

describe('Database functions', ()=>{
	let queryStub;

	beforeEach(()=>{
		queryStub=sinon.stub();
	});

	afterEach(()=>{
		sinon.restore();
	});

	describe('init()', ()=>{
		it('Should initialize a database', async()=>{
			const connection = { query:queryStub, end: sinon.stub };
			const createConnectionStub = sinon.stub(mysql2, 'createConnection').resolves(connection);
			const conn = await init();

			expect(createConnectionStub).to.have.been.called;
			expect(conn).to.equal(connection);
		});

		it('Should initialize a database with a correct parameters', async()=>{
			const expectedHost = process.env.DB_HOST;
			const expectedUser = process.env.DB_USER;
			const expectedPassword = process.env.DB_PASSWORD;
			const expectedDatabase = process.env.DB_NAME;
			const connection = {query:queryStub, end:sinon.stub()};
			const createConnectionStub = sinon.stub(mysql2, 'createConnection').resolves(connection);
			const conn = await init();

			expect(createConnectionStub).to.been.calledWith({
				host: expectedHost,
				user: expectedUser,
				password: expectedPassword,
				database: expectedDatabase,
			});
			expect(conn).to.equal(connection);
		});
	});

	describe('getOne()', ()=>{
		it('Should return one bank slip by id', async()=>{
			const connection = { query:queryStub, end: sinon.stub() };
			const bankSip = { id: 1, name: 'Test Bank Slip', due_date: '2023-05-01', amount: 100, paid: false };
			queryStub.resolves([[bankSip]]);
			sinon.stub(mysql2, 'createConnection').resolves(connection);
			const result = await getOne(1);

			expect(queryStub).to.have.been.calledWith('SELECT * FROM bankslips WHERE id = ?', [1]);
			expect(result).to.deep.equal(bankSip);
		});

		it('Should return null if no bank slip is found', async()=>{
			const connection = { query: queryStub, end: sinon.stub() };
			queryStub.resolves([[]]);
			sinon.stub(mysql2, 'createConnection').resolves(connection);
			const result = await getOne(1);

			expect(queryStub).to.have.been.calledWith('SELECT * FROM bankslips WHERE id = ?', [1]);
			expect(result).to.be.null;
		});
	});

	describe('getAll()', ()=>{
		it('Should return all bank slips', async()=>{
			const connection = { query:queryStub, end: sinon.stub() };
			const bankSlips = [
				{id: 1, name: 'Test Bank Slip', due_date: '2023-04-30', amount: 100, paid: false,},
				{id: 2, name: 'Test Bank Slip 2', due_date: '2023-05-01', amount: 100, paid: false},
			];
			queryStub.resolves([bankSlips]);
			sinon.stub(mysql2, 'createConnection').resolves(connection);
			const result = await getAll();

			expect(queryStub).to.have.been.calledWith('SELECT * FROM bankslips');
			expect(result).to.equal(bankSlips);
		});

		it('Should return an empty array if no bank slip are found', async()=>{
			const connection = { query:queryStub, end: sinon.stub() };
			queryStub.resolves([[]]);
			sinon.stub(mysql2, 'createConnection').resolves(connection);
			const result = await getAll();

			expect(queryStub).to.have.been.calledWith('SELECT * FROM bankslips');
			expect(result).to.be.an('array').that.is.empty;
		});       
	});

	describe('remove()', ()=>{
		it('Should remove a bank slip by id', async()=>{
			const id = 1;
			const connection = { query:queryStub, end: sinon.stub() };
			queryStub.resolves([{ affectedRows: 1 }]);
			sinon.stub(mysql2, 'createConnection').resolves(connection);
			const result = await remove(id);

			expect(queryStub).to.have.been.calledWith('DELETE FROM bankslips WHERE id = ?', [id]);
			expect(result).to.be.true;
		});

		it('Should return false if no bank slip was remove', async()=>{
			const id = 1;
			const connection = { query:queryStub, end:sinon.stub() };
			queryStub.resolves([{affectedRows: 0}]);
			sinon.stub(mysql2, 'createConnection').resolves(connection);
			const result = await remove(id);

			expect(queryStub).to.have.been.calledWith('DELETE FROM bankslips WHERE id = ?', [id]);
			expect(result).to.be.false;
		});
	});

	describe('update()', ()=>{
		it('Should update a bank slip by id', async()=>{
			const bankSlip = { id: 1, name: 'Test Bank Slip', due_date: '2023-04-30', amount: 100, paid: false };
			const connection = { query: queryStub, end: sinon.stub() };
			// eslint-disable-next-line no-unused-vars
			const { id, ...updatedData } = bankSlip;
			queryStub.resolves([{affectedRows: 1}]);
			sinon.stub(mysql2, 'createConnection').resolves(connection);
			const result = await update(bankSlip);

			expect(queryStub).to.have.been.calledWith('UPDATE bankslips SET ? WHERE id = ?', [updatedData, 1]);
			expect(result).to.be.true;
		});
		it('Should return false if no bank slip was updated', async()=>{
			const bankSlip = { id: 1, name: 'Test Bank Slip', due_date: '2023-04-30', amount: 100, paid: false };
			const connection = { query:queryStub, end: sinon.stub() };
			// eslint-disable-next-line no-unused-vars
			const {id, ...updatedData} = bankSlip;
			queryStub.resolves([{affectedRows: 0}]);
			sinon.stub(mysql2, 'createConnection').resolves(connection);
			const result = await update(bankSlip);

			expect(queryStub).to.have.been.calledWith('UPDATE bankslips SET ? WHERE id = ?', [updatedData, 1]);
			expect(result).to.be.false;
		});
	});
	describe('create()', ()=>{
		it('Should create a new bank slip', async()=>{
			const bankSlip = { id: 1, name: 'Test Bank Slip', due_date: '2023-04-30', amount: 100, paid: false };
			const connection = { query:queryStub, end: sinon.stub() };
			queryStub.resolves([{insertId: 1}]);
			sinon.stub(mysql2, 'createConnection').resolves(connection);
			const result = await create(bankSlip);

			expect(queryStub).to.have.been.calledWith('INSERT INTO bankslips SET ?', [bankSlip]);
			expect(result).to.equal(1);
		});
	});
});