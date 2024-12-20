const mongoose = require("mongoose");
const { Schema } = mongoose;

const uploadPostSchema = new Schema({
    title: {
        type: String,
        required: true,
    },
    content: {
        type: String,
        required: true
    },
    community: {
        type: Schema.Types.ObjectId,
        ref: "Community",
        required: true,
    },
    image: {
        url: String,
        filename: String,
    },
});

module.exports = mongoose.model("UploadPost", uploadPostSchema);
