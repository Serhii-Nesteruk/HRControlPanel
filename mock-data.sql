-- ========================================
--   MOCK DATA FOR TESTING PURPOSES
--   Insert test records if they don't already exist
-- ========================================

-------------------------
-- USERS (6 записів)
-------------------------
INSERT INTO users (username, email, pass)
SELECT 'user1', 'user1@example.com', 'hashed_password_1'
    WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'user1');

INSERT INTO users (username, email, pass)
SELECT 'user2', 'user2@example.com', 'hashed_password_2'
    WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'user2');

INSERT INTO users (username, email, pass)
SELECT 'user3', 'user3@example.com', 'hashed_password_3'
    WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'user3');

INSERT INTO users (username, email, pass)
SELECT 'user4', 'user4@example.com', 'hashed_password_4'
    WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'user4');

INSERT INTO users (username, email, pass)
SELECT 'user5', 'user5@example.com', 'hashed_password_5'
    WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'user5');

INSERT INTO users (username, email, pass)
SELECT 'user6', 'user6@example.com', 'hashed_password_6'
    WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'user6');

-------------------------
-- EMPLOYMENT (6 записів)
-------------------------
INSERT INTO employment (start_date, finish_date, status)
SELECT '2024-01-01', '2024-12-31', 'active'
    WHERE NOT EXISTS (
    SELECT 1 FROM employment
    WHERE start_date = '2024-01-01' AND finish_date = '2024-12-31'
);

INSERT INTO employment (start_date, finish_date, status)
SELECT '2024-02-01', '2024-11-30', 'active'
    WHERE NOT EXISTS (
    SELECT 1 FROM employment
    WHERE start_date = '2024-02-01' AND finish_date = '2024-11-30'
);

INSERT INTO employment (start_date, finish_date, status)
SELECT '2024-03-01', '2024-10-31', 'inactive'
    WHERE NOT EXISTS (
    SELECT 1 FROM employment
    WHERE start_date = '2024-03-01' AND finish_date = '2024-10-31'
);

INSERT INTO employment (start_date, finish_date, status)
SELECT '2024-04-01', '2024-09-30', 'active'
    WHERE NOT EXISTS (
    SELECT 1 FROM employment
    WHERE start_date = '2024-04-01' AND finish_date = '2024-09-30'
);

INSERT INTO employment (start_date, finish_date, status)
SELECT '2024-05-01', '2024-08-31', 'active'
    WHERE NOT EXISTS (
    SELECT 1 FROM employment
    WHERE start_date = '2024-05-01' AND finish_date = '2024-08-31'
);

INSERT INTO employment (start_date, finish_date, status)
SELECT '2024-06-01', '2024-07-31', 'inactive'
    WHERE NOT EXISTS (
    SELECT 1 FROM employment
    WHERE start_date = '2024-06-01' AND finish_date = '2024-07-31'
);

-------------------------
-- EMPLOYEE (6 записів)
-- Кожному користувачу (user1...user6) прив'язуємо відповідний запис employment
-------------------------
INSERT INTO employee (user_id, position, department, employment_id, role)
SELECT u.id, 'Developer', 'IT', e.id, 'user'
FROM users u, employment e
WHERE u.username = 'user1'
  AND e.start_date = '2024-01-01'
  AND NOT EXISTS (SELECT 1 FROM employee WHERE user_id = u.id);

INSERT INTO employee (user_id, position, department, employment_id, role)
SELECT u.id, 'Designer', 'Creative', e.id, 'user'
FROM users u, employment e
WHERE u.username = 'user2'
  AND e.start_date = '2024-02-01'
  AND NOT EXISTS (SELECT 1 FROM employee WHERE user_id = u.id);

INSERT INTO employee (user_id, position, department, employment_id, role)
SELECT u.id, 'Manager', 'HR', e.id, 'admin'
FROM users u, employment e
WHERE u.username = 'user3'
  AND e.start_date = '2024-03-01'
  AND NOT EXISTS (SELECT 1 FROM employee WHERE user_id = u.id);

