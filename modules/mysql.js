let mysql   = require("mysql");

let con     = mysql.createConnection({
    host: "127.0.0.1",
    user: "root",
    password: "Monjit@1990",
    database: "capillary"
});

con.connect(function (err) {
    if (err) throw err;

    con.query("SELECT * FROM notes", function (err, result) {
        if (err) throw err;

        console.log(result[2].cookie_id);
    });
});