let express     = require('express');
let bodyParser  = require('body-parser');
let multer      = require('multer');
let fs          = require("fs");

let app     = express();
let upload  = multer({ dest: __dirname + "/public/uploads/" });

app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: false }));

// Routes
app.get('/upload', function (req, res) {
    res.sendFile( __dirname + "/views/upload.html" );
});

app.post('/upload', upload.single('file'), function (req, res) {
    console.log(req.file.originalname);
    console.log(req.file.path);
    console.log(req.file.mimetype);
    let file = __dirname + "/public/img/" + req.file.originalname;

    fs.readFile( req.file.path, function (err, data) {
        fs.writeFile(file, data, function (err) {
            if ( err ) {
                console.log( err );
                return  res.end( JSON.stringify({error: "Something went wrong"}));
            }

            let response = {
                message:'File uploaded successfully',
                filename:req.file.originalname
            };
            console.log( response );
            res.end( JSON.stringify( response ) );
        });
    });
});


// Server
let server = app.listen(8080, function () {
    let host = server.address().address;
    let port = server.address().port;

    console.log("listening at http://%s:%s", host, port);
});