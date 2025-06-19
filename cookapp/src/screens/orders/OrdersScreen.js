import React, { useState, useEffect, useCallback } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../context/ThemeContext";
import { useFocusEffect } from "@react-navigation/native";
import { getUserOrders, cancelOrder } from "../../services/cartService";

const OrdersScreen = ({ user }) => {
  const { theme } = useTheme();
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const styles = createStyles(theme);

  // Cargar órdenes cuando la pantalla obtiene foco
  useFocusEffect(
    useCallback(() => {
      if (user?.id) {
        loadOrders();
      }
    }, [user?.id])
  );

  const loadOrders = async (showRefreshing = false) => {
    if (!user?.id) return;

    try {
      if (showRefreshing) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }

      const userOrders = await getUserOrders(user.id);
      setOrders(userOrders || []);
    } catch (error) {
      console.error("Error loading orders:", error);
      Alert.alert("Error", "No se pudieron cargar los pedidos");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const onRefresh = () => {
    loadOrders(true);
  };

  const handleCancelOrder = (orderId, orderNumber) => {
    Alert.alert(
      "Cancelar Pedido",
      `¿Estás seguro de que quieres cancelar el pedido #${orderNumber}?`,
      [
        { text: "No", style: "cancel" },
        {
          text: "Sí, Cancelar",
          style: "destructive",
          onPress: async () => {
            try {
              await cancelOrder(orderId, user.id);
              Alert.alert("Éxito", "Pedido cancelado correctamente");
              loadOrders();
            } catch (error) {
              Alert.alert("Error", "No se pudo cancelar el pedido");
            }
          },
        },
      ]
    );
  };

  const getStatusInfo = (status) => {
    switch (status.toLowerCase()) {
      case "pending":
        return {
          text: "Pendiente",
          color: theme.warning,
          icon: "time-outline",
          canCancel: true,
        };
      case "confirmed":
        return {
          text: "Confirmado",
          color: theme.primary,
          icon: "checkmark-circle-outline",
          canCancel: true,
        };
      case "preparing":
        return {
          text: "Preparando",
          color: "#FF8C00",
          icon: "restaurant-outline",
          canCancel: false,
        };
      case "ready":
        return {
          text: "Listo",
          color: theme.success,
          icon: "bag-check-outline",
          canCancel: false,
        };
      case "delivered":
        return {
          text: "Entregado",
          color: theme.success,
          icon: "checkmark-done-outline",
          canCancel: false,
        };
      case "cancelled":
        return {
          text: "Cancelado",
          color: theme.danger,
          icon: "close-circle-outline",
          canCancel: false,
        };
      default:
        return {
          text: "Desconocido",
          color: theme.textSecondary,
          icon: "help-circle-outline",
          canCancel: false,
        };
    }
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
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const renderOrderCard = (order) => {
    const statusInfo = getStatusInfo(order.status);
    const itemCount =
      order.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;

    return (
      <View key={order.id} style={styles.orderCard}>
        <View style={styles.orderHeader}>
          <View style={styles.orderInfo}>
            <Text style={styles.orderNumber}>Pedido #{order.id}</Text>
            <Text style={styles.orderDate}>{formatDate(order.created_at)}</Text>
          </View>
          <View
            style={[styles.statusBadge, { backgroundColor: statusInfo.color }]}
          >
            <Ionicons name={statusInfo.icon} size={14} color="white" />
            <Text style={styles.statusText}>{statusInfo.text}</Text>
          </View>
        </View>

        <View style={styles.restaurantInfo}>
          <Ionicons name="restaurant-outline" size={16} color={theme.primary} />
          <Text style={styles.restaurantName}>{order.restaurant_name}</Text>
        </View>

        <View style={styles.orderDetails}>
          <Text style={styles.itemsCount}>
            {itemCount} {itemCount === 1 ? "producto" : "productos"}
          </Text>
          <Text style={styles.orderTotal}>{formatPrice(order.total)}</Text>
        </View>

        {order.items && order.items.length > 0 && (
          <View style={styles.itemsList}>
            {order.items.slice(0, 2).map((item, index) => (
              <Text key={index} style={styles.itemText}>
                {item.quantity}x {item.product_name}
              </Text>
            ))}
            {order.items.length > 2 && (
              <Text style={styles.moreItemsText}>
                y {order.items.length - 2} más...
              </Text>
            )}
          </View>
        )}

        <View style={styles.orderActions}>
          <TouchableOpacity
            style={styles.detailsButton}
            onPress={() => {
              // Aquí puedes navegar a una pantalla de detalles del pedido
              Alert.alert("Ver Detalles", "Funcionalidad próximamente");
            }}
          >
            <Text style={styles.detailsButtonText}>Ver Detalles</Text>
          </TouchableOpacity>

          {statusInfo.canCancel && (
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => handleCancelOrder(order.id, order.id)}
            >
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Mis Pedidos</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={styles.loadingText}>Cargando pedidos...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mis Pedidos</Text>
      </View>

      {orders.length === 0 ? (
        <ScrollView
          style={styles.scrollContainer}
          refreshControl={
            <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
          }
        >
          <View style={styles.emptyContainer}>
            <Ionicons
              name="receipt-outline"
              size={80}
              color={theme.textSecondary}
            />
            <Text style={styles.emptyTitle}>No tienes pedidos aún</Text>
            <Text style={styles.emptySubtitle}>
              Cuando realices tu primer pedido, aparecerá aquí
            </Text>
          </View>
        </ScrollView>
      ) : (
        <ScrollView
          style={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
          }
        >
          <View style={styles.ordersContainer}>
            {orders.map(renderOrderCard)}
          </View>
        </ScrollView>
      )}
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
      paddingTop: 60,
      paddingBottom: 20,
      paddingHorizontal: 20,
      backgroundColor: theme.cardBackground,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    headerTitle: {
      fontSize: 28,
      fontWeight: "bold",
      color: theme.text,
      textAlign: "center",
    },
    scrollContainer: {
      flex: 1,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },
    loadingText: {
      fontSize: 16,
      color: theme.textSecondary,
      marginTop: 10,
    },
    emptyContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      padding: 20,
      minHeight: 400,
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
    },
    ordersContainer: {
      padding: 20,
    },
    orderCard: {
      backgroundColor: theme.cardBackground,
      borderRadius: 12,
      padding: 16,
      marginBottom: 16,
      shadowColor: theme.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    orderHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      marginBottom: 12,
    },
    orderInfo: {
      flex: 1,
    },
    orderNumber: {
      fontSize: 18,
      fontWeight: "bold",
      color: theme.text,
      marginBottom: 4,
    },
    orderDate: {
      fontSize: 14,
      color: theme.textSecondary,
    },
    statusBadge: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
    },
    statusText: {
      color: "white",
      fontSize: 12,
      fontWeight: "600",
      marginLeft: 4,
    },
    restaurantInfo: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 12,
    },
    restaurantName: {
      fontSize: 16,
      fontWeight: "600",
      color: theme.text,
      marginLeft: 6,
    },
    orderDetails: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 12,
    },
    itemsCount: {
      fontSize: 14,
      color: theme.textSecondary,
    },
    orderTotal: {
      fontSize: 18,
      fontWeight: "bold",
      color: theme.primary,
    },
    itemsList: {
      marginBottom: 16,
    },
    itemText: {
      fontSize: 14,
      color: theme.text,
      marginBottom: 2,
    },
    moreItemsText: {
      fontSize: 14,
      color: theme.textSecondary,
      fontStyle: "italic",
    },
    orderActions: {
      flexDirection: "row",
      justifyContent: "space-between",
    },
    detailsButton: {
      flex: 1,
      backgroundColor: theme.background,
      borderWidth: 1,
      borderColor: theme.primary,
      borderRadius: 8,
      paddingVertical: 10,
      marginRight: 8,
      alignItems: "center",
    },
    detailsButtonText: {
      color: theme.primary,
      fontSize: 14,
      fontWeight: "600",
    },
    cancelButton: {
      flex: 1,
      backgroundColor: theme.danger,
      borderRadius: 8,
      paddingVertical: 10,
      marginLeft: 8,
      alignItems: "center",
    },
    cancelButtonText: {
      color: "white",
      fontSize: 14,
      fontWeight: "600",
    },
  });

export default OrdersScreen;
