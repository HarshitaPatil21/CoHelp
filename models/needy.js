const mongoose = require("mongoose");
const needySchema = new mongoose.Schema({
    address:
    {
        type: String,
        required: true
    },
    number:
    {
        type: String
    },
    elocate:
    {
        type: String,
        required: true
    },
    district:
    {
        type: String,
        required: true
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }
});
module.exports = mongoose.model("needy", needySchema);