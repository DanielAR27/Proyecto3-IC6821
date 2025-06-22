import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../context/ThemeContext";
import { useRecurringOrders } from "../../context/RecurringOrderContext";

const RecurringOrdersScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const {
    recurringOrders,
    loading,
    toggleRecurringOrder,
    deleteRecurringOrder,
    getOrderStats,
    loadRecurringOrders,
  } = useRecurringOrders();

  const [refreshing, setRefreshing] = useState(false);
  const styles = createStyles(theme);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadRecurringOrders();
    setRefreshing(false);
  };

  const formatPrice = (price) => {
    return `₡${parseFloat(price).toLocaleString("es-CR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const formatDate = (dateString) => {
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

  const getNextExecutionText = (nextExecution) => {
    if (!nextExecution) return "Pausado";

    const next = new Date(nextExecution);
    const now = new Date();
    const diffTime = next.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Hoy";
    if (diffDays === 1) return "Mañana";
    if (diffDays < 7) return `En ${diffDays} días`;

    return next.toLocaleDateString("es-CR", {
      day: "2-digit",
      month: "2-digit",
    });
  };

  const handleToggleOrder = (orderId) => {
    toggleRecurringOrder(orderId);
  };

  const handleDeleteOrder = (orderId, orderName) => {
    Alert.alert(
      "Eliminar pedido recurrente",
      `¿Estás seguro de que quieres eliminar "${orderName}"? Esta acción no se puede deshacer.`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: () => deleteRecurringOrder(orderId),
        },
      ]
    );
  };

  const stats = getOrderStats();

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Cargando pedidos recurrentes...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Pedidos Recurrentes</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Estadísticas */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.activeOrders}</Text>
            <Text style={styles.statLabel}>Activos</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.totalExecutions}</Text>
            <Text style={styles.statLabel}>Ejecutados</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>
              {formatPrice(stats.totalSaved)}
            </Text>
            <Text style={styles.statLabel}>Total gastado</Text>
          </View>
        </View>

        {/* Lista de pedidos recurrentes */}
        {recurringOrders.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons
              name="repeat-outline"
              size={64}
              color={theme.textSecondary}
            />
            <Text style={styles.emptyTitle}>No tienes pedidos recurrentes</Text>
            <Text style={styles.emptySubtitle}>
              Configura un pedido recurrente desde el checkout para que aparezca
              aquí
            </Text>
            <TouchableOpacity
              style={styles.createButton}
              onPress={() => navigation.navigate("Home")}
            >
              <Text style={styles.createButtonText}>Explorar Restaurantes</Text>
            </TouchableOpacity>
          </View>
        ) : (
          recurringOrders.map((order) => (
            <View key={order.id} style={styles.orderCard}>
              <View style={styles.orderHeader}>
                <View style={styles.orderTitleContainer}>
                  <Text style={styles.restaurantName}>
                    {order.restaurant?.name}
                  </Text>
                  <View
                    style={[
                      styles.statusBadge,
                      order.isActive
                        ? styles.activeBadge
                        : styles.inactiveBadge,
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusText,
                        order.isActive
                          ? styles.activeText
                          : styles.inactiveText,
                      ]}
                    >
                      {order.isActive ? "Activo" : "Pausado"}
                    </Text>
                  </View>
                </View>
                <Switch
                  value={order.isActive}
                  onValueChange={() => handleToggleOrder(order.id)}
                  trackColor={{
                    false: theme.border,
                    true: theme.primary + "40",
                  }}
                  thumbColor={
                    order.isActive ? theme.primary : theme.textSecondary
                  }
                />
              </View>

              <View style={styles.orderContent}>
                <View style={styles.itemsList}>
                  {order.items?.slice(0, 2).map((item, index) => (
                    <Text key={index} style={styles.itemText}>
                      {item.quantity}x {item.product.name}
                    </Text>
                  ))}
                  {order.items?.length > 2 && (
                    <Text style={styles.moreItems}>
                      +{order.items.length - 2} más
                    </Text>
                  )}
                </View>

                <View style={styles.orderDetails}>
                  <View style={styles.detailRow}>
                    <Ionicons name="repeat" size={16} color={theme.primary} />
                    <Text style={styles.detailText}>
                      {getFrequencyDescription(order.recurringConfig)}
                    </Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Ionicons
                      name="time"
                      size={16}
                      color={theme.textSecondary}
                    />
                    <Text style={styles.detailText}>
                      Próximo: {getNextExecutionText(order.nextExecution)}
                    </Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Ionicons
                      name="location"
                      size={16}
                      color={theme.textSecondary}
                    />
                    <Text style={styles.detailText}>
                      {order.deliveryAddress?.name || "Dirección principal"}
                    </Text>
                  </View>
                </View>

                <View style={styles.orderFooter}>
                  <Text style={styles.totalText}>
                    {formatPrice(order.total)}
                  </Text>
                  <View style={styles.actionButtons}>
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => {
                        // 🆕 Navegar a pantalla de edición
                        navigation.navigate("EditRecurringOrder", {
                          orderId: order.id,
                          order: order,
                        });
                      }}
                    >
                      <Ionicons
                        name="create-outline"
                        size={20}
                        color={theme.primary}
                      />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.actionButton, styles.deleteButton]}
                      onPress={() =>
                        handleDeleteOrder(order.id, order.restaurant?.name)
                      }
                    >
                      <Ionicons
                        name="trash-outline"
                        size={20}
                        color={theme.danger}
                      />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>

              {order.executionCount > 0 && (
                <View style={styles.executionInfo}>
                  <Text style={styles.executionText}>
                    Ejecutado {order.executionCount}{" "}
                    {order.executionCount === 1 ? "vez" : "veces"}
                  </Text>
                  {order.lastExecuted && (
                    <Text style={styles.lastExecutionText}>
                      Último: {formatDate(order.lastExecuted)}
                    </Text>
                  )}
                </View>
              )}
            </View>
          ))
        )}
      </ScrollView>
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
    loadingContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: theme.background,
    },
    loadingText: {
      fontSize: 16,
      color: theme.textSecondary,
    },
    statsContainer: {
      flexDirection: "row",
      marginBottom: 20,
      gap: 12,
    },
    statCard: {
      flex: 1,
      backgroundColor: theme.cardBackground,
      borderRadius: 12,
      padding: 16,
      alignItems: "center",
      shadowColor: theme.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    statNumber: {
      fontSize: 20,
      fontWeight: "bold",
      color: theme.primary,
      marginBottom: 4,
    },
    statLabel: {
      fontSize: 12,
      color: theme.textSecondary,
      textAlign: "center",
    },
    emptyContainer: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 60,
    },
    emptyTitle: {
      fontSize: 20,
      fontWeight: "bold",
      color: theme.text,
      marginTop: 16,
      marginBottom: 8,
    },
    emptySubtitle: {
      fontSize: 14,
      color: theme.textSecondary,
      textAlign: "center",
      marginBottom: 24,
      paddingHorizontal: 40,
    },
    createButton: {
      backgroundColor: theme.primary,
      paddingVertical: 12,
      paddingHorizontal: 24,
      borderRadius: 24,
    },
    createButtonText: {
      color: "white",
      fontSize: 16,
      fontWeight: "600",
    },
    orderCard: {
      backgroundColor: theme.cardBackground,
      borderRadius: 12,
      marginBottom: 16,
      shadowColor: theme.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
      overflow: "hidden",
    },
    orderHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    orderTitleContainer: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
    },
    restaurantName: {
      fontSize: 18,
      fontWeight: "bold",
      color: theme.text,
    },
    statusBadge: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
    },
    activeBadge: {
      backgroundColor: "#10b981" + "20",
    },
    inactiveBadge: {
      backgroundColor: theme.textSecondary + "20",
    },
    statusText: {
      fontSize: 12,
      fontWeight: "600",
    },
    activeText: {
      color: "#10b981",
    },
    inactiveText: {
      color: theme.textSecondary,
    },
    orderContent: {
      padding: 16,
    },
    itemsList: {
      marginBottom: 12,
    },
    itemText: {
      fontSize: 14,
      color: theme.text,
      marginBottom: 2,
    },
    moreItems: {
      fontSize: 14,
      color: theme.textSecondary,
      fontStyle: "italic",
    },
    orderDetails: {
      marginBottom: 16,
      gap: 6,
    },
    detailRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    detailText: {
      fontSize: 14,
      color: theme.textSecondary,
    },
    orderFooter: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    totalText: {
      fontSize: 18,
      fontWeight: "bold",
      color: theme.primary,
    },
    actionButtons: {
      flexDirection: "row",
      gap: 8,
    },
    actionButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.background,
    },
    deleteButton: {
      backgroundColor: theme.danger + "10",
    },
    executionInfo: {
      backgroundColor: theme.background,
      padding: 12,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    executionText: {
      fontSize: 12,
      color: theme.textSecondary,
    },
    lastExecutionText: {
      fontSize: 12,
      color: theme.textSecondary,
    },
  });

export default RecurringOrdersScreen;
