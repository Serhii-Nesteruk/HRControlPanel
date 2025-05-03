import dotenv  from "dotenv";
dotenv.config();

export const JWT_SECRET: string = process.env.JWT_SECRET!;
export const PORT       = parseInt(process.env.PORT  ?? '5000', 10);
export const DB_USER      = process.env.DB_USERNAME!;
export const DB_PASS: string     = process.env.DB_PASS!;