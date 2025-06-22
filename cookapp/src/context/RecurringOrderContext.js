import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const RecurringOrderContext = createContext();

export const useRecurringOrders = () => {
  const context = useContext(RecurringOrderContext);
  if (!context) {
    throw new Error(
      "useRecurringOrders must be used within a RecurringOrderProvider"
    );
  }
  return context;
};

export const RecurringOrderProvider = ({ children }) => {
  const [recurringOrders, setRecurringOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Cargar pedidos recurrentes al inicializar
  useEffect(() => {
    loadRecurringOrders();
  }, []);

  // Función para guardar en AsyncStorage
  const saveRecurringOrders = async (orders) => {
    try {
      await AsyncStorage.setItem("@recurring_orders", JSON.stringify(orders));
      console.log("💾 Recurring orders saved to storage:", orders.length);
    } catch (error) {
      console.error("Error saving recurring orders:", error);
    }
  };

  // Función para cargar pedidos recurrentes
  const loadRecurringOrders = async () => {
    try {
      setLoading(true);
      const savedOrders = await AsyncStorage.getItem("@recurring_orders");
      if (savedOrders) {
        const orders = JSON.parse(savedOrders);
        setRecurringOrders(orders);
        console.log("📂 Loaded recurring orders from storage:", orders.length);
      }
    } catch (error) {
      console.error("Error loading recurring orders:", error);
    } finally {
      setLoading(false);
    }
  };

  // Función para calcular próxima ejecución
  const calculateNextExecution = (config) => {
    const now = new Date();
    const { frequency, hour, minute, days, customDays } = config;

    const nextDate = new Date(now);
    nextDate.setHours(hour, minute, 0, 0);

    switch (frequency) {
      case "daily":
        if (nextDate <= now) {
          nextDate.setDate(nextDate.getDate() + 1);
        }
        break;
      case "weekly":
        // Simplificado: agregar 7 días
        nextDate.setDate(nextDate.getDate() + 7);
        break;
      case "monthly":
        nextDate.setMonth(nextDate.getMonth() + 1);
        break;
      case "custom":
        nextDate.setDate(nextDate.getDate() + (customDays || 7));
        break;
    }

    return nextDate.toISOString();
  };

  // Función para crear pedido recurrente
  const createRecurringOrder = (orderData, recurringConfig) => {
    const newRecurringOrder = {
      id: `recurring_${Date.now()}`,
      ...orderData,
      recurringConfig,
      isActive: true,
      createdAt: new Date().toISOString(),
      executionCount: 0,
      lastExecuted: null,
      nextExecution: calculateNextExecution(recurringConfig),
    };

    const updatedOrders = [...recurringOrders, newRecurringOrder];
    setRecurringOrders(updatedOrders);
    saveRecurringOrders(updatedOrders);

    console.log("🔄 Recurring order created:", newRecurringOrder.id);
    return newRecurringOrder.id;
  };

  // Función para actualizar pedido recurrente
  const updateRecurringOrder = (orderId, updates) => {
    const updatedOrders = recurringOrders.map((order) =>
      order.id === orderId ? { ...order, ...updates } : order
    );
    setRecurringOrders(updatedOrders);
    saveRecurringOrders(updatedOrders);
  };

  // Función para activar/pausar pedido recurrente
  const toggleRecurringOrder = (orderId) => {
    const updatedOrders = recurringOrders.map((order) =>
      order.id === orderId ? { ...order, isActive: !order.isActive } : order
    );
    setRecurringOrders(updatedOrders);
    saveRecurringOrders(updatedOrders);
  };

  // Función para eliminar pedido recurrente
  const deleteRecurringOrder = (orderId) => {
    const updatedOrders = recurringOrders.filter(
      (order) => order.id !== orderId
    );
    setRecurringOrders(updatedOrders);
    saveRecurringOrders(updatedOrders);
  };

  // Función para obtener pedidos próximos
  const getUpcomingOrders = (hoursAhead = 24) => {
    const cutoffTime = new Date();
    cutoffTime.setHours(cutoffTime.getHours() + hoursAhead);

    return recurringOrders.filter(
      (order) =>
        order.isActive &&
        order.nextExecution &&
        new Date(order.nextExecution) <= cutoffTime
    );
  };

  // Función para obtener estadísticas
  const getOrderStats = () => {
    const activeOrders = recurringOrders.filter(
      (order) => order.isActive
    ).length;
    const totalExecutions = recurringOrders.reduce(
      (sum, order) => sum + (order.executionCount || 0),
      0
    );
    const totalSaved = recurringOrders.reduce(
      (sum, order) => sum + (order.total || 0) * (order.executionCount || 0),
      0
    );

    return {
      activeOrders,
      totalOrders: recurringOrders.length,
      totalExecutions,
      totalSaved,
    };
  };

  const value = {
    recurringOrders,
    loading,
    createRecurringOrder,
    updateRecurringOrder,
    toggleRecurringOrder,
    deleteRecurringOrder,
    loadRecurringOrders,
    getUpcomingOrders,
    getOrderStats,
  };

  return (
    <RecurringOrderContext.Provider value={value}>
      {children}
    </RecurringOrderContext.Provider>
  );
};
