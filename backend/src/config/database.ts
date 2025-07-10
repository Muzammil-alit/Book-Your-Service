import sql from 'mssql';
import dotenv from 'dotenv';

dotenv.config();

const connectionString = process.env.MSSQL_DB_URL

let pool: sql.ConnectionPool | null = null;

export const connectDB = async () => {
  try {
    pool = await sql.connect(connectionString);
    console.log("✅ Connected to SQL Server");
    return pool;
  } catch (error) {
    console.error("❌ Connection failed:", error);
    throw error;
  }
}