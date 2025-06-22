import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Animated,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../context/ThemeContext";
import { useCart } from "../../context/CartContext";
import { useOrders } from "../../context/OrderContext";

const CheckoutScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const { items, total, restaurant, clearCart } = useCart();
  const { addOrder } = useOrders();

  // Estados para el flujo de checkout
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [orderId, setOrderId] = useState(null);

  // Estados para los datos del usuario
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [specialInstructions, setSpecialInstructions] = useState("");

  // Animación para el check
  const [checkScale] = useState(new Animated.Value(0));

  const styles = createStyles(theme);

  const deliveryFee = 1500;
  const finalTotal = total + deliveryFee;

  const formatPrice = (price) => {
    return `₡${parseFloat(price).toLocaleString("es-CR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const validateForm = () => {
    if (!deliveryAddress.trim()) {
      Alert.alert("Error", "Por favor ingresa la dirección de entrega");
      return false;
    }
    if (!phoneNumber.trim()) {
      Alert.alert("Error", "Por favor ingresa tu número de teléfono");
      return false;
    }
    return true;
  };

  const handlePlaceOrder = async () => {
    if (!validateForm()) return;

    // 1. Mostrar "Procesando..."
    setIsProcessing(true);

    try {
      // Simular procesamiento de pago (2 segundos)
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // 2. Crear la orden
      const orderData = {
        items,
        restaurant,
        total: finalTotal,
        deliveryAddress,
        phoneNumber,
        paymentMethod,
        specialInstructions,
        estimatedDeliveryTime: new Date(
          Date.now() + 30 * 60 * 1000
        ).toISOString(),
      };

      const newOrderId = addOrder(orderData);
      setOrderId(newOrderId);

      // 3. Mostrar pantalla de éxito
      setIsProcessing(false);
      setShowSuccess(true);

      // 4. Animar el check
      Animated.spring(checkScale, {
        toValue: 1,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }).start();

      // 5. Limpiar carrito después de 1 segundo
      setTimeout(() => {
        clearCart();
      }, 1000);
    } catch (error) {
      setIsProcessing(false);
      Alert.alert(
        "Error",
        "Hubo un problema al procesar tu pedido. Intenta de nuevo."
      );
    }
  };

  const handleBackToHome = () => {
    setShowSuccess(false);
    // Resetear completamente el stack de navegación
    navigation.reset({
      index: 0,
      routes: [
        {
          name: "Home",
          state: {
            routes: [{ name: "HomeMain" }],
          },
        },
      ],
    });
  };

  const handleViewOrder = () => {
    setShowSuccess(false);
    // Resetear el stack y ir directo a Orders con el pedido específico
    navigation.reset({
      index: 0,
      routes: [
        {
          name: "Orders",
          state: {
            routes: [
              { name: "OrdersMain" },
              { name: "OrderDetail", params: { orderId } },
            ],
          },
        },
      ],
    });
  };

  // 🎉 Pantalla de éxito
  if (showSuccess) {
    return (
      <View style={styles.successContainer}>
        <Animated.View
          style={[
            styles.successCheckContainer,
            { transform: [{ scale: checkScale }] },
          ]}
        >
          <Ionicons name="checkmark-circle" size={120} color="#10b981" />
        </Animated.View>

        <Text style={styles.successTitle}>¡Pago Procesado!</Text>
        <Text style={styles.successSubtitle}>
          Tu pedido ha sido confirmado exitosamente
        </Text>

        <View style={styles.orderInfoCard}>
          <Text style={styles.orderNumberText}>
            Pedido #{orderId?.slice(-8).toUpperCase()}
          </Text>
          <Text style={styles.totalText}>Total: {formatPrice(finalTotal)}</Text>
          <Text style={styles.estimatedTimeText}>
            🕐 Tiempo estimado: 25-35 minutos
          </Text>
        </View>

        <View style={styles.successActions}>
          <TouchableOpacity
            style={styles.viewOrderButton}
            onPress={handleViewOrder}
          >
            <Ionicons name="receipt-outline" size={20} color="white" />
            <Text style={styles.viewOrderButtonText}>Ver Mi Pedido</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.backHomeButton}
            onPress={handleBackToHome}
          >
            <Text style={styles.backHomeButtonText}>Seguir Comprando</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // 🔄 Pantalla de procesando
  if (isProcessing) {
    return (
      <View style={styles.processingContainer}>
        <ActivityIndicator size="large" color={theme.primary} />
        <Text style={styles.processingTitle}>Procesando tu pago...</Text>
        <Text style={styles.processingSubtitle}>
          Por favor espera mientras confirmamos tu orden
        </Text>

        <View style={styles.processingSteps}>
          <View style={styles.processingStep}>
            <Ionicons name="card-outline" size={24} color={theme.primary} />
            <Text style={styles.processingStepText}>Verificando pago</Text>
          </View>
          <View style={styles.processingStep}>
            <Ionicons
              name="restaurant-outline"
              size={24}
              color={theme.textSecondary}
            />
            <Text
              style={[
                styles.processingStepText,
                { color: theme.textSecondary },
              ]}
            >
              Enviando al restaurante
            </Text>
          </View>
          <View style={styles.processingStep}>
            <Ionicons
              name="checkmark-circle-outline"
              size={24}
              color={theme.textSecondary}
            />
            <Text
              style={[
                styles.processingStepText,
                { color: theme.textSecondary },
              ]}
            >
              Confirmando pedido
            </Text>
          </View>
        </View>
      </View>
    );
  }

  // 📝 Formulario de checkout original
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Finalizar Pedido</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Resumen del pedido */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Resumen del Pedido</Text>
          <View style={styles.orderSummary}>
            <Text style={styles.restaurantName}>{restaurant?.name}</Text>
            {items.map((item, index) => (
              <View key={index} style={styles.orderItem}>
                <Text style={styles.orderItemName}>
                  {item.quantity}x {item.product.name}
                </Text>
                <Text style={styles.orderItemPrice}>
                  {formatPrice(item.subtotal)}
                </Text>
              </View>
            ))}
            <View style={styles.totalSection}>
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Subtotal:</Text>
                <Text style={styles.totalValue}>{formatPrice(total)}</Text>
              </View>
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Envío:</Text>
                <Text style={styles.totalValue}>
                  {formatPrice(deliveryFee)}
                </Text>
              </View>
              <View style={[styles.totalRow, styles.finalTotalRow]}>
                <Text style={styles.finalTotalLabel}>Total:</Text>
                <Text style={styles.finalTotalValue}>
                  {formatPrice(finalTotal)}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Información de entrega */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Información de Entrega</Text>
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Dirección de entrega *</Text>
            <TextInput
              style={styles.textInput}
              value={deliveryAddress}
              onChangeText={setDeliveryAddress}
              placeholder="Ingresa tu dirección completa"
              placeholderTextColor={theme.textSecondary}
              multiline
            />
          </View>
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Teléfono *</Text>
            <TextInput
              style={styles.textInput}
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              placeholder="Ej: 8888-8888"
              placeholderTextColor={theme.textSecondary}
              keyboardType="phone-pad"
            />
          </View>
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Instrucciones especiales</Text>
            <TextInput
              style={[styles.textInput, styles.textAreaInput]}
              value={specialInstructions}
              onChangeText={setSpecialInstructions}
              placeholder="Ej: Casa azul, tocar el timbre..."
              placeholderTextColor={theme.textSecondary}
              multiline
              numberOfLines={3}
            />
          </View>
        </View>

        {/* Método de pago */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Método de Pago</Text>
          <TouchableOpacity
            style={[
              styles.paymentOption,
              paymentMethod === "card" && styles.paymentOptionSelected,
            ]}
            onPress={() => setPaymentMethod("card")}
          >
            <Ionicons name="card-outline" size={24} color={theme.primary} />
            <Text style={styles.paymentOptionText}>
              Tarjeta de Crédito/Débito
            </Text>
            <Ionicons
              name={
                paymentMethod === "card"
                  ? "radio-button-on"
                  : "radio-button-off"
              }
              size={24}
              color={theme.primary}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.paymentOption,
              paymentMethod === "cash" && styles.paymentOptionSelected,
            ]}
            onPress={() => setPaymentMethod("cash")}
          >
            <Ionicons name="cash-outline" size={24} color={theme.primary} />
            <Text style={styles.paymentOptionText}>Efectivo</Text>
            <Ionicons
              name={
                paymentMethod === "cash"
                  ? "radio-button-on"
                  : "radio-button-off"
              }
              size={24}
              color={theme.primary}
            />
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Botón de confirmar */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.confirmButton}
          onPress={handlePlaceOrder}
        >
          <Text style={styles.confirmButtonText}>
            Confirmar Pedido - {formatPrice(finalTotal)}
          </Text>
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
      paddingTop: 50,
      paddingBottom: 20,
      paddingHorizontal: 20,
      backgroundColor: theme.cardBackground,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    headerTitle: {
      fontSize: 20,
      fontWeight: "bold",
      color: theme.text,
    },
    content: {
      flex: 1,
    },
    section: {
      backgroundColor: theme.cardBackground,
      margin: 20,
      marginBottom: 0,
      padding: 20,
      borderRadius: 12,
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

    // Resumen del pedido
    orderSummary: {
      gap: 12,
    },
    restaurantName: {
      fontSize: 16,
      fontWeight: "600",
      color: theme.primary,
      marginBottom: 8,
    },
    orderItem: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    orderItemName: {
      fontSize: 14,
      color: theme.text,
      flex: 1,
    },
    orderItemPrice: {
      fontSize: 14,
      fontWeight: "600",
      color: theme.text,
    },
    totalSection: {
      marginTop: 16,
      paddingTop: 16,
      borderTopWidth: 1,
      borderTopColor: theme.border,
    },
    totalRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 8,
    },
    totalLabel: {
      fontSize: 14,
      color: theme.textSecondary,
    },
    totalValue: {
      fontSize: 14,
      color: theme.text,
    },
    finalTotalRow: {
      marginTop: 8,
      paddingTop: 8,
      borderTopWidth: 1,
      borderTopColor: theme.border,
    },
    finalTotalLabel: {
      fontSize: 18,
      fontWeight: "bold",
      color: theme.text,
    },
    finalTotalValue: {
      fontSize: 18,
      fontWeight: "bold",
      color: theme.primary,
    },

    // Formulario
    inputContainer: {
      marginBottom: 16,
    },
    inputLabel: {
      fontSize: 14,
      fontWeight: "600",
      color: theme.text,
      marginBottom: 8,
    },
    textInput: {
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 8,
      padding: 12,
      fontSize: 16,
      color: theme.text,
      backgroundColor: theme.background,
    },
    textAreaInput: {
      height: 80,
      textAlignVertical: "top",
    },

    // Métodos de pago
    paymentOption: {
      flexDirection: "row",
      alignItems: "center",
      padding: 16,
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 8,
      marginBottom: 12,
      gap: 12,
    },
    paymentOptionSelected: {
      borderColor: theme.primary,
      backgroundColor: theme.primary + "10",
    },
    paymentOptionText: {
      flex: 1,
      fontSize: 16,
      color: theme.text,
    },

    // Footer
    footer: {
      padding: 20,
      backgroundColor: theme.cardBackground,
      borderTopWidth: 1,
      borderTopColor: theme.border,
    },
    confirmButton: {
      backgroundColor: theme.primary,
      borderRadius: 12,
      paddingVertical: 16,
      alignItems: "center",
    },
    confirmButtonText: {
      color: "white",
      fontSize: 18,
      fontWeight: "bold",
    },

    // 🔄 Pantalla de procesando
    processingContainer: {
      flex: 1,
      backgroundColor: theme.background,
      justifyContent: "center",
      alignItems: "center",
      padding: 40,
    },
    processingTitle: {
      fontSize: 24,
      fontWeight: "bold",
      color: theme.text,
      marginTop: 20,
      marginBottom: 8,
    },
    processingSubtitle: {
      fontSize: 16,
      color: theme.textSecondary,
      textAlign: "center",
      marginBottom: 40,
    },
    processingSteps: {
      gap: 20,
      alignItems: "flex-start",
    },
    processingStep: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
    },
    processingStepText: {
      fontSize: 16,
      color: theme.primary,
    },

    // 🎉 Pantalla de éxito
    successContainer: {
      flex: 1,
      backgroundColor: theme.background,
      justifyContent: "center",
      alignItems: "center",
      padding: 40,
    },
    successCheckContainer: {
      marginBottom: 30,
    },
    successTitle: {
      fontSize: 28,
      fontWeight: "bold",
      color: theme.text,
      marginBottom: 12,
      textAlign: "center",
    },
    successSubtitle: {
      fontSize: 16,
      color: theme.textSecondary,
      textAlign: "center",
      marginBottom: 40,
    },
    orderInfoCard: {
      backgroundColor: theme.cardBackground,
      borderRadius: 16,
      padding: 24,
      marginBottom: 40,
      alignItems: "center",
      shadowColor: theme.shadow,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 4,
    },
    orderNumberText: {
      fontSize: 18,
      fontWeight: "bold",
      color: theme.text,
      marginBottom: 8,
    },
    totalText: {
      fontSize: 20,
      fontWeight: "bold",
      color: theme.primary,
      marginBottom: 8,
    },
    estimatedTimeText: {
      fontSize: 14,
      color: theme.textSecondary,
    },
    successActions: {
      width: "100%",
      gap: 16,
    },
    viewOrderButton: {
      backgroundColor: theme.primary,
      borderRadius: 12,
      paddingVertical: 16,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
    },
    viewOrderButtonText: {
      color: "white",
      fontSize: 16,
      fontWeight: "bold",
    },
    backHomeButton: {
      backgroundColor: "transparent",
      borderWidth: 2,
      borderColor: theme.primary,
      borderRadius: 12,
      paddingVertical: 16,
      alignItems: "center",
    },
    backHomeButtonText: {
      color: theme.primary,
      fontSize: 16,
      fontWeight: "bold",
    },
  });

export default CheckoutScreen;
