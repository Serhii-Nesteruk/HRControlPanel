export interface User {
    id: number;
    username: string;
    email: string;
    pass: string;
}

export interface Employment {
    id: number;
    start_date: string;    // YYYY-MM-DD
    finish_date: string;   // YYYY-MM-DD
    status: string;
}

export interface Employee {
    id: number;
    user_id: number;
    position: string;
    department: string;
    employment_id: number;
    role: string;
}

export interface Schedule {
    id: number;
    employee_id: number;
    date: string;        // YYYY-MM-DD
    start_time: string;  // HH:MM:SS
    finish_time: string; // HH:MM:SS
}

export interface PaymentDetails {
    id: number;
    recipient_name: string;
    card_number: string;
    gross_amount: number;
}

export interface Salary {
    id: number;
    employee_id: number;
    gross_amount: number;
    payment_details_id: number;
    payout_date: string;         // YYYY-MM-DD
    type: string;
    last_withdrawal_status: string;
}
