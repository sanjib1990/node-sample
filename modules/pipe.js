/**
 * Created by sanjibdevnath on 15/6/17.
 */
let fs = require("fs");
let zlib    = require("zlib");

fs
    .createReadStream(__dirname + "/views/upload.html")
    .pipe(zlib.createGzip())
    .pipe(fs.createWriteStream("input.txt.gz"));

console.log("file Compressed as input.txt.gz");

fs
    .createReadStream("input.txt.gz")
    .pipe(zlib.createGunzip())
    .pipe(fs.createWriteStream("input.txt"));

console.log("file decompressed");