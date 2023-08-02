/* eslint-disable no-undef */
const mysql = require('mysql2/promise');
require('dotenv').config();

async function init() {
	try {
		const connection = await mysql.createConnection({
			host: process.env.DB_HOST,
			user: process.env.DB_USER,
			password: process.env.DB_PASSWORD,
			database: process.env.DB_NAME
		});
		return connection;
	} catch (err) {
		console.error(`Error when connecting to the database: ${err}`);
		throw err;
	}
}

async function getOne(id) {
	const connection = await init();
	try {
		const [rows] = await connection.query('SELECT * FROM bankslips WHERE id = ?', [id]);
		connection.end();
		return rows.length === 0 ? null : rows[0];
	} catch (err) {
		console.error(`Error when getting bank slip: ${err}`);
		connection.end();
		throw err;
	}
}

async function getAll() {
	const connection = await init();
	try {
		const [rows] = await connection.query('SELECT * FROM bankslips');
		connection.end();
		return rows;
	} catch (err) {
		console.error(`Error when getting bank slips: ${err}`);
		connection.end();
		throw err;
	}
}

async function remove(id) {
	const connection = await init();
	try {
		const [result] = await connection.query('DELETE FROM bankslips WHERE id = ?', [id]);
		connection.end();
		return result.affectedRows > 0;
	} catch (err) {
		console.error(`Error when removing bank slip: ${err}`);
		connection.end();
		throw err;
	}
}

async function update(entity) {
	const { id } = entity;
	delete entity.id;
	const connection = await init();
	try {
		const [result] = await connection.query('UPDATE bankslips SET ? WHERE id = ?', [entity, id]);
		connection.end();
		return result.affectedRows > 0;
	} catch (err) {
		console.error(`Error when updating bank slip: ${err}`);
		connection.end();
		throw err;
	}
}

async function create(entity) {
	const connection = await init();
	try {
		const [result] = await connection.query('INSERT INTO bankslips SET ?', [entity]);
		connection.end();
		return result.insertId;
	} catch (err) {
		console.error(`Error when creating bank slip: ${err}`);
		connection.end();
		throw err;
	}
}

module.exports = { init, getOne, getAll, remove, update, create };
