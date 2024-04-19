const { Client } = require('pg');
const { parseConnectionString, formatMilliseconds, insertReportFinal } = require('./utils');
const CustomError = require('./customError.js');

async function getQueryData(startTime) {
    let pool;
    const queryData = [];
    const args = process.argv.slice(2);

    // Query with DOUBLE
    // const sql = 'SELECT * FROM ec JOIN users u ON u.user_id = ec.user_id WHERE "DatumInputField" = $1 AND u.user_id = $2 AND ec.user_id = $2';

    // Query with INT
    // const sql = 'SELECT * FROM ec_error_int JOIN users u ON u.user_id = ec_error_int.user_id WHERE "DatumInputField" = $1 AND u.user_id = $2 AND ec_error_int.user_id = $2';

    // Query with TEXT
    const sql = 'SELECT * FROM ec_error_text JOIN users u ON u.user_id = ec_error_text.user_id WHERE "DatumInputField" = $1 AND u.user_id = $2 AND ec_error_text.user_id = $2';

    // Query with NULL
    // const sql = 'SELECT * FROM ec_error_null JOIN users u ON u.user_id = ec_error_null.user_id WHERE "DatumInputField" = $1 AND u.user_id = $2 AND ec_error_null.user_id = $2';

    try {
        pool = new Client(parseConnectionString(args[2], startTime));
        await pool.connect();

        const result = await pool.query(sql, [args[1], args[0]]);

        if (result.rows.length === 0) {
            const customError = new CustomError('Data not found for the specific query', 0x1);
            const elapsedMilliseconds = Date.now() - startTime;
            const elapsedTimeString = formatMilliseconds(elapsedMilliseconds);

            await insertReportFinal(
                args[0],
                -2,
                'Puppeteer',
                'failure',
                'Data not found for USER_ID: ' + args[0] + ' && REPORT_DATE: ' + args[1],
                elapsedTimeString
            );

            customError.exitProcess();
        }

        result.rows.forEach(row => {
            const item = {};

            Object.entries(row).forEach(([key, value]) => {
                if (typeof value === 'number') {
                    value = Math.round(value, 2);
                } else if (value instanceof Date) {
                    const [year, month, day] = value.toISOString().substring(0, 10).split('-');
                    value = (parseInt(day) + 1) + '.' + month + '.' + year;                
                }
                item[key] = value;
            });
            queryData.push(item);
        });
        return queryData;
    } catch (error) {
        console.error("Data DB Error Connection: " + error);
        process.exit(0x1);
    } finally {
        await pool.end();
    }
}

module.exports = getQueryData;