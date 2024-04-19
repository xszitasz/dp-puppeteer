const { Client } = require('pg');
const CustomError = require('./customError.js');

function parseConnectionString(connectionStr) {
    const pairs = connectionStr.split(';');
    const parsed = {};

    pairs.forEach(pair => {
        const [key, value] = pair.split('=');
        parsed[key.trim()] = value.trim();
    });
    return parsed;
}

function formatMilliseconds(ms) {
    const minutes = Math.floor(ms / 60000);
    const seconds = ((ms % 60000) / 1000).toFixed(3);
    return `minutes: ${minutes} seconds: ${seconds}`;
}

async function insertReportFinal(userId, consId, techType, flag, reportMsg, testTime) {
    let insertDbErrorCount = 2;

    const args = process.argv.slice(2);
    const client = new Client(parseConnectionString(args[2]));
    const insertQuery = 'INSERT INTO logs (user_id, cons_id, tech_type, flag, report_msg, test_time) VALUES ($1, $2, $3, $4, $5, $6)';
    const values = [userId, consId, techType, flag, reportMsg, testTime];

    while(insertDbErrorCount > 0) {
      try {
        await client.connect()
        await client.query(insertQuery, values);
        break;
      } catch(err) {
        console.error("Error-DB: " + err);
        insertDbErrorCount--;
      } finally {
        if (client) {
          console.log("Report inserted");
          await client.end();
        }
      }
    }

    if(insertDbErrorCount === 0){
      const customError = new CustomError('Report insert error', 0x1);
      customError.exitProcess();
    }
}

module.exports = {
    parseConnectionString,
    formatMilliseconds,
    insertReportFinal: insertReportFinal
};
  