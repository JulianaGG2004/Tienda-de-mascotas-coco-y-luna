import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required : [true, "El nombre del usuario es obligatorio"]
    },
    email: {
        type: String,
        required : [true, "El correo electronico es obligatorio"],
        unique : true
    },
    password : {
        type: String,
        required : [true, "La contraseña es obligatoria"]
    },
    avatar : {
        type : String,
        default : ""
    },
    mobile : {
        type : Number,
        default: null
    },
    refresh_token :{
        type: String,
        default: ""
    },
    verify_email : {
        type : Boolean,
        default: false
    },
    last_login_date : {
        type : Date,
        default: ""
    },
    status :{
        type: String,
        enum: ["Active","Inactive","Suspended"],
        default: "Active"
    },
    address_details : [
        {
            type: mongoose.Schema.ObjectId,
            ref : 'address'
        }
    ],
    shopping_cart : [
        {
            type: mongoose.Schema.ObjectId,
            ref : 'cartProduct'
        }
    ],
    ordenHistory : [
        {
            type: mongoose.Schema.ObjectId,
            ref : 'order'
        }
    ],
    forgot_password_otp :{
        type: String,
        default : null
    },
    forgot_password_expiry : {
        type : Date,
        default: ""
    },
    role : {
        type : String,
        enum : ["ADMIN","USER"],
        default : "USER"
    }
},{
    timmestamps : true
})

const UserModel = mongoose.model("User", userSchema)

export default UserModel