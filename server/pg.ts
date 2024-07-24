import pg, { types } from 'pg'
import dotenv from 'dotenv'

dotenv.config()

const { Pool } = pg

const TIMESTAMPTZ_OID = 1114;

// Override the default parsing for timestamps
// This is to return raw value when querying timestamp value from db without timezone affected
types.setTypeParser(TIMESTAMPTZ_OID, (stringValue) => {
  return new Date(stringValue + 'Z'); // Append 'Z' to treat as UTC
})

const pool = new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PWD,
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT ?? 5432),
  database: process.env.DB_NAME,
})

export default pool