INSERT INTO employee (user_id, position, department, employment_id, role)
SELECT u.id, 'Analyst', 'Finance', e.id, 'user'
FROM users u, employment e
WHERE u.username = 'user4'
  AND e.start_date = '2024-04-01'
  AND NOT EXISTS (SELECT 1 FROM employee WHERE user_id = u.id);

INSERT INTO employee (user_id, position, department, employment_id, role)
SELECT u.id, 'Tester', 'QA', e.id, 'user'
FROM users u, employment e
WHERE u.username = 'user5'
  AND e.start_date = '2024-05-01'
  AND NOT EXISTS (SELECT 1 FROM employee WHERE user_id = u.id);

INSERT INTO employee (user_id, position, department, employment_id, role)
SELECT u.id, 'Support', 'Customer Service', e.id, 'user'
FROM users u, employment e
WHERE u.username = 'user6'
  AND e.start_date = '2024-06-01'
  AND NOT EXISTS (SELECT 1 FROM employee WHERE user_id = u.id);

-------------------------
-- SCHEDULES (6 записів, по одному на кожного співробітника)
-------------------------
INSERT INTO schedules (employee_id, date, start_time, finish_time)
SELECT e.id, '2024-07-10', '09:00', '17:00'
FROM employee e
WHERE e.id = 1
  AND NOT EXISTS (
    SELECT 1 FROM schedules WHERE employee_id = e.id AND date = '2024-07-10'
);

INSERT INTO schedules (employee_id, date, start_time, finish_time)
SELECT e.id, '2024-07-11', '10:00', '18:00'
FROM employee e
WHERE e.id = 2
  AND NOT EXISTS (
    SELECT 1 FROM schedules WHERE employee_id = e.id AND date = '2024-07-11'
);

INSERT INTO schedules (employee_id, date, start_time, finish_time)
SELECT e.id, '2024-07-12', '08:30', '16:30'
FROM employee e
WHERE e.id = 3
  AND NOT EXISTS (
    SELECT 1 FROM schedules WHERE employee_id = e.id AND date = '2024-07-12'
);

INSERT INTO schedules (employee_id, date, start_time, finish_time)
SELECT e.id, '2024-07-13', '09:15', '17:15'
FROM employee e
WHERE e.id = 4
  AND NOT EXISTS (
    SELECT 1 FROM schedules WHERE employee_id = e.id AND date = '2024-07-13'
);

INSERT INTO schedules (employee_id, date, start_time, finish_time)
SELECT e.id, '2024-07-14', '09:30', '17:30'
FROM employee e
WHERE e.id = 5
  AND NOT EXISTS (
    SELECT 1 FROM schedules WHERE employee_id = e.id AND date = '2024-07-14'
);

INSERT INTO schedules (employee_id, date, start_time, finish_time)
SELECT e.id, '2024-07-15', '10:00', '18:00'
FROM employee e
WHERE e.id = 6
  AND NOT EXISTS (
    SELECT 1 FROM schedules WHERE employee_id = e.id AND date = '2024-07-15'
);

-------------------------
-- PAYMENT_DETAILS (6 записів)
-------------------------
INSERT INTO payment_details (recipient_name, card_number, gross_amount)
SELECT 'User One', '1111222233334444', 3000.00
    WHERE NOT EXISTS (
    SELECT 1 FROM payment_details WHERE card_number = '1111222233334444'
);

INSERT INTO payment_details (recipient_name, card_number, gross_amount)
SELECT 'User Two', '2222333344445555', 3200.00
    WHERE NOT EXISTS (
    SELECT 1 FROM payment_details WHERE card_number = '2222333344445555'
);

INSERT INTO payment_details (recipient_name, card_number, gross_amount)
SELECT 'User Three', '3333444455556666', 3500.00
    WHERE NOT EXISTS (
    SELECT 1 FROM payment_details WHERE card_number = '3333444455556666'
);

