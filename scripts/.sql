/* Criando o banco de dados */

CREATE TABLE bankslips (
    id VARCHAR(50) PRIMARY KEY,
    due_date DATE NOT NULL,
    payment_date DATE,
    total_in_cents INT NOT NULL,
    customer VARCHAR(255) NOT NULL,
    status VARCHAR(20) NOT NULL
);

/* Inserindo um novo boleto na tabela: */

INSERT INTO bankslips (id, due_date, total_in_cents, customer, status)
VALUES ('84e8adbf-1a14-403b-ad73-d78ae19b59bf', '2018-01-01', 100000, 'Trillian Company', 'PENDING');

/* Para listar todos os boletos: */

SELECT * FROM bankslips;

/* Para buscar um boleto específico: */

SELECT * FROM bankslips WHERE id = 'c2dbd236-3fa5-4ccc-9c12-bd0ae1d6dd89';

/* Para pagar um boleto específico: */

UPDATE bankslips SET status = 'PAID', payment_date = '2018-06-30' WHERE id = 'c2dbd236-3fa5-4ccc-9c12-bd0ae1d6dd89';

/* Para cancelar um boleto específco */

UPDATE bankslips SET status = 'CANCELED' WHERE id = 'c2dbd236-3fa5-4ccc-9c12-bd0ae1d6dd89';
