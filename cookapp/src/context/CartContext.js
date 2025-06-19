import React, { createContext, useContext, useReducer, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Crear el contexto
const CartContext = createContext();

// Tipos de acciones
const CartActionTypes = {
  LOAD_CART: "LOAD_CART",
  ADD_ITEM: "ADD_ITEM",
  REMOVE_ITEM: "REMOVE_ITEM",
  UPDATE_QUANTITY: "UPDATE_QUANTITY",
  CLEAR_CART: "CLEAR_CART",
  SET_RESTAURANT: "SET_RESTAURANT",
};

// Estado inicial
const initialState = {
  items: [],
  restaurant: null,
  total: 0,
  itemCount: 0,
};

// Función para generar un ID único
const generateItemId = (product, toppings, specialInstructions) => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substr(2, 9);
  const toppingsStr = JSON.stringify(toppings.map((t) => t.id).sort());
  const instructionsStr = specialInstructions.trim();

  const id = `${product._id}_${timestamp}_${random}_${btoa(
    toppingsStr + instructionsStr
  ).substr(0, 10)}`;

  console.log("🆔 Generated ID:", id);
  console.log("📦 Product:", product.name);
  console.log("🧄 Toppings:", toppings);
  console.log("📝 Instructions:", specialInstructions);

  return id;
};

