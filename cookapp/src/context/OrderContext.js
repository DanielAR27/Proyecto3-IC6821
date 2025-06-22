import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const OrderContext = createContext();

export const OrderProvider = ({ children }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🆕 Cargar pedidos desde AsyncStorage al inicializar
  useEffect(() => {
    loadOrdersFromStorage();
  }, []);

  // 🆕 Guardar pedidos en AsyncStorage cuando cambien
  useEffect(() => {
    if (!loading) {
      saveOrdersToStorage(orders);
    }
  }, [orders, loading]);

  const loadOrdersFromStorage = async () => {
    try {
      const ordersData = await AsyncStorage.getItem("@orders");
      if (ordersData) {
        const parsedOrders = JSON.parse(ordersData);
        console.log("📂 Loaded orders from storage:", parsedOrders.length);
        setOrders(parsedOrders);
      } else {
        console.log("📂 No orders found in storage");
        setOrders([]);
      }
    } catch (error) {
      console.error("❌ Error loading orders:", error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const saveOrdersToStorage = async (ordersToSave) => {
    try {
      await AsyncStorage.setItem("@orders", JSON.stringify(ordersToSave));
      console.log("💾 Orders saved to storage:", ordersToSave.length);
    } catch (error) {
      console.error("❌ Error saving orders:", error);
    }
  };

  const addOrder = (orderData) => {
    const newOrder = {
      id: `order_${Date.now()}`,
      ...orderData,
      orderDate: new Date().toISOString(),
      status: "pending",
    };

    console.log("✅ Adding new order:", newOrder.id);
    setOrders((prevOrders) => [newOrder, ...prevOrders]);
    return newOrder.id;
  };

  const updateOrderStatus = (orderId, newStatus) => {
    console.log(`🔄 Updating order ${orderId} to status: ${newStatus}`);
    setOrders((prevOrders) =>
      prevOrders.map((order) =>
        order.id === orderId
          ? { ...order, status: newStatus, updatedAt: new Date().toISOString() }
          : order
      )
    );
  };

  const getOrderById = (orderId) => {
    return orders.find((order) => order.id === orderId);
  };

  const getStatusText = (status) => {
    const statusMap = {
      pending: "Pendiente",
      confirmed: "Confirmado",
      preparing: "En Preparación",
      ready: "Listo",
      delivered: "Entregado",
      cancelled: "Cancelado",
    };
    return statusMap[status] || "Desconocido";
  };

  const getStatusColor = (status, theme) => {
    const colorMap = {
      pending: "#f59e0b",
      confirmed: "#3b82f6",
      preparing: "#f59e0b",
      ready: "#10b981",
      delivered: "#10b981",
      cancelled: "#ef4444",
    };
    return colorMap[status] || "#6b7280";
  };

  const clearAllOrders = async () => {
    try {
      await AsyncStorage.removeItem("@orders");
      setOrders([]);
      console.log("🗑️ All orders cleared");
    } catch (error) {
      console.error("❌ Error clearing orders:", error);
    }
  };

  return (
    <OrderContext.Provider
      value={{
        orders,
        loading,
        addOrder,
        updateOrderStatus,
        getStatusText,
        getStatusColor,
        getOrderById,
        clearAllOrders,
      }}
    >
      {children}
    </OrderContext.Provider>
  );
};

export const useOrders = () => {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error("useOrders must be used within an OrderProvider");
  }
  return context;
};
