require("dotenv").config();
const { Pool } = require("pg");

const pool = new Pool({
  host: process.env.PG_HOST,
  user: process.env.PG_USER,
  password: process.env.PG_PASSWORD,
  database: process.env.PG_DB,
  port: process.env.PG_PORT,
  ssl: {
    rejectUnauthorized: false   // 🔥 REQUIRED for AWS RDS
  }
});

async function saveMessage(username, message) {
  await pool.query(
    "INSERT INTO messages (username, message) VALUES ($1, $2)",
    [username, message]
  );
}

async function getMessages() {
  const result = await pool.query(
    "SELECT username, message, created_at FROM messages ORDER BY created_at ASC"
  );
  return result.rows;
}

module.exports = { saveMessage, getMessages };
