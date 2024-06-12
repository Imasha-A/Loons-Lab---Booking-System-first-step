const mongoose = require("mongoose");
const connect = mongoose.connect("mongodb://localhost:27017/Login-Credentials");

connect.then(()=>{
    console.log("Database connection successful ");
})
.catch(()=>{
    console.log("Database connection error ");
})

const UserSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    mobileNumber: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    picture: {
        type: String,
        required: true
    },
});

const User = new mongoose.model("users", UserSchema);
module.exports = User;