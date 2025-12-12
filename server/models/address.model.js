import mongoose from "mongoose";

const addressSchema = new mongoose.Schema({
    city : {
        type : String,
        default : ""
    },
    department : {
        type : String,
        default : ""
    },
    address_detail : {
        type: String,
        default : ""
    },
    additional_information : {
        type: String
    }, 
    neighborhood : {
        type: String
    },
    mobile : {
        type: Number,
        default: null
    },
    status : {
        type: Boolean,
        default : true
    },
    userId : {
        type : mongoose.Schema.ObjectId,
        default : ""
    }
},{
    timestamps : true
})

const AddressModel = mongoose.model('address', addressSchema)

export default AddressModel