INSERT INTO payment_details (recipient_name, card_number, gross_amount)
SELECT 'User Four', '4444555566667777', 2800.00
    WHERE NOT EXISTS (
    SELECT 1 FROM payment_details WHERE card_number = '4444555566667777'
);

INSERT INTO payment_details (recipient_name, card_number, gross_amount)
SELECT 'User Five', '5555666677778888', 3100.00
    WHERE NOT EXISTS (
    SELECT 1 FROM payment_details WHERE card_number = '5555666677778888'
);

INSERT INTO payment_details (recipient_name, card_number, gross_amount)
SELECT 'User Six', '6666777788889999', 3300.00
    WHERE NOT EXISTS (
    SELECT 1 FROM payment_details WHERE card_number = '6666777788889999'
);

-------------------------
-- SALARIES (6 записів) — пов’язуємо співробітників з їх реквізитами для оплати
-------------------------
INSERT INTO salaries (employee_id, gross_amount, payment_details_id, payout_date, type, last_withdrawal_status)
SELECT e.id, 3000.00, pd.id, '2024-07-01', 'monthly', 'paid'
FROM employee e
         JOIN payment_details pd ON pd.card_number = '1111222233334444'
WHERE e.id = 1
  AND NOT EXISTS (
    SELECT 1 FROM salaries WHERE employee_id = e.id AND payout_date = '2024-07-01'
);

INSERT INTO salaries (employee_id, gross_amount, payment_details_id, payout_date, type, last_withdrawal_status)
SELECT e.id, 3200.00, pd.id, '2024-07-01', 'monthly', 'paid'
FROM employee e
         JOIN payment_details pd ON pd.card_number = '2222333344445555'
WHERE e.id = 2
  AND NOT EXISTS (
    SELECT 1 FROM salaries WHERE employee_id = e.id AND payout_date = '2024-07-01'
);

INSERT INTO salaries (employee_id, gross_amount, payment_details_id, payout_date, type, last_withdrawal_status)
SELECT e.id, 3500.00, pd.id, '2024-07-01', 'monthly', 'paid'
FROM employee e
         JOIN payment_details pd ON pd.card_number = '3333444455556666'
WHERE e.id = 3
  AND NOT EXISTS (
    SELECT 1 FROM salaries WHERE employee_id = e.id AND payout_date = '2024-07-01'
);

INSERT INTO salaries (employee_id, gross_amount, payment_details_id, payout_date, type, last_withdrawal_status)
SELECT e.id, 2800.00, pd.id, '2024-07-01', 'monthly', 'paid'
FROM employee e
         JOIN payment_details pd ON pd.card_number = '4444555566667777'
WHERE e.id = 4
  AND NOT EXISTS (
    SELECT 1 FROM salaries WHERE employee_id = e.id AND payout_date = '2024-07-01'
);

INSERT INTO salaries (employee_id, gross_amount, payment_details_id, payout_date, type, last_withdrawal_status)
SELECT e.id, 3100.00, pd.id, '2024-07-01', 'monthly', 'paid'
FROM employee e
         JOIN payment_details pd ON pd.card_number = '5555666677778888'
WHERE e.id = 5
  AND NOT EXISTS (
    SELECT 1 FROM salaries WHERE employee_id = e.id AND payout_date = '2024-07-01'
);

INSERT INTO salaries (employee_id, gross_amount, payment_details_id, payout_date, type, last_withdrawal_status)
SELECT e.id, 3300.00, pd.id, '2024-07-01', 'monthly', 'paid'
FROM employee e
         JOIN payment_details pd ON pd.card_number = '6666777788889999'
WHERE e.id = 6
  AND NOT EXISTS (
    SELECT 1 FROM salaries WHERE employee_id = e.id AND payout_date = '2024-07-01'
);
