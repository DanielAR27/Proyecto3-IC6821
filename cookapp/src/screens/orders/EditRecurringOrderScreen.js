import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Alert,
  Switch,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../context/ThemeContext";
import { useRecurringOrders } from "../../context/RecurringOrderContext";
import RecurringOrderSetup from "../../components/RecurringOrderSetup";

const EditRecurringOrderScreen = ({ navigation, route }) => {
  const { theme } = useTheme();
  const { updateRecurringOrder, toggleRecurringOrder, deleteRecurringOrder } =
    useRecurringOrders();
  const { orderId, order } = route.params;

  const [currentOrder, setCurrentOrder] = useState(order);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [isActive, setIsActive] = useState(order.isActive);

  const styles = createStyles(theme);

  useEffect(() => {
    setCurrentOrder(order);
    setIsActive(order.isActive);
  }, [order]);

  const formatPrice = (price) => {
    return `₡${parseFloat(price).toLocaleString("es-CR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "No programado";
    const date = new Date(dateString);
    return date.toLocaleDateString("es-CR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getFrequencyDescription = (config) => {
    const { frequency, hour, minute, days, customDays } = config;
    const time = `${hour.toString().padStart(2, "0")}:${minute
      .toString()
      .padStart(2, "0")}`;
    const dayNames = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

    switch (frequency) {
      case "daily":
        return `Diario a las ${time}`;
      case "weekly":
        const selectedDayNames = days.map((d) => dayNames[d]).join(", ");
        return `${selectedDayNames} a las ${time}`;
      case "monthly":
        return `Mensual a las ${time}`;
      case "custom":
        return `Cada ${customDays} días a las ${time}`;
      default:
        return "Configuración personalizada";
    }
  };

  const handleToggleActive = (value) => {
    setIsActive(value);
    toggleRecurringOrder(orderId);

    // Actualizar el estado local
    const updatedOrder = { ...currentOrder, isActive: value };
    setCurrentOrder(updatedOrder);
  };

  const handleUpdateConfig = (newConfig) => {
    // Calcular nueva próxima ejecución (función básica)
    const calculateNextExecution = (config) => {
      const now = new Date();
      const { frequency, hour, minute, customDays } = config;

      const nextDate = new Date(now);
      nextDate.setHours(hour, minute, 0, 0);

      switch (frequency) {
        case "daily":
          if (nextDate <= now) {
            nextDate.setDate(nextDate.getDate() + 1);
          }
          break;
        case "weekly":
          nextDate.setDate(nextDate.getDate() + 7);
          break;
        case "monthly":
          nextDate.setMonth(nextDate.getMonth() + 1);
          break;
        case "custom":
          nextDate.setDate(nextDate.getDate() + (customDays || 7));
          break;
      }

      return nextDate.toISOString();
    };

    const updates = {
      recurringConfig: newConfig,
      nextExecution: isActive ? calculateNextExecution(newConfig) : null,
    };

    updateRecurringOrder(orderId, updates);

    // Actualizar estado local
    const updatedOrder = { ...currentOrder, ...updates };
    setCurrentOrder(updatedOrder);

    Alert.alert(
      "Configuración actualizada",
      "Los cambios se han guardado correctamente.",
      [{ text: "OK" }]
    );
  };

  const handleDelete = () => {
    Alert.alert(
      "Eliminar pedido recurrente",
      `¿Estás seguro de que quieres eliminar este pedido recurrente? Esta acción no se puede deshacer.`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: () => {
            deleteRecurringOrder(orderId);
            navigation.goBack();
            Alert.alert("Eliminado", "El pedido recurrente ha sido eliminado.");
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Editar Pedido</Text>
        <TouchableOpacity onPress={handleDelete}>
          <Ionicons name="trash-outline" size={24} color={theme.danger} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Estado del pedido */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Estado del pedido</Text>
            <Switch
              value={isActive}
              onValueChange={handleToggleActive}
              trackColor={{ false: theme.border, true: theme.primary + "40" }}
              thumbColor={isActive ? theme.primary : theme.textSecondary}
            />
          </View>
          <Text style={styles.sectionSubtitle}>
            {isActive
              ? "El pedido está activo y se ejecutará automáticamente"
              : "El pedido está pausado"}
          </Text>
        </View>

        {/* Información del restaurante */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Restaurante</Text>
          <View style={styles.restaurantInfo}>
            <Ionicons name="restaurant" size={20} color={theme.primary} />
            <Text style={styles.restaurantName}>
              {currentOrder.restaurant?.name || "Restaurante"}
            </Text>
          </View>
        </View>

        {/* Items del pedido */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Items del pedido</Text>
          {currentOrder.items?.map((item, index) => (
            <View key={index} style={styles.itemRow}>
              <Text style={styles.itemName}>
                {item.quantity}x {item.product.name}
              </Text>
              <Text style={styles.itemPrice}>{formatPrice(item.subtotal)}</Text>
            </View>
          ))}
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total:</Text>
            <Text style={styles.totalValue}>
              {formatPrice(currentOrder.total)}
            </Text>
          </View>
        </View>

        {/* Configuración de repetición */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Configuración de repetición</Text>
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => setShowConfigModal(true)}
            >
              <Ionicons name="create-outline" size={20} color={theme.primary} />
              <Text style={styles.editButtonText}>Editar</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.configInfo}>
            <View style={styles.configRow}>
              <Ionicons name="repeat" size={16} color={theme.primary} />
              <Text style={styles.configText}>
                {getFrequencyDescription(currentOrder.recurringConfig)}
              </Text>
            </View>
            <View style={styles.configRow}>
              <Ionicons name="time" size={16} color={theme.textSecondary} />
              <Text style={styles.configText}>
                Próxima ejecución: {formatDate(currentOrder.nextExecution)}
              </Text>
            </View>
          </View>
        </View>

        {/* Dirección de entrega */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Dirección de entrega</Text>
          <View style={styles.addressInfo}>
            <Ionicons name="location" size={16} color={theme.primary} />
            <View style={styles.addressDetails}>
              <Text style={styles.addressName}>
                {currentOrder.deliveryAddress?.name || "Dirección principal"}
              </Text>
              <Text style={styles.addressText}>
                {currentOrder.deliveryAddress?.street ||
                  "Sin dirección especificada"}
              </Text>
              {currentOrder.deliveryAddress?.city && (
                <Text style={styles.addressText}>
                  {currentOrder.deliveryAddress.city},{" "}
                  {currentOrder.deliveryAddress.province}
                </Text>
              )}
            </View>
          </View>
        </View>

        {/* Método de pago */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Método de pago</Text>
          <View style={styles.paymentInfo}>
            <Ionicons
              name={
                currentOrder.paymentMethod?.type === "card"
                  ? "card"
                  : currentOrder.paymentMethod?.type === "wallet"
                  ? "wallet"
                  : "cash"
              }
              size={16}
              color={theme.primary}
            />
            <Text style={styles.paymentText}>
              {currentOrder.paymentMethod?.type === "card" &&
                `${currentOrder.paymentMethod.data.brand} •••• ${currentOrder.paymentMethod.data.last4}`}
              {currentOrder.paymentMethod?.type === "wallet" && "Mi Billetera"}
              {currentOrder.paymentMethod?.type === "cash" && "Efectivo"}
            </Text>
          </View>
        </View>

        {/* Estadísticas */}
        {currentOrder.executionCount > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Estadísticas</Text>
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>
                  {currentOrder.executionCount}
                </Text>
                <Text style={styles.statLabel}>Ejecutado</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>
                  {formatPrice(
                    (currentOrder.total || 0) *
                      (currentOrder.executionCount || 0)
                  )}
                </Text>
                <Text style={styles.statLabel}>Total gastado</Text>
              </View>
            </View>
            {currentOrder.lastExecuted && (
              <Text style={styles.lastExecutionText}>
                Última ejecución: {formatDate(currentOrder.lastExecuted)}
              </Text>
            )}
          </View>
        )}

        {/* Botón de eliminar */}
        <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
          <Ionicons name="trash-outline" size={20} color="white" />
          <Text style={styles.deleteButtonText}>
            Eliminar pedido recurrente
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Modal de configuración */}
      <RecurringOrderSetup
        visible={showConfigModal}
        onClose={() => setShowConfigModal(false)}
        onSave={handleUpdateConfig}
        theme={theme}
        isEnabled={true}
        onToggle={() => {}} // No necesario aquí
        initialConfig={currentOrder.recurringConfig}
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
      padding: 20,
    },
    section: {
      backgroundColor: theme.cardBackground,
      borderRadius: 12,
      padding: 20,
      marginBottom: 16,
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
      marginBottom: 8,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: "bold",
      color: theme.text,
    },
    sectionSubtitle: {
      fontSize: 14,
      color: theme.textSecondary,
      marginTop: 4,
    },
    restaurantInfo: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      marginTop: 8,
    },
    restaurantName: {
      fontSize: 16,
      fontWeight: "600",
      color: theme.text,
    },
    itemRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 8,
    },
    itemName: {
      fontSize: 14,
      color: theme.text,
      flex: 1,
    },
    itemPrice: {
      fontSize: 14,
      fontWeight: "600",
      color: theme.text,
    },
    totalRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginTop: 12,
      paddingTop: 12,
      borderTopWidth: 1,
      borderTopColor: theme.border,
    },
    totalLabel: {
      fontSize: 16,
      fontWeight: "bold",
      color: theme.text,
    },
    totalValue: {
      fontSize: 16,
      fontWeight: "bold",
      color: theme.primary,
    },
    editButton: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      paddingHorizontal: 8,
      paddingVertical: 4,
    },
    editButtonText: {
      fontSize: 14,
      color: theme.primary,
      fontWeight: "600",
    },
    configInfo: {
      gap: 8,
      marginTop: 8,
    },
    configRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    configText: {
      fontSize: 14,
      color: theme.textSecondary,
    },
    addressInfo: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: 12,
      marginTop: 8,
    },
    addressDetails: {
      flex: 1,
    },
    addressName: {
      fontSize: 16,
      fontWeight: "600",
      color: theme.text,
      marginBottom: 4,
    },
    addressText: {
      fontSize: 14,
      color: theme.textSecondary,
      marginBottom: 2,
    },
    paymentInfo: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      marginTop: 8,
    },
    paymentText: {
      fontSize: 16,
      color: theme.text,
    },
    statsGrid: {
      flexDirection: "row",
      gap: 16,
      marginTop: 12,
    },
    statItem: {
      flex: 1,
      alignItems: "center",
      padding: 12,
      backgroundColor: theme.background,
      borderRadius: 8,
    },
    statNumber: {
      fontSize: 18,
      fontWeight: "bold",
      color: theme.primary,
      marginBottom: 4,
    },
    statLabel: {
      fontSize: 12,
      color: theme.textSecondary,
      textAlign: "center",
    },
    lastExecutionText: {
      fontSize: 12,
      color: theme.textSecondary,
      textAlign: "center",
      marginTop: 8,
    },
    deleteButton: {
      backgroundColor: theme.danger,
      borderRadius: 12,
      padding: 16,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      marginTop: 20,
      marginBottom: 40,
    },
    deleteButtonText: {
      color: "white",
      fontSize: 16,
      fontWeight: "600",
    },
  });

export default EditRecurringOrderScreen;
