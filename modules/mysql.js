let mysql   = require("mysql");

let con     = mysql.createConnection({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE
});

con.connect(err => {
    if (err) throw err;

    con.query("SELECT * FROM notes", (err, result) => {
        if (err) throw err;

        console.log(result[2].cookie_id);
    });
});