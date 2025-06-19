import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { useCart } from "../context/CartContext";
import { useNavigation } from "@react-navigation/native";
import { useTheme } from "../context/ThemeContext";

const CartBadge = ({ style }) => {
  const { theme } = useTheme();
  const { itemCount } = useCart();
  const navigation = useNavigation();

  const styles = createStyles(theme);

  // No mostrar si el carrito está vacío
  if (itemCount === 0) {
    return null;
  }

  const handlePress = () => {
    navigation.navigate("Cart");
  };

  return (
    <TouchableOpacity
      style={[styles.container, style]}
      onPress={handlePress}
      activeOpacity={0.8}
    >
      <View style={styles.iconContainer}>
        <Ionicons name="basket" size={24} color={theme.cardBackground} />
        {itemCount > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>
              {itemCount > 99 ? "99+" : itemCount}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const createStyles = (theme) =>
  StyleSheet.create({
    container: {
      position: "absolute",
      bottom: 100,
      right: 20,
      backgroundColor: theme.primary,
      borderRadius: 28,
      width: 56,
      height: 56,
      justifyContent: "center",
      alignItems: "center",
      shadowColor: theme.shadow,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 8,
      zIndex: 1000,
    },
    iconContainer: {
      position: "relative",
    },
    badge: {
      position: "absolute",
      top: -8,
      right: -8,
      backgroundColor: theme.danger,
      borderRadius: 12,
      minWidth: 20,
      height: 20,
      justifyContent: "center",
      alignItems: "center",
      borderWidth: 2,
      borderColor: theme.cardBackground,
    },
    badgeText: {
      color: theme.cardBackground,
      fontSize: 10,
      fontWeight: "bold",
      textAlign: "center",
    },
  });

export default CartBadge;
