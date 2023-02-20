import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    refresh_tokens: {
        type: [String],
    },
    image: {
        type: String,
        required: true,
    },
    fullName: {
        type: String,
        required: true,
    },
});

export = mongoose.model("User", userSchema);
