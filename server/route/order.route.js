import { Router } from 'express'
import auth from '../middleware/auth.js'
import { CashOnDeliveryOrderController, getOrderDetailsController, paymentController, updateOrderStatusController, webhookStripe } from '../controllers/order.controller.js'
import { admin } from '../middleware/Admin.js'
import express from "express";
const orderRouter = Router()

orderRouter.post("/cash-on-delivery",auth,CashOnDeliveryOrderController)
orderRouter.post('/checkout',auth,paymentController)
orderRouter.get("/order-list",auth,getOrderDetailsController)
orderRouter.put("/status",auth,admin,updateOrderStatusController);

export default orderRouter