let mongo   = require("mongodb");
let url     = `mongodb://${process.env.MONGO_HOST}:${process.env.MONGO_PORT}/${process.env.MONGO_DATABASE}`;

mongo.connect(url, (err, db) => {
    if (err) throw err;

    console.log("Database Created");

    db.collection("users").insertMany([
        { name: 'John', address: 'Highway 71'},
        { name: 'Peter', address: 'Lowstreet 4'}
    ], (err, res) => {
        if (err) throw err;

        console.log(res);
        console.log("created : " + res.insertedCount);
        db.close();
    });

    db.collection("users").findOne({}, (err, res) => {
        console.log(res.name);
        db.close();
    });

    db.collection("users").find({}).toArray((err, res) => {
        if (err) throw err;

        console.log(res);
    })
});