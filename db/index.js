// Database connection parameters:
// UPDATE THESE YOURSELF
const config = {
    host: '128.199.75.94',
    port: 5432,
    database: 'cs2102',
    user: 'webapp',
    password: 'sonTerK@r'
};

// Load and initialize pg-promise:
const pgp = require('pg-promise')();

// Create the database instance:
const db = pgp(config);

db.connect()
    .then(obj => {
        obj.done(); // success, release the connection;
    })
    .catch(error => {
        console.log('ERROR:', error.message || error);
    });