import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../context/ThemeContext";
import { useCart } from "../context/CartContext";

const AddToCartButton = ({
  product,
  quantity = 1,
  toppings = [],
  specialInstructions = "",
  onSuccess,
  style,
}) => {
  const { theme } = useTheme();
  const { addToCart, canAddToCart, restaurant } = useCart();
  const [isLoading, setIsLoading] = useState(false);

  const styles = createStyles(theme);

  const handleAddToCart = async () => {
    if (!product) {
      Alert.alert("Error", "Producto no válido");
      return;
    }

    // Verificar si se puede agregar al carrito
    if (!canAddToCart(product)) {
      Alert.alert(
        "Cambiar restaurante",
        `Ya tienes productos de ${restaurant?.name} en tu carrito. ¿Quieres vaciar el carrito y agregar este producto de ${product.restaurant_name}?`,
        [
          { text: "Cancelar", style: "cancel" },
          {
            text: "Cambiar",
            onPress: () => {
              // Limpiar carrito y agregar nuevo producto
              addToCart(product, quantity, toppings, specialInstructions);
              onSuccess?.();
            },
          },
        ]
      );
      return;
    }

    try {
      setIsLoading(true);

      // Simular una pequeña pausa para UX
      await new Promise((resolve) => setTimeout(resolve, 300));

      addToCart(product, quantity, toppings, specialInstructions);

      // Callback de éxito
      onSuccess?.();
    } catch (error) {
      console.error("Error adding to cart:", error);
      Alert.alert("Error", "No se pudo agregar el producto al carrito");
    } finally {
      setIsLoading(false);
    }
  };

  const formatPrice = (price) => {
    return `₡${parseFloat(price).toLocaleString("es-CR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const calculateTotalPrice = () => {
    const productPrice = parseFloat(product.price) || 0;
    const toppingsPrice = toppings.reduce(
      (sum, topping) => sum + (parseFloat(topping.price) || 0),
      0
    );
    return (productPrice + toppingsPrice) * quantity;
  };

  return (
    <TouchableOpacity
      style={[styles.button, style, isLoading && styles.buttonDisabled]}
      onPress={handleAddToCart}
      disabled={isLoading || !product}
      activeOpacity={0.8}
    >
      {isLoading ? (
        <ActivityIndicator color={theme.cardBackground} size="small" />
      ) : (
        <>
          <Ionicons name="basket" size={20} color={theme.cardBackground} />
          <Text style={styles.buttonText}>
            Agregar {quantity > 1 ? `(${quantity})` : ""} •{" "}
            {formatPrice(calculateTotalPrice())}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
};

const createStyles = (theme) =>
  StyleSheet.create({
    button: {
      backgroundColor: theme.primary,
      borderRadius: 12,
      paddingVertical: 14,
      paddingHorizontal: 20,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      shadowColor: theme.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    buttonDisabled: {
      opacity: 0.6,
    },
    buttonText: {
      color: theme.cardBackground,
      fontSize: 16,
      fontWeight: "bold",
      marginLeft: 8,
    },
  });

export default AddToCartButton;
