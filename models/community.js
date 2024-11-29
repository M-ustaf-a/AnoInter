const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const communitySchema = new Schema({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    thumbnail: {
        url: String,
        filename: String,
    },
    admin: {
       type: String,
       required: true,
    }
});

const community = mongoose.model("community", communitySchema);
module.exports = community;