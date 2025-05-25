CREATE TABLE IF NOT EXISTS users (
                                     id SERIAL PRIMARY KEY,
                                     username VARCHAR(100) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    pass TEXT NOT NULL
    );

CREATE TABLE IF NOT EXISTS employment (
                                          id SERIAL PRIMARY KEY,
                                          start_date DATE NOT NULL,
                                          finish_date DATE NOT NULL,
                                          status VARCHAR(64) NOT NULL
    );

CREATE TABLE IF NOT EXISTS employee (
                                        id SERIAL PRIMARY KEY,
                                        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    position VARCHAR(100) NOT NULL,
    department VARCHAR(100) NOT NULL,
    employment_id INTEGER REFERENCES employment(id) ON DELETE CASCADE,
    role VARCHAR(32) NOT NULL DEFAULT 'user'
    );

CREATE TABLE IF NOT EXISTS schedules (
                                         id SERIAL PRIMARY KEY,
                                         employee_id INTEGER REFERENCES employee(id) ON DELETE CASCADE,
    day_of_week VARCHAR(20) NOT NULL CHECK (day_of_week IN ('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday')),
    start_time TIME NOT NULL,
    finish_time TIME NOT NULL,
    CHECK (finish_time > start_time)
    );

CREATE TABLE IF NOT EXISTS payment_details (
                                               id SERIAL PRIMARY KEY,
                                               recipient_name VARCHAR(100) NOT NULL,
    card_number VARCHAR(20) NOT NULL,
    gross_amount FLOAT NOT NULL
    );

CREATE TABLE IF NOT EXISTS salaries (
                                        id SERIAL PRIMARY KEY,
                                        employee_id INTEGER REFERENCES employee(id) ON DELETE CASCADE,
    gross_amount FLOAT NOT NULL,
    payment_details_id INTEGER REFERENCES payment_details(id) ON DELETE CASCADE,
    payout_date DATE NOT NULL,
    type VARCHAR(64) NOT NULL,
    last_withdrawal_status VARCHAR(64) NOT NULL
    );