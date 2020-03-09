const mysql = require('mysql');

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'sterek12',
    database: 'employee_tracker_db'
});

connection.connect(function (error) {
    if (error) {
        console.log('error connecting')
    } else {
        console.log('connected')
    }
})

module.exports = connection;