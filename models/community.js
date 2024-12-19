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

const Community = mongoose.model("Community", communitySchema);
module.exports = Community;