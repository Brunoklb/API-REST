const { create, getAll, getOne, init, remove, update } = require('../../src/db/bankSlipRepository');
const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
chai.use(sinonChai);
const { expect } = chai;
const mysql = require('mysql');

describe('Database functions', () => {
    let queryStub;

    beforeEach(() => {
        queryStub = sinon.stub();
    });

    afterEach(() => {
        sinon.restore();
    });

    describe('init', () => {
        it('should initialize a database connection', async () => {
            const connection = { query: queryStub };
            const createConnectionStub = sinon.stub(mysql, 'createConnection').resolves(connection);
            const conn = await init();

            expect(createConnectionStub).to.have.been.called;
            expect(conn).to.equal(connection);
        });
    });

    describe('getOne', () => {
        it('should return one bank slip by id', async () => {
            const bankSlip = { id: 1, name: 'Test Bank Slip', due_date: '2023-05-01', amount: 100, paid: false };
            const connection = { query: queryStub, end: sinon.stub() };
            queryStub.resolves([[bankSlip]]);
            sinon.stub(mysql, 'createConnection').resolves(connection);

            const result = await getOne(1);

            expect(queryStub).to.have.been.calledWith('SELECT * FROM bankslips WHERE id = ?', [1]);
            expect(result).to.deep.equal(bankSlip);
        });
    });

    describe('getAll', () => {
        it('should return all bank slips', async () => {
            const bankSlips = [
                { id: 1, name: 'Test Bank Slip 1', due_date: '2023-05-01', amount: 100, paid: false },
                { id: 2, name: 'Test Bank Slip 2', due_date: '2023-05-02', amount: 200, paid: false },
            ];
            const connection = { query: queryStub, end: sinon.stub() };
            queryStub.resolves([bankSlips]);
            sinon.stub(mysql, 'createConnection').resolves(connection);

            const result = await getAll();

            expect(queryStub).to.have.been.calledWith('SELECT * FROM bankslips');
            expect(result).to.deep.equal(bankSlips);
        });
    });
});
