/**
 * Created by sanjib on 14/6/17.
 */

"use strict";

let http    = require("http");
let mailer  = require("nodemailer");

http.createServer((req, res) => {
    let transporter = mailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
            user: 'devnath.sanjib@gmail.com',
            pass: 'vobinqijeuqozqnq'
        }
    });

    let mailOptions = {
        from: "devnath.sanjib@gmail.com",
        to: "devnath.sanjib@gmail.com",
        subject: "test",
        text: "Hey there"
    };

    transporter.sendMail(mailOptions, (err, info) => {
        if (err) {
            console.log(err);
        } else {
            console.log("Success : " + info.response);
        }
    });

    res.writeHead(200, {'Content-Type': 'text/html'});
    res.write('File Uploaded');
    res.end();
}).listen(8080);