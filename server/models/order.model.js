import mongoose, { Mongoose } from "mongoose";

const orderSchema = new mongoose.Schema({
    userId :{
        type : mongoose.Schema.ObjectId,
        ref : 'User'
    },
    orderId : {
        type: String,
        required : [true, "Ingrese el codigo del pedido"],
        unique : true
    },
    status: {
        type: String,
        enum: [
            "Pendiente",
            "Procesando",
            "Enviado",
            "En tránsito",
            "Entregado"
        ],
        default: "Pendiente"
    },
    products: [
        {
            productId: {
                type: mongoose.Schema.ObjectId,
                ref: "product",
                required: true
            },
            quantity: {
                type: Number,
                required: true,
                default: 1
            },
            product_details: {
                name: String,
                image: Array
            }
        }
    ],
    paymentId : {
        type : String,
        default : ""
    },
    payment_status : {
        type : String,
        default : ""
    },
    delivery_address : {
        type : mongoose.Schema.ObjectId,
        ref : 'address',
        required : [true, "Debe seleccionar una dirección"]
    },
    subTotalAmt : {
        type : Number,
        default : 0
    },
    totalAmt : {
        type : Number,
        default : 0
    },
    invoice_receipt : {
        type : String,
        default : ""
    }
},{
    timestamps : true
})

const OrderModel = mongoose.model('order',orderSchema)

export default OrderModel