// Reducer
const cartReducer = (state, action) => {
  switch (action.type) {
    case CartActionTypes.LOAD_CART:
      console.log("📂 Loading cart from storage:", action.payload);
      return {
        ...action.payload,
        total: calculateTotal(action.payload.items),
        itemCount: calculateItemCount(action.payload.items),
      };

    case CartActionTypes.ADD_ITEM: {
      const {
        product,
        quantity = 1,
        toppings = [],
        specialInstructions = "",
      } = action.payload;

      console.log("➕ Adding item to cart:");
      console.log("  Product:", product.name);
      console.log("  Quantity:", quantity);
      console.log("  Toppings:", toppings);
      console.log("  Instructions:", specialInstructions);
      console.log("  Current cart items:", state.items.length);

      // Si es de un restaurante diferente, limpiar el carrito
      if (state.restaurant && state.restaurant.id !== product.restaurant_id) {
        console.log("🏪 Different restaurant, clearing cart");
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

        const newState = {
          items: newItems,
          restaurant: {
            id: product.restaurant_id,
            name: product.restaurant_name,
          },
          total: calculateTotal(newItems),
          itemCount: calculateItemCount(newItems),
        };

        console.log("✅ New cart state (different restaurant):", newState);
        return newState;
      }

      // Buscar si ya existe el mismo producto con los mismos toppings
      const toppingsStr1 = JSON.stringify(toppings.map((t) => t.id).sort());
      const instructionsStr1 = specialInstructions.trim();

      console.log("🔍 Looking for existing item with:");
      console.log("  Product ID:", product._id);
      console.log("  Toppings string:", toppingsStr1);
      console.log("  Instructions string:", instructionsStr1);

      const existingItemIndex = state.items.findIndex((item, index) => {
        const toppingsStr2 = JSON.stringify(
          item.toppings.map((t) => t.id).sort()
        );
        const instructionsStr2 = item.specialInstructions.trim();

        const productMatch = item.product._id === product._id;
        const toppingsMatch = toppingsStr1 === toppingsStr2;
        const instructionsMatch = instructionsStr1 === instructionsStr2;

        console.log(`  Item ${index}:`, {
          productName: item.product.name,
          productMatch,
          toppingsMatch,
          instructionsMatch,
          toppingsStr2,
          instructionsStr2,
        });

        return productMatch && toppingsMatch && instructionsMatch;
      });

      console.log("🎯 Existing item index:", existingItemIndex);

      let newItems;
      if (existingItemIndex >= 0) {
        console.log("📈 Updating existing item quantity");
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
        console.log("🆕 Adding new item to cart");
        // Agregar nuevo item con ID único
        const newItem = {
          id: generateItemId(product, toppings, specialInstructions),
          product,
          quantity,
          toppings,
          specialInstructions,
          subtotal: calculateItemSubtotal(product, quantity, toppings),
        };

        console.log("📦 New item:", newItem);

        newItems = [...state.items, newItem];
      }

      const newState = {
        ...state,
        items: newItems,
        restaurant: state.restaurant || {
          id: product.restaurant_id,
          name: product.restaurant_name,
        },
        total: calculateTotal(newItems),
        itemCount: calculateItemCount(newItems),
      };

      console.log("✅ Final cart state:", newState);
      console.log("📊 Cart items count:", newState.items.length);
      newState.items.forEach((item, index) => {
        console.log(`  Item ${index}:`, {
          id: item.id,
          name: item.product.name,
          quantity: item.quantity,
          toppings: item.toppings.map((t) => t.name),
        });
      });

      return newState;
    }

    case CartActionTypes.UPDATE_QUANTITY: {
      const { itemId, quantity } = action.payload;

      console.log("🔄 Updating quantity:", { itemId, quantity });

      if (quantity <= 0) {
        // Si la cantidad es 0 o menos, eliminar el item
        const newItems = state.items.filter((item) => item.id !== itemId);
        return {
          ...state,
          items: newItems,
          restaurant: newItems.length === 0 ? null : state.restaurant,
          total: calculateTotal(newItems),
          itemCount: calculateItemCount(newItems),
        };
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

      return {
        ...state,
        items: newItems,
        total: calculateTotal(newItems),
        itemCount: calculateItemCount(newItems),
      };
    }

    case CartActionTypes.REMOVE_ITEM: {
      console.log("🗑️ Removing item:", action.payload.itemId);
      const newItems = state.items.filter(
        (item) => item.id !== action.payload.itemId
      );
      return {
        ...state,
        items: newItems,
        restaurant: newItems.length === 0 ? null : state.restaurant,
        total: calculateTotal(newItems),
        itemCount: calculateItemCount(newItems),
      };
    }

    case CartActionTypes.CLEAR_CART:
      console.log("🧹 Clearing cart");
      return {
        ...initialState,
      };

    case CartActionTypes.SET_RESTAURANT:
      return {
        ...state,
        restaurant: action.payload,
      };

    default:
      return state;
  }
};

// Funciones auxiliares
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

// Proveedor del contexto
export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);

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
        dispatch({ type: CartActionTypes.LOAD_CART, payload: parsedCart });
      }
    } catch (error) {
      console.error("Error loading cart from storage:", error);
    }
  };

  const saveCartToStorage = async (cartState) => {
    try {
      await AsyncStorage.setItem("@cart", JSON.stringify(cartState));
    } catch (error) {
      console.error("Error saving cart to storage:", error);
    }
  };

  // Acciones del carrito
  const addToCart = (
    product,
    quantity = 1,
    toppings = [],
    specialInstructions = ""
  ) => {
    console.log("🚀 addToCart called with:", {
      productName: product.name,
      quantity,
      toppings: toppings.map((t) => t.name),
      specialInstructions,
    });

    dispatch({
      type: CartActionTypes.ADD_ITEM,
      payload: { product, quantity, toppings, specialInstructions },
    });
  };

  const removeFromCart = (itemId) => {
    dispatch({
      type: CartActionTypes.REMOVE_ITEM,
      payload: { itemId },
    });
  };

  const updateQuantity = (itemId, quantity) => {
    dispatch({
      type: CartActionTypes.UPDATE_QUANTITY,
      payload: { itemId, quantity },
    });
  };

  const clearCart = () => {
    dispatch({ type: CartActionTypes.CLEAR_CART });
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
    // Si el carrito está vacío, se puede agregar cualquier producto
    if (state.items.length === 0) return true;

    // Si ya hay items, solo se pueden agregar productos del mismo restaurante
    return state.restaurant && state.restaurant.id === product.restaurant_id;
  };

  const value = {
    ...state,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getItemQuantity,
    isProductInCart,
    canAddToCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

// Hook personalizado para usar el contexto
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
