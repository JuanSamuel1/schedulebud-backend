CREATE TABLE Threads(
    thread_id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    content VARCHAR(255),
    is_anonymous INT NOT NULL
);

--is_anonymous 1: yes, 2: no