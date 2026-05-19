const sql = require('mssql');

const config = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_HOST,
    database: process.env.DB_NAME,
    port: parseInt(process.env.DB_PORT),
    pool: {
        max: 10,
        min: 0,
        idleTimeoutMillis: 30000
    },
    options: {
        encrypt: true,
        trustServerCertificate: true
    }
}

// buat koneksi pool asynchronous
const poolPromise = new sql.ConnectionPool(config)
    .connect()
    .then(pool => {
        console.log('Connected to MSSQL');
        return pool;
    })
    .catch(
        err => { 
            console.log(
            'Database Connection Failed! Bad Config: ', 
            err)
            // Uncaught Fatal Exception
            process.exit(1)
        }
    );

// ekspor sql dan poolPromise agar bisa digunakan di file lain
module.exports = {
    sql, poolPromise
}