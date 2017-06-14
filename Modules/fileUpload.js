/**
 * Created by sanjib on 14/6/17.
 */

"use strict";

let http    = require("http");
let form    = require("formidable");
let fs      = require("fs");

http.createServer(function (req, res) {
    if (req.url == '/fileupload') {
        let input   = new form.IncomingForm();

        input.parse(req, function (err, fields, files) {
            fs.rename(files.file.path, "./" + files.file.name, function (err) {
                if (err) throw err;

                res.writeHead(200, {'Content-Type': 'text/html'});
                res.write('File Uploaded');
                res.end();
            });
        });
    } else {
        fs.readFile("new.html", function (err, data) {
            res.writeHead(200, {'Content-Type': 'text/html'});
            res.write(data);
            res.end();
        });
    }
}).listen(8080);