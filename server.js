"use strict";

let express = require("express");

// initialize the express framework
let app = express();

// assets
app.use(express.static("public"));

app.get("/", function (req, res) {
    res.send("Helo there get");
});

app.post("/", function (req, res) {
    res.send("Helo there post");
});

app.get("/test", function (req, res) {
    res.send("Helo there get test");
});

app.get("/test/*", function (req, res) {
    res.send("Helo there get test with pattern * " + req.url);
});

app.delete("/test/*", function (req, res) {
    res.send("Helo there delete test with pattern * " + req.url);
});


// server setup.
let server  = app.listen(8080, function () {
    let host    = server.address().address;
    let port    = server.address().port;

    console.log("Server running at : http://%s:%s", host, port);
});