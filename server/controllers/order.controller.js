import Stripe from "../config/stripe.js";
import OrderModel from "../models/order.model.js";
import CartProductModel from "../models/cartproduct.model.js";
import UserModel from "../models/user.model.js";
import mongoose from "mongoose";

 export async function CashOnDeliveryOrderController(request,response){
    try {
        const userId = request.userId // auth middleware 
        const { list_items, totalAmt, addressId,subTotalAmt } = request.body
        
        const orderId = `ORD-${new mongoose.Types.ObjectId()}`;

        const products = list_items.map(el => ({
        productId: el.productId._id,
        quantity: el.quantity,
        product_details: {
            name: el.productId.name,
            image: el.productId.image
        }
        }));

        const order = await OrderModel.create({
        userId,
        orderId,
        products,
        totalAmt,
        subTotalAmt,
        payment_status: "CONTRAENTREGA",
        paymentId: "",
        delivery_address: addressId
        });

        await CartProductModel.deleteMany({ userId });
        await UserModel.updateOne({ _id: userId }, { shopping_cart: [] });

        return response.json({
        message: "¡Pedido realizado con éxito!",
        success: true,
        data: order
        });

    } catch (error) {
        return response.status(500).json({
            message : error.message || error ,
            error : true,
            success : false
        })
    }
}

export async function paymentController(request,response){
    try {
        const userId = request.userId // auth middleware 
        const { list_items, totalAmt, addressId,subTotalAmt } = request.body 

        const user = await UserModel.findById(userId)

        const line_items  = list_items.map(item =>{
            return{
               price_data : {
                    currency : 'cop',
                    product_data : {
                        name : item.productId.name,
                        images : item.productId.image,
                        metadata : {
                            productId : item.productId._id
                        }
                    },
                    unit_amount : item.productId.price * 100
               },
               adjustable_quantity : {
                    enabled : true,
                    minimum : 1
               },
               quantity : item.quantity 
            }
        })

        const params = {
            submit_type : 'pay',
            mode : 'payment',
            payment_method_types : ['card'],
            customer_email : user.email,
            metadata : {
                userId : userId,
                addressId : addressId
            },
            line_items : line_items,
            success_url : `${process.env.FRONTEND_URL}/success`,
            cancel_url : `${process.env.FRONTEND_URL}/cancel`
        }

        const session = await Stripe.checkout.sessions.create(params)

        return response.status(200).json({ url: session.url })

    } catch (error) {
        return response.status(500).json({
            message : error.message || error,
            error : true,
            success : false
        })
    }
}

const getOrderProductItems = async({ lineItems }) => {
  const products = [];

  for (const item of lineItems.data) {
    const product = await Stripe.products.retrieve(item.price.product);

    products.push({
      productId: product.metadata.productId,
      quantity: item.quantity,
      product_details: {
        name: product.name,
        image: product.images
      }
    });
  }

  return products;
}

export async function webhookStripe(request, response) {
  const sig = request.headers['stripe-signature'];

  let event;

  try {

    event = Stripe.webhooks.constructEvent(
      request.body,
      sig,
      process.env.STRIPE_ENPOINT_WEBHOOK_SECRET_KEY
    );
  } catch (err) {
    console.error(' Webhook signature verification failed:', err.message);
    return response.status(400).send(`Webhook Error: ${err.message}`);
  }

  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object;

      const lineItems = await Stripe.checkout.sessions.listLineItems(session.id);
      const products = await getOrderProductItems({ lineItems });

      const orderId = `ORD-${new mongoose.Types.ObjectId()}`;

      await OrderModel.create({
        userId: session.metadata.userId,
        orderId,
        products,
        totalAmt: session.amount_total / 100,
        subTotalAmt: session.amount_subtotal / 100,
        paymentId: session.payment_intent,
        payment_status: "POR TARJETA",
        delivery_address: session.metadata.addressId
      });

      await CartProductModel.deleteMany({ userId: session.metadata.userId });
      await UserModel.updateOne(
        { _id: session.metadata.userId },
        { shopping_cart: [] }
      );

      break;
  }

  response.json({ received: true });
}

export async function getOrderDetailsController(req, res) {
    try {
        const userId = req.userId;
        const user = await UserModel.findById(userId);

        let orderlist = [];

        if (user.role === "ADMIN") {
            orderlist = await OrderModel.find()
                .sort({ createdAt: -1 })
                .populate("delivery_address")
                .populate("userId", "name email");
        } 
        else {
            orderlist = await OrderModel.find({ userId })
                .sort({ createdAt: -1 })
                .populate("delivery_address");
        }

        return res.json({
            message: "Lista de pedidos",
            data: orderlist,
            error: false,
            success: true
        });

    } catch (error) {
        return res.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        });
    }
}

export async function updateOrderStatusController(req, res) {
    try {
        const { orderId, status } = req.body;

        const allowedStatus = ["Pendiente", "Procesando", "Enviado", "En tránsito", "Entregado"];
        if (!allowedStatus.includes(status)) {
            return res.status(400).json({
                message: "Estado no válido",
                error: true
            });
        }

        const updated = await OrderModel.findByIdAndUpdate(
            orderId,
            { status },
            { new: true }
        );

        return res.json({
            message: "Estado actualizado",
            success: true,
            error : false,
            data: updated
        });

    } catch (error) {
        return res.status(500).json({
            message: error.message || error,
            error : true,
            success: false
        });
    }
}

