import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../context/ThemeContext";
import { useCart } from "../../context/CartContext";

const CartScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const {
    items,
    restaurant,
    total,
    itemCount,
    updateQuantity,
    removeFromCart,
    clearCart,
  } = useCart();
  const [isLoading, setIsLoading] = useState(false);

  const styles = createStyles(theme);

  // Si el carrito está vacío
  if (items.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={theme.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Mi Carrito</Text>
          <View style={styles.placeholder} />
        </View>

        <View style={styles.emptyContainer}>
          <Ionicons
            name="basket-outline"
            size={80}
            color={theme.textSecondary}
          />
          <Text style={styles.emptyTitle}>Tu carrito está vacío</Text>
          <Text style={styles.emptySubtitle}>
            Agrega algunos productos deliciosos a tu carrito
          </Text>
          <TouchableOpacity
            style={styles.continueShoppingButton}
            onPress={() => navigation.navigate("Home")}
          >
            <Text style={styles.continueShoppingText}>Continuar Comprando</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const handleQuantityChange = (itemId, newQuantity) => {
    if (newQuantity <= 0) {
      Alert.alert(
        "Eliminar producto",
        "¿Estás seguro de que quieres eliminar este producto del carrito?",
        [
          { text: "Cancelar", style: "cancel" },
          {
            text: "Eliminar",
            onPress: () => removeFromCart(itemId),
            style: "destructive",
          },
        ]
      );
    } else {
      updateQuantity(itemId, newQuantity);
    }
  };

  const handleRemoveItem = (itemId, productName) => {
    Alert.alert(
      "Eliminar producto",
      `¿Estás seguro de que quieres eliminar "${productName}" del carrito?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          onPress: () => removeFromCart(itemId),
          style: "destructive",
        },
      ]
    );
  };

  const handleClearCart = () => {
    Alert.alert(
      "Vaciar carrito",
      "¿Estás seguro de que quieres vaciar todo el carrito?",
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Vaciar", onPress: clearCart, style: "destructive" },
      ]
    );
  };

  const handleCheckout = () => {
    // Aquí implementarías la lógica de checkout
    Alert.alert(
      "Proceder al pago",
      "Esta funcionalidad se implementará próximamente",
      [{ text: "OK" }]
    );
  };

  const formatPrice = (price) => {
    return `₡${parseFloat(price).toLocaleString("es-CR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const renderCartItem = (item) => (
    <View key={item.id} style={styles.cartItem}>
      <Image
        source={{
          uri: item.product.image_url || "https://via.placeholder.com/80x80",
        }}
        style={styles.productImage}
      />

      <View style={styles.itemDetails}>
        <Text style={styles.productName}>{item.product.name}</Text>
        <Text style={styles.productDescription} numberOfLines={2}>
          {item.product.description}
        </Text>

        {/* Mostrar toppings si los hay */}
        {item.toppings && item.toppings.length > 0 && (
          <View style={styles.toppingsContainer}>
            <Text style={styles.toppingsTitle}>Extras:</Text>
            {item.toppings.map((topping, index) => (
              <Text key={index} style={styles.toppingText}>
                • {topping.name} (+{formatPrice(topping.price)})
              </Text>
            ))}
          </View>
        )}

        {/* Mostrar instrucciones especiales si las hay */}
        {item.specialInstructions && (
          <View style={styles.instructionsContainer}>
            <Text style={styles.instructionsTitle}>Instrucciones:</Text>
            <Text style={styles.instructionsText}>
              {item.specialInstructions}
            </Text>
          </View>
        )}

        <View style={styles.itemFooter}>
          <Text style={styles.itemPrice}>{formatPrice(item.subtotal)}</Text>

          <View style={styles.quantityControls}>
            <TouchableOpacity
              style={styles.quantityButton}
              onPress={() => handleQuantityChange(item.id, item.quantity - 1)}
            >
              <Ionicons name="remove" size={16} color={theme.primary} />
            </TouchableOpacity>

            <Text style={styles.quantityText}>{item.quantity}</Text>

            <TouchableOpacity
              style={styles.quantityButton}
              onPress={() => handleQuantityChange(item.id, item.quantity + 1)}
            >
              <Ionicons name="add" size={16} color={theme.primary} />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <TouchableOpacity
        style={styles.removeButton}
        onPress={() => handleRemoveItem(item.id, item.product.name)}
      >
        <Ionicons name="trash-outline" size={20} color={theme.danger} />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mi Carrito</Text>
        <TouchableOpacity style={styles.clearButton} onPress={handleClearCart}>
          <Ionicons name="trash-outline" size={20} color={theme.danger} />
        </TouchableOpacity>
      </View>

      {/* Información del restaurante */}
      {restaurant && (
        <View style={styles.restaurantInfo}>
          <Ionicons name="restaurant-outline" size={20} color={theme.primary} />
          <Text style={styles.restaurantName}>{restaurant.name}</Text>
        </View>
      )}

      {/* Lista de productos */}
      <ScrollView style={styles.itemsList} showsVerticalScrollIndicator={false}>
        {items.map(renderCartItem)}
      </ScrollView>

      {/* Footer con resumen y checkout */}
      <View style={styles.footer}>
        <View style={styles.summary}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Productos ({itemCount})</Text>
            <Text style={styles.summaryValue}>{formatPrice(total)}</Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Delivery</Text>
            <Text style={styles.summaryValue}>₡1,500.00</Text>
          </View>

          <View style={[styles.summaryRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>{formatPrice(total + 1500)}</Text>
          </View>
        </View>

        <TouchableOpacity
          style={[
            styles.checkoutButton,
            isLoading && styles.checkoutButtonDisabled,
          ]}
          onPress={handleCheckout}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color={theme.cardBackground} />
          ) : (
            <Text style={styles.checkoutButtonText}>
              Proceder al Pago • {formatPrice(total + 1500)}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const createStyles = (theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingTop: 60,
      paddingBottom: 20,
      paddingHorizontal: 20,
      backgroundColor: theme.cardBackground,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    backButton: {
      padding: 8,
    },
    headerTitle: {
      fontSize: 20,
      fontWeight: "bold",
      color: theme.text,
    },
    clearButton: {
      padding: 8,
    },
    placeholder: {
      width: 40,
    },
    restaurantInfo: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 20,
      paddingVertical: 15,
      backgroundColor: theme.cardBackground,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    restaurantName: {
      fontSize: 16,
      fontWeight: "600",
      color: theme.text,
      marginLeft: 8,
    },
    itemsList: {
      flex: 1,
      padding: 20,
    },
    cartItem: {
      flexDirection: "row",
      backgroundColor: theme.cardBackground,
      borderRadius: 12,
      padding: 15,
      marginBottom: 15,
      shadowColor: theme.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    productImage: {
      width: 80,
      height: 80,
      borderRadius: 8,
      backgroundColor: theme.border,
    },
    itemDetails: {
      flex: 1,
      marginLeft: 15,
    },
    productName: {
      fontSize: 16,
      fontWeight: "bold",
      color: theme.text,
      marginBottom: 4,
    },
    productDescription: {
      fontSize: 14,
      color: theme.textSecondary,
      marginBottom: 8,
    },
    toppingsContainer: {
      marginBottom: 8,
    },
    toppingsTitle: {
      fontSize: 12,
      fontWeight: "600",
      color: theme.text,
      marginBottom: 2,
    },
    toppingText: {
      fontSize: 11,
      color: theme.textSecondary,
    },
    instructionsContainer: {
      marginBottom: 8,
    },
    instructionsTitle: {
      fontSize: 12,
      fontWeight: "600",
      color: theme.text,
      marginBottom: 2,
    },
    instructionsText: {
      fontSize: 11,
      color: theme.textSecondary,
      fontStyle: "italic",
    },
    itemFooter: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    itemPrice: {
      fontSize: 16,
      fontWeight: "bold",
      color: theme.primary,
    },
    quantityControls: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: theme.background,
      borderRadius: 20,
      paddingHorizontal: 4,
    },
    quantityButton: {
      width: 28,
      height: 28,
      borderRadius: 14,
      backgroundColor: theme.cardBackground,
      justifyContent: "center",
      alignItems: "center",
      margin: 2,
    },
    quantityText: {
      fontSize: 14,
      fontWeight: "bold",
      color: theme.text,
      marginHorizontal: 12,
      minWidth: 20,
      textAlign: "center",
    },
    removeButton: {
      padding: 8,
      alignSelf: "flex-start",
    },
    footer: {
      backgroundColor: theme.cardBackground,
      borderTopWidth: 1,
      borderTopColor: theme.border,
      paddingHorizontal: 20,
      paddingTop: 20,
      paddingBottom: 30,
    },
    summary: {
      marginBottom: 20,
    },
    summaryRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 8,
    },
    summaryLabel: {
      fontSize: 14,
      color: theme.textSecondary,
    },
    summaryValue: {
      fontSize: 14,
      color: theme.text,
      fontWeight: "500",
    },
    totalRow: {
      borderTopWidth: 1,
      borderTopColor: theme.border,
      paddingTop: 12,
      marginTop: 8,
    },
    totalLabel: {
      fontSize: 18,
      fontWeight: "bold",
      color: theme.text,
    },
    totalValue: {
      fontSize: 18,
      fontWeight: "bold",
      color: theme.primary,
    },
    checkoutButton: {
      backgroundColor: theme.primary,
      borderRadius: 12,
      paddingVertical: 16,
      alignItems: "center",
      justifyContent: "center",
    },
    checkoutButtonDisabled: {
      opacity: 0.6,
    },
    checkoutButtonText: {
      color: theme.cardBackground,
      fontSize: 16,
      fontWeight: "bold",
    },
    emptyContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      padding: 20,
    },
    emptyTitle: {
      fontSize: 24,
      fontWeight: "bold",
      color: theme.text,
      marginTop: 20,
      marginBottom: 10,
      textAlign: "center",
    },
    emptySubtitle: {
      fontSize: 16,
      color: theme.textSecondary,
      textAlign: "center",
      lineHeight: 22,
      marginBottom: 30,
    },
    continueShoppingButton: {
      backgroundColor: theme.primary,
      borderRadius: 12,
      paddingVertical: 14,
      paddingHorizontal: 30,
    },
    continueShoppingText: {
      color: theme.cardBackground,
      fontSize: 16,
      fontWeight: "600",
    },
  });

export default CartScreen;
