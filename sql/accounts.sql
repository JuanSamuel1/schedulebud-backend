-- creating table for user
-- user is reserved keywords in postgresql

DROP TABLE Accounts;

CREATE TABLE Accounts(
    user_id SERIAL PRIMARY KEY,
    email VARCHAR(255),
    password VARCHAR(255),
    status VARCHAR(255),
    confirmation_code VARCHAR(255)
);
