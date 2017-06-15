/**
 * Created by sanjibdevnath on 15/6/17.
 */
let mongoose    = require("mongoose");
let Schema      = mongoose.Schema;

let UserSchema  = new Schema({
    name: String,
    address: String
});

module.exports  = mongoose.model("User", UserSchema);