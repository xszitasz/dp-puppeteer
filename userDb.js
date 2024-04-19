const { Client } = require('pg');
const { parseConnectionString, insertReportFinal } = require('./utils');

async function getUsers(startTime) {
  let pool;
  const args = process.argv.slice(2);

  try {
    pool = new Client(parseConnectionString(args[2], startTime));
    await pool.connect();
    const res = await pool.query(`SELECT user_name, pwd FROM users WHERE user_id = ${args[0]}`);
    return res.rows;
  } catch (error) {
    await insertReportFinal(args[0], -2, 'Puppeteer', 'failure', "User DB Error Connection: " + error);
    process.exit(0x1);
  } finally {
    if (pool) {
      await pool.end();
    }
  }
}

module.exports = getUsers;
