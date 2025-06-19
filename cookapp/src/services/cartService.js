const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

// Crear una nueva orden desde el carrito
export const createOrderFromCart = async (orderData, userId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...orderData,
        user_id: userId,
        status: "pending",
        created_at: new Date().toISOString(),
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Error creating order");
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error("Error creating order:", error);
    throw error;
  }
};

// Obtener órdenes del usuario
export const getUserOrders = async (userId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/orders/user/${userId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Error getting orders");
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error("Error getting user orders:", error);
    throw error;
  }
};

// Obtener detalles de una orden específica
export const getOrderById = async (orderId, userId) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/orders/${orderId}?user_id=${userId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Error getting order");
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error("Error getting order:", error);
    throw error;
  }
};

// Cancelar una orden
export const cancelOrder = async (orderId, userId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/orders/${orderId}/cancel`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        user_id: userId,
        status: "cancelled",
        cancelled_at: new Date().toISOString(),
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Error cancelling order");
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error("Error cancelling order:", error);
    throw error;
  }
};

// Calcular costo de delivery basado en la distancia
export const calculateDeliveryFee = async (restaurantId, deliveryAddress) => {
  try {
    const response = await fetch(`${API_BASE_URL}/delivery/calculate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        restaurant_id: restaurantId,
        delivery_address: deliveryAddress,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Error calculating delivery fee");
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error("Error calculating delivery fee:", error);
    // Devolver tarifa por defecto si hay error
    return {
      fee: 1500,
      estimated_time: 30,
      distance: "Desconocida",
    };
  }
};

// Validar disponibilidad de productos antes del checkout
export const validateCartItems = async (cartItems) => {
  try {
    const productIds = cartItems.map((item) => item.product.id);

    const response = await fetch(`${API_BASE_URL}/products/validate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        product_ids: productIds,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Error validating products");
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error("Error validating cart items:", error);
    // Si hay error en la validación, asumir que están disponibles
    return cartItems.map((item) => ({
      product_id: item.product.id,
      available: true,
      current_price: item.product.price,
    }));
  }
};

// Aplicar cupón de descuento
export const applyCoupon = async (couponCode, cartTotal, restaurantId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/coupons/apply`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        coupon_code: couponCode,
        cart_total: cartTotal,
        restaurant_id: restaurantId,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Cupón no válido");
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error("Error applying coupon:", error);
    throw error;
  }
};

// Obtener métodos de pago disponibles
export const getPaymentMethods = async (userId) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/payment-methods/user/${userId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Error getting payment methods");
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error("Error getting payment methods:", error);
    // Devolver métodos por defecto si hay error
    return [
      { id: "cash", name: "Efectivo", type: "cash" },
      { id: "card", name: "Tarjeta de débito/crédito", type: "card" },
    ];
  }
};

// Procesar pago
export const processPayment = async (paymentData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/payments/process`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(paymentData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Error processing payment");
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error("Error processing payment:", error);
    throw error;
  }
};

// Utilidades para formateo
export const formatCartForOrder = (
  cartItems,
  restaurant,
  deliveryInfo,
  paymentInfo,
  userInfo
) => {
  return {
    restaurant_id: restaurant.id,
    restaurant_name: restaurant.name,
    items: cartItems.map((item) => ({
      product_id: item.product.id,
      product_name: item.product.name,
      quantity: item.quantity,
      unit_price: parseFloat(item.product.price),
      toppings: item.toppings.map((topping) => ({
        id: topping.id,
        name: topping.name,
        price: parseFloat(topping.price),
      })),
      special_instructions: item.specialInstructions,
      subtotal: item.subtotal,
    })),
    subtotal: cartItems.reduce((total, item) => total + item.subtotal, 0),
    delivery_fee: deliveryInfo.fee,
    total:
      cartItems.reduce((total, item) => total + item.subtotal, 0) +
      deliveryInfo.fee,
    delivery_address: deliveryInfo.address,
    delivery_notes: deliveryInfo.notes,
    payment_method: paymentInfo.method,
    customer_name: userInfo.name,
    customer_phone: userInfo.phone,
    estimated_delivery_time: deliveryInfo.estimated_time,
  };
};
