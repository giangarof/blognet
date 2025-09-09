import pkg from "pg";
const { Pool } = pkg;

// const pool = new Pool({
//   user: "postgres",        // your PostgreSQL username
//   host: "host.docker.internal",      // DB host
//   database: "blognet",    // DB name
//   password: "1234",       // DB password
//   port: 5433,             // DB port
// });

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: Number(process.env.DB_PORT),
  ssl: { rejectUnauthorized: false }, // required for Render PostgreSQL
});

export default pool;