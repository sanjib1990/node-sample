/**
 * Created by sanjibdevnath on 15/6/17.
 */

let buf = new Buffer(26);

for (let i = 0; i < 26; i++) {
    buf[i]  = i + 97;
}

console.log(Buffer.byteLength(buf));