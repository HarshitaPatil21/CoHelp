const mongoose = require("mongoose");
const passportLocaleMongoose = require("passport-local-mongoose");
const Schema = mongoose.Schema;
const UserSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true
    }
});
UserSchema.plugin(passportLocaleMongoose);
module.exports = mongoose.model("User", UserSchema);