import React, { createContext, useContext, useReducer, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Crear el contexto
const OrderContext = createContext();

// Tipos de acciones
const OrderActionTypes = {
  LOAD_ORDERS: "LOAD_ORDERS",
  ADD_ORDER: "ADD_ORDER",
  UPDATE_ORDER_STATUS: "UPDATE_ORDER_STATUS",
  CLEAR_ORDERS: "CLEAR_ORDERS",
};

// Estado inicial
const initialState = {
  orders: [],
  loading: false,
};

// Reducer
const orderReducer = (state, action) => {
  switch (action.type) {
    case OrderActionTypes.LOAD_ORDERS:
      return {
        ...state,
        orders: action.payload,
        loading: false,
      };

    case OrderActionTypes.ADD_ORDER: {
      const newOrders = [action.payload, ...state.orders];
      return {
        ...state,
        orders: newOrders,
      };
    }

    case OrderActionTypes.UPDATE_ORDER_STATUS: {
      const { orderId, status } = action.payload;
      const updatedOrders = state.orders.map((order) =>
        order.id === orderId
          ? { ...order, status, updatedAt: new Date().toISOString() }
          : order
      );
      return {
        ...state,
        orders: updatedOrders,
      };
    }

    case OrderActionTypes.CLEAR_ORDERS:
      return {
        ...state,
        orders: [],
      };

    default:
      return state;
  }
};

// Proveedor del contexto
export const OrderProvider = ({ children }) => {
  const [state, dispatch] = useReducer(orderReducer, initialState);

  // Cargar pedidos desde AsyncStorage al inicializar
  useEffect(() => {
    loadOrdersFromStorage();
  }, []);

  // Guardar pedidos en AsyncStorage cuando cambien
  useEffect(() => {
    if (state.orders.length > 0) {
      saveOrdersToStorage(state.orders);
    }
  }, [state.orders]);

  const loadOrdersFromStorage = async () => {
    try {
      const ordersData = await AsyncStorage.getItem("@orders");
      if (ordersData) {
        const parsedOrders = JSON.parse(ordersData);
        dispatch({ type: OrderActionTypes.LOAD_ORDERS, payload: parsedOrders });
      } else {
        dispatch({ type: OrderActionTypes.LOAD_ORDERS, payload: [] });
      }
    } catch (error) {
      console.error("Error loading orders from storage:", error);
      dispatch({ type: OrderActionTypes.LOAD_ORDERS, payload: [] });
    }
  };

  const saveOrdersToStorage = async (orders) => {
    try {
      await AsyncStorage.setItem("@orders", JSON.stringify(orders));
    } catch (error) {
      console.error("Error saving orders to storage:", error);
    }
  };

  // Acciones de pedidos
  const addOrder = (order) => {
    console.log("📦 Adding new order:", order);
    dispatch({
      type: OrderActionTypes.ADD_ORDER,
      payload: order,
    });
  };

  const updateOrderStatus = (orderId, status) => {
    dispatch({
      type: OrderActionTypes.UPDATE_ORDER_STATUS,
      payload: { orderId, status },
    });
  };

  const clearOrders = () => {
    dispatch({ type: OrderActionTypes.CLEAR_ORDERS });
  };

  const getOrderById = (orderId) => {
    return state.orders.find((order) => order.id === orderId);
  };

  const getOrdersByStatus = (status) => {
    return state.orders.filter((order) => order.status === status);
  };

  const getRecentOrders = (limit = 5) => {
    return state.orders
      .sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate))
      .slice(0, limit);
  };

  // Función helper para obtener el estado en español
  const getStatusText = (status) => {
    const statusMap = {
      confirmed: "Confirmado",
      preparing: "En Preparación",
      ready: "Listo",
      delivered: "Entregado",
      cancelled: "Cancelado",
    };
    return statusMap[status] || "Desconocido";
  };

  // Función helper para obtener el color del estado
  const getStatusColor = (status, theme) => {
    const colorMap = {
      confirmed: theme.warning,
      preparing: theme.primary,
      ready: theme.success,
      delivered: theme.success,
      cancelled: theme.danger,
    };
    return colorMap[status] || theme.textSecondary;
  };

  const value = {
    ...state,
    addOrder,
    updateOrderStatus,
    clearOrders,
    getOrderById,
    getOrdersByStatus,
    getRecentOrders,
    getStatusText,
    getStatusColor,
  };

  return (
    <OrderContext.Provider value={value}>{children}</OrderContext.Provider>
  );
};

// Hook personalizado para usar el contexto
export const useOrders = () => {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error("useOrders must be used within an OrderProvider");
  }
  return context;
};
