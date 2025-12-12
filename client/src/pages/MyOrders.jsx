import React, { useState } from "react";
import { useSelector } from "react-redux";
import NoData from "../components/NoData";
import SummaryApi from "../common/SummaryApi";
import toast from "react-hot-toast";
import Axios from "../utils/Axios";
import { useGlobalContext } from "../provider/GlobalProvider";
import { DisplayPriceInPesos } from "../utils/DisplayPriceInPesos";

const allowedStatus = [
  "Pendiente",
  "Procesando",
  "Enviado",
  "En tránsito",
  "Entregado",
];

const statusColors = {
  Pendiente: "bg-red-500 text-white",
  Procesando: "bg-orange-500 text-white",
  Enviado: "bg-yellow-400 text-black",
  "En tránsito": "bg-blue-500 text-white",
  Entregado: "bg-green-500 text-white",
};

const MyOrders = () => {
  const { fetchOrder } = useGlobalContext();
  const orders = useSelector((state) => state.orders.order);
  const user = useSelector((state) => state.user);

  const [openOrderId, setOpenOrderId] = useState(null);

  const toggleOrder = (id) => {
    setOpenOrderId((prev) => (prev === id ? null : id));
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      const response = await Axios({
        ...SummaryApi.update_order_status,
        data: { orderId, status: newStatus },
      });

      if (response.data.success) {
        toast.success("Estado actualizado");
        if (fetchOrder) {
          fetchOrder();
        }
      }
    } catch (err) {
      toast.error("No se pudo actualizar el estado");
    }
  };

  return (
    <div>
      <div className="bg-white shadow-md p-3 font-semibold ">
        <h1>Mis Órdenes</h1>
      </div>

      {!orders || orders.length === 0 ? (
        <NoData />
      ) : (
        orders.map((order, index) => {
          console.log(order)
          // Validar que existan productos
          const firstProduct =
            order?.products && order.products.length > 0
              ? order.products[0]
              : null;

          const firstImage =
            firstProduct?.product_details?.image &&
            firstProduct.product_details.image.length > 0
              ? firstProduct.product_details.image[0]
              : "/no-image.png"; // imagen de respaldo

          return (
            <div>
              <div key={order._id || index} className="border p-3 mb-3 rounded">
                {/* Header → Imagen + info izquierda | Estado derecha */}
                <div className="flex items-center justify-between">
                  {/* IZQUIERDA → clickeable */}
                  <div
                    className="flex items-center gap-3 cursor-pointer"
                    onClick={() => toggleOrder(order._id)}
                  >
                    <img
                      src={firstImage}
                      alt="Producto"
                      className="w-14 h-14 rounded border object-cover"
                    />

                    <div>
                      <p className="font-medium">N° Pedido: {order.orderId}</p>
                      <p className="text-sm text-gray-600">
                        {order?.products?.length || 0} productos
                      </p>
                    </div>
                  </div>

                  {/* DERECHA → Estado */}
                  <div className="ml-4 flex items-center gap-2">
                    <span className="font-semibold">Estado:</span>

                    {user.role === "ADMIN" ? (
                      <select
                        className={`border p-1 rounded-full text-sm font-semibold ${
                          statusColors[order.status]
                        }`}
                        value={order.status}
                        onChange={(e) =>
                          handleStatusUpdate(order._id, e.target.value)
                        }
                        onClick={(e) => e.stopPropagation()} // 👈 evita abrir/cerrar
                      >
                        {allowedStatus.map((st) => (
                          <option
                            key={st}
                            value={st}
                            className="text-black bg-white"
                          >
                            {st}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <span
                        className={`font-semibold px-3 py-1 rounded-full ${
                          statusColors[order.status]
                        }`}
                      >
                        {order.status}
                      </span>
                    )}
                  </div>
                </div>

                {/* Panel expandido */}
                {openOrderId === order._id && (
                  <div className="mt-3 bg-gray-50 p-3 rounded border">
                    <h3 className="font-semibold mb-3">Productos del pedido</h3>

                    {!order.products || order.products.length === 0 ? (
                      <p className="text-sm text-gray-500">
                        No hay productos registrados en este pedido.
                      </p>
                    ) : (
                      <div className="space-y-3">
                        {order.products.map((prod, idx) => {
                          const prodImage =
                            prod?.product_details?.image &&
                            prod.product_details.image.length > 0
                              ? prod.product_details.image[0]
                              : "/no-image.png";

                          return (
                            <div
                              key={idx}
                              className="flex items-center gap-3 border p-2 bg-white rounded"
                            >
                              <img
                                src={prodImage}
                                alt=""
                                className="w-14 h-14 rounded border object-cover"
                              />
                              <div>
                                <p className="font-medium">
                                  {prod.product_details?.name}
                                </p>
                                <p className="text-sm text-gray-600">
                                  Cantidad: {prod.quantity}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    <div className="mt-4 pt-2 border-t">
                      <p>
                        <strong>Total:</strong> {DisplayPriceInPesos(order.totalAmt)} 
                      </p>
                      <p>
                        <strong>Tipo de pago:</strong> {order.payment_status}
                      </p>
                    </div>
                  </div>
                )}
              </div>
              <div></div>
            </div>
          );
        })
      )}
    </div>
  );
};

export default MyOrders;
