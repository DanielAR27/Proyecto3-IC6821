import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Animated,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTheme } from "../../context/ThemeContext";
import { useCart } from "../../context/CartContext";
import { useOrders } from "../../context/OrderContext";
// 🆕 Importar el contexto de pedidos recurrentes
import { useRecurringOrders } from "../../context/RecurringOrderContext";
// 🆕 Importar el componente de configuración
import RecurringOrderSetup from "../../components/RecurringOrderSetup";

const CheckoutScreen = ({ navigation, route }) => {
  const { theme } = useTheme();
  const { items, total, restaurant, clearCart } = useCart();
  const { addOrder } = useOrders();
  // 🆕 Hook para pedidos recurrentes
  const { createRecurringOrder } = useRecurringOrders();

  // Usuario desde parámetros de navegación o AsyncStorage
  const [currentUser, setCurrentUser] = useState(route?.params?.user || null);

  // Estados para el flujo de checkout
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [orderId, setOrderId] = useState(null);

  // Estados para los datos cargados del perfil
  const [addresses, setAddresses] = useState([]);
  const [cards, setCards] = useState([]);
  const [balance, setBalance] = useState(0);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null);
  const [loading, setLoading] = useState(true);

  // 🆕 Estados para pedidos recurrentes
  const [isRecurringEnabled, setIsRecurringEnabled] = useState(false);
  const [recurringConfig, setRecurringConfig] = useState(null);
  const [showRecurringSetup, setShowRecurringSetup] = useState(false);

  // Animación para el check
  const [checkScale] = useState(new Animated.Value(0));

  const styles = createStyles(theme);

  const deliveryFee = 1500;
  const finalTotal = total + deliveryFee;

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      setLoading(true);

      // Si no viene usuario en params, cargar desde AsyncStorage
      let userToUse = currentUser;
      if (!userToUse) {
        const userData = await AsyncStorage.getItem("@user");
        if (userData) {
          userToUse = JSON.parse(userData);
          setCurrentUser(userToUse);
        } else {
          Alert.alert(
            "Error",
            "No se encontró información del usuario. Por favor inicia sesión nuevamente."
          );
          navigation.goBack();
          return;
        }
      }

      // Cargar direcciones
      const savedAddresses = await AsyncStorage.getItem(
        `@addresses_${userToUse._id}`
      );
      if (savedAddresses) {
        const addressList = JSON.parse(savedAddresses);
        setAddresses(addressList);
        // Seleccionar la dirección por defecto
        const defaultAddress = addressList.find((addr) => addr.is_default);
        setSelectedAddress(defaultAddress || addressList[0]);
      }

      // Cargar tarjetas
      const savedCards = await AsyncStorage.getItem(`@cards_${userToUse._id}`);
      if (savedCards) {
        const cardList = JSON.parse(savedCards);
        setCards(cardList);
        // Seleccionar la tarjeta por defecto
        const defaultCard = cardList.find((card) => card.isDefault);
        if (defaultCard) {
          setSelectedPaymentMethod({ type: "card", data: defaultCard });
        }
      }

      // Cargar balance de billetera
      const savedBalance = await AsyncStorage.getItem(
        `@balance_${userToUse._id}`
      );
      if (savedBalance) {
        const userBalance = parseFloat(savedBalance);
        setBalance(userBalance);

        // Si no hay tarjeta por defecto pero hay saldo, usar billetera
        if (!selectedPaymentMethod && userBalance >= finalTotal) {
          setSelectedPaymentMethod({
            type: "wallet",
            data: { balance: userBalance },
          });
        }
      }

      // Si no hay métodos de pago, usar efectivo por defecto
      if (!selectedPaymentMethod) {
        setSelectedPaymentMethod({ type: "cash", data: {} });
      }
    } catch (error) {
      console.error("Error loading user data:", error);
      Alert.alert("Error", "No se pudieron cargar los datos del perfil");
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => {
    return `₡${parseFloat(price).toLocaleString("es-CR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const validateOrder = () => {
    if (!selectedAddress) {
      Alert.alert(
        "Dirección requerida",
        "Por favor selecciona una dirección de entrega",
        [
          {
            text: "Ir a Direcciones",
            onPress: () =>
              navigation.navigate("Profile", { screen: "AddressManagement" }),
          },
          { text: "Cancelar", style: "cancel" },
        ]
      );
      return false;
    }

    if (!selectedPaymentMethod) {
      Alert.alert(
        "Método de pago requerido",
        "Por favor selecciona un método de pago",
        [
          {
            text: "Ir a Métodos de Pago",
            onPress: () =>
              navigation.navigate("Profile", { screen: "PaymentMethods" }),
          },
          { text: "Cancelar", style: "cancel" },
        ]
      );
      return false;
    }

    // Verificar saldo si usa billetera
    if (selectedPaymentMethod.type === "wallet" && balance < finalTotal) {
      Alert.alert(
        "Saldo insuficiente",
        `Tu saldo actual es ${formatPrice(balance)}. Necesitas ${formatPrice(
          finalTotal - balance
        )} más.`,
        [
          {
            text: "Recargar Saldo",
            onPress: () =>
              navigation.navigate("Profile", { screen: "PaymentMethods" }),
          },
          { text: "Cambiar Método", style: "cancel" },
        ]
      );
      return false;
    }

    return true;
  };

  // 🆕 Manejar toggle de pedido recurrente
  const handleRecurringToggle = (value) => {
    setIsRecurringEnabled(value);
    if (value && !recurringConfig) {
      setShowRecurringSetup(true);
    }
  };

  // 🆕 Guardar configuración de pedido recurrente
  const handleRecurringConfigSave = (config) => {
    setRecurringConfig(config);
    console.log("🔄 Recurring config saved:", config);
  };

  // 🆕 Obtener descripción del pedido recurrente
  const getRecurringDescription = () => {
    if (!recurringConfig) return "Configurar repetición";

    const { frequency, hour, minute, days, customDays } = recurringConfig;
    const time = `${hour.toString().padStart(2, "0")}:${minute
      .toString()
      .padStart(2, "0")}`;

    switch (frequency) {
      case "daily":
        return `Diario a las ${time}`;
      case "weekly":
        const dayNames = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
        const selectedDayNames = days.map((d) => dayNames[d]).join(", ");
        return `${selectedDayNames} a las ${time}`;
      case "monthly":
        return `Mensual a las ${time}`;
      case "custom":
        return `Cada ${customDays} días a las ${time}`;
      default:
        return "Configurar repetición";
    }
  };

  const handlePlaceOrder = async () => {
    if (!validateOrder()) return;

    // 1. Mostrar "Procesando..."
    setIsProcessing(true);

    try {
      // Simular procesamiento de pago (2 segundos)
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // 2. Si usa billetera, descontar del saldo
      if (selectedPaymentMethod.type === "wallet") {
        const newBalance = balance - finalTotal;
        await AsyncStorage.setItem(
          `@balance_${currentUser._id}`,
          newBalance.toString()
        );
        setBalance(newBalance);
      }

      // 3. Crear la orden
      const orderData = {
        items,
        restaurant,
        total: finalTotal,
        deliveryAddress: selectedAddress,
        phoneNumber: currentUser.phone || "No especificado",
        paymentMethod: selectedPaymentMethod,
        estimatedDeliveryTime: new Date(
          Date.now() + 30 * 60 * 1000
        ).toISOString(),
      };

      const newOrderId = addOrder(orderData);
      setOrderId(newOrderId);

      // 🆕 4. Si está habilitado el pedido recurrente, crearlo
      if (isRecurringEnabled && recurringConfig) {
        const recurringOrderId = createRecurringOrder(
          orderData,
          recurringConfig
        );
        console.log("🔄 Recurring order created:", recurringOrderId);

        // Mostrar confirmación adicional
        setTimeout(() => {
          Alert.alert(
            "¡Pedido recurrente configurado!",
            "Tu pedido se repetirá automáticamente según la configuración seleccionada. Puedes gestionar tus pedidos recurrentes desde 'Mis Pedidos'.",
            [{ text: "Entendido" }]
          );
        }, 2000);
      }

      // 5. Mostrar pantalla de éxito
      setIsProcessing(false);
      setShowSuccess(true);

      // 6. Animar el check
      Animated.spring(checkScale, {
        toValue: 1,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }).start();

      // 7. Limpiar carrito después de 1 segundo
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
    navigation.navigate("Home");
  };

  const handleViewOrder = () => {
    setShowSuccess(false);
    // 🔧 Navegar a OrderDetail y resetear stack para ir al Home al volver
    navigation.reset({
      index: 0,
      routes: [{ name: "HomeMain" }],
    });
    // Luego navegar a Orders con el detalle específico
    navigation.navigate("Orders", {
      screen: "OrderDetail",
      params: { orderId: orderId },
    });
  };

  const getPaymentMethodDisplay = (method) => {
    if (!method) return "Seleccionar método";

    switch (method.type) {
      case "card":
        return `${method.data.brand} •••• ${method.data.last4}`;
      case "wallet":
        return `Billetera (${formatPrice(balance)})`;
      case "cash":
        return "Efectivo";
      default:
        return "Método desconocido";
    }
  };

  const getPaymentMethodIcon = (method) => {
    if (!method) return "card-outline";

    switch (method.type) {
      case "card":
        return "card";
      case "wallet":
        return "wallet";
      case "cash":
        return "cash";
      default:
        return "card-outline";
    }
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

          {/* 🆕 Mostrar info de recurrencia si está configurada */}
          {isRecurringEnabled && recurringConfig && (
            <View style={styles.recurringInfo}>
              <Ionicons name="repeat" size={16} color={theme.primary} />
              <Text style={styles.recurringInfoText}>
                Pedido recurrente: {getRecurringDescription()}
              </Text>
            </View>
          )}
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

  // 📝 Pantalla de checkout principal
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.primary} />
        <Text style={styles.loadingText}>Cargando datos del perfil...</Text>
      </View>
    );
  }

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

        {/* 🆕 Sección de Pedido Recurrente */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Pedido Recurrente</Text>
          <TouchableOpacity
            style={[
              styles.recurringOption,
              isRecurringEnabled && styles.recurringOptionEnabled,
            ]}
            onPress={() => setShowRecurringSetup(true)}
          >
            <View style={styles.recurringOptionContent}>
              <Ionicons
                name="repeat"
                size={24}
                color={isRecurringEnabled ? theme.primary : theme.textSecondary}
              />
              <View style={styles.recurringOptionText}>
                <Text style={styles.recurringOptionTitle}>
                  {isRecurringEnabled
                    ? "Repetir automáticamente"
                    : "Configurar repetición"}
                </Text>
                <Text style={styles.recurringOptionSubtitle}>
                  {isRecurringEnabled && recurringConfig
                    ? getRecurringDescription()
                    : "Programa tu pedido para que se repita automáticamente"}
                </Text>
              </View>
            </View>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={theme.textSecondary}
            />
          </TouchableOpacity>

          {isRecurringEnabled && (
            <View style={styles.recurringBenefits}>
              <View style={styles.benefitItem}>
                <Ionicons name="checkmark-circle" size={16} color="#10b981" />
                <Text style={styles.benefitText}>
                  Sin comisiones adicionales
                </Text>
              </View>
              <View style={styles.benefitItem}>
                <Ionicons name="checkmark-circle" size={16} color="#10b981" />
                <Text style={styles.benefitText}>
                  Puedes pausar en cualquier momento
                </Text>
              </View>
              <View style={styles.benefitItem}>
                <Ionicons name="checkmark-circle" size={16} color="#10b981" />
                <Text style={styles.benefitText}>
                  Mismo método de pago y dirección
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* Dirección de entrega */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Dirección de Entrega</Text>
            <TouchableOpacity
              onPress={() =>
                navigation.navigate("Profile", { screen: "AddressManagement" })
              }
            >
              <Ionicons name="add-circle" size={24} color={theme.primary} />
            </TouchableOpacity>
          </View>

          {addresses.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons
                name="location-outline"
                size={32}
                color={theme.textSecondary}
              />
              <Text style={styles.emptyStateText}>
                No tienes direcciones guardadas
              </Text>
              <TouchableOpacity
                style={styles.addButton}
                onPress={() =>
                  navigation.navigate("Profile", {
                    screen: "AddressManagement",
                  })
                }
              >
                <Text style={styles.addButtonText}>Agregar Dirección</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {addresses.map((address) => (
                <TouchableOpacity
                  key={address.id}
                  style={[
                    styles.addressCard,
                    selectedAddress?.id === address.id && styles.selectedCard,
                  ]}
                  onPress={() => setSelectedAddress(address)}
                >
                  <View style={styles.addressHeader}>
                    <Ionicons name="location" size={20} color={theme.primary} />
                    <Text style={styles.addressName}>{address.name}</Text>
                    {address.is_default && (
                      <View style={styles.defaultBadge}>
                        <Text style={styles.defaultText}>Principal</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.addressText}>{address.street}</Text>
                  <Text style={styles.addressText}>
                    {address.city}, {address.province}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>

        {/* Método de pago */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Método de Pago</Text>
            <TouchableOpacity
              onPress={() =>
                navigation.navigate("Profile", { screen: "PaymentMethods" })
              }
            >
              <Ionicons name="add-circle" size={24} color={theme.primary} />
            </TouchableOpacity>
          </View>

          {/* Billetera */}
          {balance > 0 && (
            <TouchableOpacity
              style={[
                styles.paymentOption,
                selectedPaymentMethod?.type === "wallet" &&
                  styles.selectedPaymentOption,
              ]}
              onPress={() =>
                setSelectedPaymentMethod({ type: "wallet", data: { balance } })
              }
            >
              <Ionicons name="wallet" size={24} color={theme.primary} />
              <View style={styles.paymentOptionContent}>
                <Text style={styles.paymentOptionTitle}>Mi Billetera</Text>
                <Text style={styles.paymentOptionSubtitle}>
                  {formatPrice(balance)} disponible
                </Text>
              </View>
              <Ionicons
                name={
                  selectedPaymentMethod?.type === "wallet"
                    ? "radio-button-on"
                    : "radio-button-off"
                }
                size={24}
                color={theme.primary}
              />
            </TouchableOpacity>
          )}

          {/* Tarjetas */}
          {cards.map((card) => (
            <TouchableOpacity
              key={card.id}
              style={[
                styles.paymentOption,
                selectedPaymentMethod?.type === "card" &&
                  selectedPaymentMethod?.data?.id === card.id &&
                  styles.selectedPaymentOption,
              ]}
              onPress={() =>
                setSelectedPaymentMethod({ type: "card", data: card })
              }
            >
              <Ionicons name="card" size={24} color={theme.primary} />
              <View style={styles.paymentOptionContent}>
                <Text style={styles.paymentOptionTitle}>
                  {card.brand} •••• {card.last4}
                </Text>
                <Text style={styles.paymentOptionSubtitle}>
                  Vence {card.expiry}
                </Text>
              </View>
              <Ionicons
                name={
                  selectedPaymentMethod?.type === "card" &&
                  selectedPaymentMethod?.data?.id === card.id
                    ? "radio-button-on"
                    : "radio-button-off"
                }
                size={24}
                color={theme.primary}
              />
            </TouchableOpacity>
          ))}

          {/* Efectivo */}
          <TouchableOpacity
            style={[
              styles.paymentOption,
              selectedPaymentMethod?.type === "cash" &&
                styles.selectedPaymentOption,
            ]}
            onPress={() => setSelectedPaymentMethod({ type: "cash", data: {} })}
          >
            <Ionicons name="cash" size={24} color={theme.primary} />
            <View style={styles.paymentOptionContent}>
              <Text style={styles.paymentOptionTitle}>Efectivo</Text>
              <Text style={styles.paymentOptionSubtitle}>Pagar al recibir</Text>
            </View>
            <Ionicons
              name={
                selectedPaymentMethod?.type === "cash"
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

      {/* 🆕 Modal de configuración de pedido recurrente */}
      <RecurringOrderSetup
        visible={showRecurringSetup}
        onClose={() => setShowRecurringSetup(false)}
        onSave={handleRecurringConfigSave}
        theme={theme}
        isEnabled={isRecurringEnabled}
        onToggle={handleRecurringToggle}
      />
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
    loadingContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: theme.background,
    },
    loadingText: {
      fontSize: 16,
      color: theme.textSecondary,
      marginTop: 16,
    },

    // Secciones
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
    sectionHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 16,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: "bold",
      color: theme.text,
    },

    // 🆕 Estilos para pedidos recurrentes
    recurringOption: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      padding: 16,
      backgroundColor: theme.background,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: theme.border,
    },
    recurringOptionEnabled: {
      borderColor: theme.primary,
      backgroundColor: theme.primary + "10",
    },
    recurringOptionContent: {
      flexDirection: "row",
      alignItems: "center",
      flex: 1,
    },
    recurringOptionText: {
      marginLeft: 12,
      flex: 1,
    },
    recurringOptionTitle: {
      fontSize: 16,
      fontWeight: "600",
      color: theme.text,
    },
    recurringOptionSubtitle: {
      fontSize: 14,
      color: theme.textSecondary,
      marginTop: 2,
    },
    recurringBenefits: {
      marginTop: 12,
      padding: 12,
      backgroundColor: theme.background,
      borderRadius: 8,
      gap: 8,
    },
    benefitItem: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    benefitText: {
      fontSize: 13,
      color: theme.text,
    },
    recurringInfo: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      marginTop: 8,
      padding: 8,
      backgroundColor: theme.primary + "10",
      borderRadius: 6,
    },
    recurringInfoText: {
      fontSize: 12,
      color: theme.primary,
      fontWeight: "500",
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

    // Estados vacíos
    emptyState: {
      alignItems: "center",
      padding: 20,
    },
    emptyStateText: {
      fontSize: 14,
      color: theme.textSecondary,
      marginTop: 8,
      marginBottom: 16,
    },
    addButton: {
      backgroundColor: theme.primary,
      paddingVertical: 8,
      paddingHorizontal: 16,
      borderRadius: 20,
    },
    addButtonText: {
      color: "white",
      fontSize: 14,
      fontWeight: "600",
    },

    // Direcciones
    addressCard: {
      backgroundColor: theme.background,
      borderRadius: 12,
      padding: 16,
      marginRight: 12,
      minWidth: 200,
      borderWidth: 2,
      borderColor: "transparent",
    },
    selectedCard: {
      borderColor: theme.primary,
      backgroundColor: theme.primary + "10",
    },
    addressHeader: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 8,
    },
    addressName: {
      fontSize: 16,
      fontWeight: "600",
      color: theme.text,
      marginLeft: 8,
      flex: 1,
    },
    defaultBadge: {
      backgroundColor: theme.primary,
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 8,
    },
    defaultText: {
      color: "white",
      fontSize: 10,
      fontWeight: "600",
    },
    addressText: {
      fontSize: 12,
      color: theme.textSecondary,
      marginBottom: 2,
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
    selectedPaymentOption: {
      borderColor: theme.primary,
      backgroundColor: theme.primary + "10",
    },
    paymentOptionContent: {
      flex: 1,
    },
    paymentOptionTitle: {
      fontSize: 16,
      fontWeight: "600",
      color: theme.text,
    },
    paymentOptionSubtitle: {
      fontSize: 14,
      color: theme.textSecondary,
      marginTop: 2,
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
