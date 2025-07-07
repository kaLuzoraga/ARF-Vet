import { Schema, model } from "mongoose";

const userSchema = new Schema({
    userType: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    fullName: {
        type: String,
        required: true,
    },
    address:
    {
        type: String,
        required: true,
    },
    phone: {
        type: String,
        required: true,
    },
});

const User = model("User", userSchema);

export default User;