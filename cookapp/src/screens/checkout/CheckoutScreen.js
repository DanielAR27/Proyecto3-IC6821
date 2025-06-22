import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  ActivityIndicator,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../context/ThemeContext";
import { useCart } from "../../context/CartContext";
import { useOrders } from "../../context/OrderContext";

const CheckoutScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const { items, restaurant, total, clearCart } = useCart();
  const { addOrder } = useOrders();
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const styles = createStyles(theme);

  const formatPrice = (price) => {
    return new Intl.NumberFormat("es-CR", {
      style: "currency",
      currency: "CRC",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const handleConfirmOrder = () => {
    Alert.alert(
      "¿Confirmar Pedido?",
      `¿Está seguro de realizar este pedido por ${formatPrice(total)}?`,
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Confirmar",
          onPress: processOrder,
          style: "default",
        },
      ]
    );
  };

  const processOrder = async () => {
    setIsProcessing(true);

    // Simular procesamiento de pago (3 segundos)
    setTimeout(() => {
      // Crear el pedido
      const newOrder = {
        id: `order_${Date.now()}`,
        restaurant: restaurant,
        items: items.map((item) => ({
          ...item,
          id: `${item.id}_${Date.now()}`, // Nuevo ID para el pedido
        })),
        total: total,
        status: "confirmed", // confirmed, preparing, ready, delivered
        orderDate: new Date().toISOString(),
        estimatedDeliveryTime: new Date(
          Date.now() + 30 * 60 * 1000
        ).toISOString(), // 30 minutos
      };

      // Agregar el pedido al contexto
      addOrder(newOrder);

      // Limpiar el carrito
      clearCart();

      setIsProcessing(false);
      setShowSuccess(true);

      // Después de 3 segundos, redirigir a pedidos
      setTimeout(() => {
        setShowSuccess(false);
        navigation.navigate("Orders");
      }, 3000);
    }, 3000);
  };

  const renderOrderSummary = () => (
    <View style={styles.summaryContainer}>
      <Text style={styles.sectionTitle}>Resumen del Pedido</Text>

      {/* Restaurante */}
      <View style={styles.restaurantInfo}>
        <Ionicons name="restaurant-outline" size={24} color={theme.primary} />
        <Text style={styles.restaurantName}>{restaurant?.name}</Text>
      </View>

      {/* Items */}
      <View style={styles.itemsContainer}>
        {items.map((item) => (
          <View key={item.id} style={styles.orderItem}>
            <View style={styles.itemInfo}>
              <Text style={styles.itemName}>
                {item.quantity}x {item.product.name}
              </Text>
              {item.toppings.length > 0 && (
                <Text style={styles.itemToppings}>
                  + {item.toppings.map((t) => t.name).join(", ")}
                </Text>
              )}
              {item.specialInstructions.length > 0 && (
                <Text style={styles.itemInstructions}>
                  Nota: {item.specialInstructions}
                </Text>
              )}
            </View>
            <Text style={styles.itemPrice}>{formatPrice(item.subtotal)}</Text>
          </View>
        ))}
      </View>

      {/* Total */}
      <View style={styles.totalContainer}>
        <Text style={styles.totalLabel}>Total a Pagar:</Text>
        <Text style={styles.totalAmount}>{formatPrice(total)}</Text>
      </View>
    </View>
  );

  const renderPaymentMethod = () => (
    <View style={styles.paymentContainer}>
      <Text style={styles.sectionTitle}>Método de Pago</Text>
      <View style={styles.paymentMethod}>
        <Ionicons name="card-outline" size={24} color={theme.primary} />
        <Text style={styles.paymentText}>Pago Simulado (Demo)</Text>
        <Ionicons name="checkmark-circle" size={24} color={theme.success} />
      </View>
    </View>
  );

  const renderProcessingModal = () => (
    <Modal visible={isProcessing} transparent={true} animationType="fade">
      <View style={styles.modalOverlay}>
        <View style={styles.processingContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={styles.processingText}>Procesando Pago...</Text>
          <Text style={styles.processingSubtext}>
            Por favor espere mientras confirmamos su pedido
          </Text>
        </View>
      </View>
    </Modal>
  );

  const renderSuccessModal = () => (
    <Modal visible={showSuccess} transparent={true} animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={styles.successContainer}>
          <Ionicons name="checkmark-circle" size={80} color={theme.success} />
          <Text style={styles.successTitle}>¡Pedido Realizado!</Text>
          <Text style={styles.successText}>
            Su pedido ha sido confirmado exitosamente
          </Text>
          <Text style={styles.successSubtext}>
            Será redirigido a sus pedidos...
          </Text>
        </View>
      </View>
    </Modal>
  );

  if (!items || items.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="cart-outline" size={80} color={theme.textSecondary} />
        <Text style={styles.emptyTitle}>Carrito Vacío</Text>
        <Text style={styles.emptyText}>
          No hay productos en su carrito para procesar
        </Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>Volver</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Confirmar Pedido</Text>
        <View style={styles.headerButton} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {renderOrderSummary()}
        {renderPaymentMethod()}
      </ScrollView>

      {/* Footer con botón de confirmar */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.confirmButton}
          onPress={handleConfirmOrder}
          disabled={isProcessing}
        >
          <Text style={styles.confirmButtonText}>
            Confirmar Pedido - {formatPrice(total)}
          </Text>
        </TouchableOpacity>
      </View>

      {renderProcessingModal()}
      {renderSuccessModal()}
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
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: 20,
      paddingTop: 50,
      paddingBottom: 15,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    headerButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      justifyContent: "center",
      alignItems: "center",
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: "bold",
      color: theme.text,
    },
    content: {
      flex: 1,
      paddingHorizontal: 20,
    },
    summaryContainer: {
      backgroundColor: theme.cardBackground,
      borderRadius: 16,
      padding: 20,
      marginTop: 20,
      marginBottom: 16,
      shadowColor: theme.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: "bold",
      color: theme.text,
      marginBottom: 16,
    },
    restaurantInfo: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 20,
      paddingBottom: 16,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    restaurantName: {
      fontSize: 16,
      fontWeight: "600",
      color: theme.text,
      marginLeft: 12,
    },
    itemsContainer: {
      marginBottom: 20,
    },
    orderItem: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      marginBottom: 16,
    },
    itemInfo: {
      flex: 1,
      marginRight: 16,
    },
    itemName: {
      fontSize: 16,
      fontWeight: "600",
      color: theme.text,
      marginBottom: 4,
    },
    itemToppings: {
      fontSize: 14,
      color: theme.textSecondary,
      marginBottom: 2,
    },
    itemInstructions: {
      fontSize: 13,
      color: theme.textSecondary,
      fontStyle: "italic",
    },
    itemPrice: {
      fontSize: 16,
      fontWeight: "bold",
      color: theme.primary,
    },
    totalContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingTop: 16,
      borderTopWidth: 1,
      borderTopColor: theme.border,
    },
    totalLabel: {
      fontSize: 18,
      fontWeight: "bold",
      color: theme.text,
    },
    totalAmount: {
      fontSize: 20,
      fontWeight: "bold",
      color: theme.primary,
    },
    paymentContainer: {
      backgroundColor: theme.cardBackground,
      borderRadius: 16,
      padding: 20,
      marginBottom: 20,
      shadowColor: theme.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    paymentMethod: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      backgroundColor: theme.background,
      padding: 16,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.success,
    },
    paymentText: {
      fontSize: 16,
      fontWeight: "500",
      color: theme.text,
      flex: 1,
      marginLeft: 12,
    },
    footer: {
      padding: 20,
      borderTopWidth: 1,
      borderTopColor: theme.border,
      backgroundColor: theme.background,
    },
    confirmButton: {
      backgroundColor: theme.primary,
      borderRadius: 12,
      paddingVertical: 16,
      alignItems: "center",
      shadowColor: theme.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 4,
    },
    confirmButtonText: {
      color: "#fff",
      fontSize: 18,
      fontWeight: "bold",
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      justifyContent: "center",
      alignItems: "center",
    },
    processingContainer: {
      backgroundColor: theme.cardBackground,
      borderRadius: 20,
      padding: 40,
      alignItems: "center",
      marginHorizontal: 40,
      shadowColor: theme.shadow,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 8,
    },
    processingText: {
      fontSize: 18,
      fontWeight: "bold",
      color: theme.text,
      marginTop: 20,
    },
    processingSubtext: {
      fontSize: 14,
      color: theme.textSecondary,
      textAlign: "center",
      marginTop: 8,
    },
    successContainer: {
      backgroundColor: theme.cardBackground,
      borderRadius: 20,
      padding: 40,
      alignItems: "center",
      marginHorizontal: 40,
      shadowColor: theme.shadow,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 8,
    },
    successTitle: {
      fontSize: 22,
      fontWeight: "bold",
      color: theme.text,
      marginTop: 20,
      marginBottom: 12,
    },
    successText: {
      fontSize: 16,
      color: theme.textSecondary,
      textAlign: "center",
      marginBottom: 8,
    },
    successSubtext: {
      fontSize: 14,
      color: theme.textSecondary,
      textAlign: "center",
    },
    emptyContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: theme.background,
      paddingHorizontal: 40,
    },
    emptyTitle: {
      fontSize: 22,
      fontWeight: "bold",
      color: theme.text,
      marginTop: 20,
      marginBottom: 12,
    },
    emptyText: {
      fontSize: 16,
      color: theme.textSecondary,
      textAlign: "center",
      marginBottom: 30,
    },
    backButton: {
      backgroundColor: theme.primary,
      paddingHorizontal: 30,
      paddingVertical: 12,
      borderRadius: 20,
    },
    backButtonText: {
      color: "#fff",
      fontSize: 16,
      fontWeight: "600",
    },
  });

export default CheckoutScreen;
