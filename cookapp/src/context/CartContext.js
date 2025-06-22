import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const CartContext = createContext();

const initialState = {
  items: [],
  restaurant: null,
  total: 0,
  itemCount: 0,
};

const generateItemId = (product, toppings, specialInstructions) => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substr(2, 9);
  const toppingsStr = JSON.stringify(toppings.map((t) => t.id).sort());
  const instructionsStr = specialInstructions.trim();
  return `${product._id}_${timestamp}_${random}_${btoa(
    toppingsStr + instructionsStr
  ).substr(0, 10)}`;
};

const calculateItemSubtotal = (product, quantity, toppings = []) => {
  const productPrice = parseFloat(product.price) || 0;
  const toppingsPrice = toppings.reduce(
    (sum, topping) => sum + (parseFloat(topping.price) || 0),
    0
  );
  return (productPrice + toppingsPrice) * quantity;
};

const calculateTotal = (items) => {
  return items.reduce((total, item) => total + item.subtotal, 0);
};

const calculateItemCount = (items) => {
  return items.reduce((count, item) => count + item.quantity, 0);
};

export const CartProvider = ({ children }) => {
  const [state, setState] = useState(initialState);

  // Cargar carrito desde AsyncStorage al inicializar
  useEffect(() => {
    loadCartFromStorage();
  }, []);

  // Guardar carrito en AsyncStorage cuando cambie el estado
  useEffect(() => {
    saveCartToStorage(state);
  }, [state]);

  const loadCartFromStorage = async () => {
    try {
      const cartData = await AsyncStorage.getItem("@cart");
      if (cartData) {
        const parsedCart = JSON.parse(cartData);
        setState({
          ...parsedCart,
          total: calculateTotal(parsedCart.items || []),
          itemCount: calculateItemCount(parsedCart.items || []),
        });
      }
    } catch (error) {
      console.error("Error loading cart:", error);
    }
  };

  const saveCartToStorage = async (cartState) => {
    try {
      await AsyncStorage.setItem("@cart", JSON.stringify(cartState));
    } catch (error) {
      console.error("Error saving cart:", error);
    }
  };

  const addToCart = (
    product,
    quantity = 1,
    toppings = [],
    specialInstructions = ""
  ) => {
    // Si es de un restaurante diferente, limpiar el carrito
    if (state.restaurant && state.restaurant.id !== product.restaurant_id) {
      const newItems = [
        {
          id: generateItemId(product, toppings, specialInstructions),
          product,
          quantity,
          toppings,
          specialInstructions,
          subtotal: calculateItemSubtotal(product, quantity, toppings),
        },
      ];

      setState({
        items: newItems,
        restaurant: {
          id: product.restaurant_id,
          name: product.restaurant_name,
        },
        total: calculateTotal(newItems),
        itemCount: calculateItemCount(newItems),
      });
      return;
    }

    // Buscar si ya existe el mismo producto con los mismos toppings
    const toppingsStr1 = JSON.stringify(toppings.map((t) => t.id).sort());
    const instructionsStr1 = specialInstructions.trim();

    const existingItemIndex = state.items.findIndex((item) => {
      const toppingsStr2 = JSON.stringify(
        item.toppings.map((t) => t.id).sort()
      );
      const instructionsStr2 = item.specialInstructions.trim();
      return (
        item.product._id === product._id &&
        toppingsStr1 === toppingsStr2 &&
        instructionsStr1 === instructionsStr2
      );
    });

    let newItems;
    if (existingItemIndex >= 0) {
      // Actualizar cantidad del item existente
      newItems = state.items.map((item, index) =>
        index === existingItemIndex
          ? {
              ...item,
              quantity: item.quantity + quantity,
              subtotal: calculateItemSubtotal(
                product,
                item.quantity + quantity,
                toppings
              ),
            }
          : item
      );
    } else {
      // Agregar nuevo item
      const newItem = {
        id: generateItemId(product, toppings, specialInstructions),
        product,
        quantity,
        toppings,
        specialInstructions,
        subtotal: calculateItemSubtotal(product, quantity, toppings),
      };
      newItems = [...state.items, newItem];
    }

    setState({
      ...state,
      items: newItems,
      restaurant: state.restaurant || {
        id: product.restaurant_id,
        name: product.restaurant_name,
      },
      total: calculateTotal(newItems),
      itemCount: calculateItemCount(newItems),
    });
  };

  const removeFromCart = (itemId) => {
    const newItems = state.items.filter((item) => item.id !== itemId);
    setState({
      ...state,
      items: newItems,
      restaurant: newItems.length === 0 ? null : state.restaurant,
      total: calculateTotal(newItems),
      itemCount: calculateItemCount(newItems),
    });
  };

  const updateQuantity = (itemId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
      return;
    }

    const newItems = state.items.map((item) =>
      item.id === itemId
        ? {
            ...item,
            quantity,
            subtotal: calculateItemSubtotal(
              item.product,
              quantity,
              item.toppings
            ),
          }
        : item
    );

    setState({
      ...state,
      items: newItems,
      total: calculateTotal(newItems),
      itemCount: calculateItemCount(newItems),
    });
  };

  const clearCart = () => {
    setState(initialState);
  };

  const getItemQuantity = (
    productId,
    toppings = [],
    specialInstructions = ""
  ) => {
    const toppingsStr = JSON.stringify(toppings.map((t) => t.id).sort());
    const instructionsStr = specialInstructions.trim();

    const item = state.items.find((item) => {
      const itemToppingsStr = JSON.stringify(
        item.toppings.map((t) => t.id).sort()
      );
      const itemInstructionsStr = item.specialInstructions.trim();
      return (
        item.product._id === productId &&
        itemToppingsStr === toppingsStr &&
        itemInstructionsStr === instructionsStr
      );
    });

    return item ? item.quantity : 0;
  };

  const isProductInCart = (productId) => {
    return state.items.some((item) => item.product._id === productId);
  };

  const canAddToCart = (product) => {
    if (state.items.length === 0) return true;
    return state.restaurant && state.restaurant.id === product.restaurant_id;
  };

  return (
    <CartContext.Provider
      value={{
        ...state,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getItemQuantity,
        isProductInCart,
        canAddToCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
