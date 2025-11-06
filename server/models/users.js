import { Schema, model } from "mongoose";

const userSchema = new Schema({
    userType: {
        type: String,
        required: true,
        enum: ["admin", "user"],
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        match: [/.+@.+\..+/, "Please enter a valid email"]
    },
    password: {
        type: String,
        required: true,
        minlength: 6,
    },
    fullName: {
        type: String,
        required: true,
        trim: true,
    },
    address: {
        type: String,
        required: true,
        trim: true,
    },
    phone: {
        type: String,
        required: true,
        match: [/^09\d{9}$/, "Phone number must start with 09 and be 11 digits"],
    },
    profilePicture: {
        type: String,
        default: "/assets/default-avatar.svg",
    },
});

const User = model("User", userSchema);
export default User;