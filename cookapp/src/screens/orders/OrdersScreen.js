import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  FlatList,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../context/ThemeContext";
import { useOrders } from "../../context/OrderContext";

const OrdersScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const { orders, loading, getStatusText, getStatusColor } = useOrders();
  const [refreshing, setRefreshing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState("all");

  const styles = createStyles(theme);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      // Simular actualización (en una app real, aquí harías fetch de la API)
      await new Promise((resolve) => setTimeout(resolve, 1000));
    } catch (error) {
      console.error("Error refreshing orders:", error);
    } finally {
      setRefreshing(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("es-CR", {
      style: "currency",
      currency: "CRC",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("es-CR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("es-CR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getFilteredOrders = () => {
    if (selectedFilter === "all") return orders;
    return orders.filter((order) => order.status === selectedFilter);
  };

  const filters = [
    { key: "all", label: "Todos", icon: "list-outline" },
    { key: "pending", label: "Pendientes", icon: "time-outline" },
    {
      key: "confirmed",
      label: "Confirmados",
      icon: "checkmark-circle-outline",
    },
    { key: "preparing", label: "En Preparación", icon: "restaurant-outline" },
    { key: "ready", label: "Listos", icon: "checkmark-done-outline" },
    { key: "delivered", label: "Entregados", icon: "checkmark-outline" },
  ];

  const renderFilters = () => (
    <View style={styles.filtersContainer}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filtersScroll}
      >
        {filters.map((filter) => (
          <TouchableOpacity
            key={filter.key}
            style={[
              styles.filterItem,
              selectedFilter === filter.key && styles.filterItemActive,
            ]}
            onPress={() => setSelectedFilter(filter.key)}
          >
            <Ionicons
              name={filter.icon}
              size={16}
              color={
                selectedFilter === filter.key
                  ? theme.cardBackground
                  : theme.text
              }
            />
            <Text
              style={[
                styles.filterText,
                selectedFilter === filter.key && styles.filterTextActive,
              ]}
            >
              {filter.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderOrderCard = ({ item: order }) => {
    // Validar que la orden tenga los datos necesarios
    if (!order || !order.items || !Array.isArray(order.items)) {
      console.warn("Invalid order data:", order);
      return null;
    }

    return (
      <TouchableOpacity
        style={styles.orderCard}
        onPress={() =>
          navigation.navigate("OrderDetail", { orderId: order.id })
        }
        activeOpacity={0.8}
      >
        {/* Header del pedido */}
        <View style={styles.orderHeader}>
          <View style={styles.orderInfo}>
            <Text style={styles.orderNumber}>
              Pedido #{order.id?.slice(-8).toUpperCase() || "N/A"}
            </Text>
            <Text style={styles.orderDate}>
              {order.orderDate
                ? formatDate(order.orderDate)
                : "Fecha no disponible"}{" "}
              • {order.orderDate ? formatTime(order.orderDate) : "--:--"}
            </Text>
          </View>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: getStatusColor(order.status, theme) + "20" },
            ]}
          >
            <Text
              style={[
                styles.statusText,
                { color: getStatusColor(order.status, theme) },
              ]}
            >
              {getStatusText(order.status)}
            </Text>
          </View>
        </View>

        {/* Restaurante */}
        <View style={styles.restaurantSection}>
          <Ionicons name="restaurant-outline" size={20} color={theme.primary} />
          <Text style={styles.restaurantName}>
            {order.restaurant?.name || "Restaurante no disponible"}
          </Text>
        </View>

        {/* Items del pedido */}
        <View style={styles.itemsSection}>
          <Text style={styles.itemsTitle}>
            {order.items.length} producto{order.items.length !== 1 ? "s" : ""}:
          </Text>
          {order.items.slice(0, 2).map((item, index) => (
            <Text key={index} style={styles.itemText}>
              • {item.quantity || 0}x{" "}
              {item.product?.name || "Producto no disponible"}
            </Text>
          ))}
          {order.items.length > 2 && (
            <Text style={styles.moreItems}>
              +{order.items.length - 2} producto
              {order.items.length - 2 !== 1 ? "s" : ""} más
            </Text>
          )}
        </View>

        {/* Footer */}
        <View style={styles.orderFooter}>
          <Text style={styles.totalAmount}>
            {formatPrice((order.total || 0) + 1500)}
          </Text>
          <View style={styles.actionButton}>
            <Text style={styles.actionButtonText}>Ver Detalles</Text>
            <Ionicons name="chevron-forward" size={16} color={theme.primary} />
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="receipt-outline" size={80} color={theme.textSecondary} />
      <Text style={styles.emptyTitle}>
        {selectedFilter === "all"
          ? "No hay pedidos"
          : `No hay pedidos ${filters
              .find((f) => f.key === selectedFilter)
              ?.label.toLowerCase()}`}
      </Text>
      <Text style={styles.emptyText}>
        {selectedFilter === "all"
          ? "Cuando realices tu primer pedido aparecerá aquí"
          : "Prueba con otro filtro o realiza un nuevo pedido"}
      </Text>
      {selectedFilter === "all" && (
        <TouchableOpacity
          style={styles.startShoppingButton}
          onPress={() => navigation.navigate("Home")}
        >
          <Text style={styles.startShoppingText}>Comenzar a Comprar</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mis Pedidos</Text>
        <Text style={styles.headerSubtitle}>
          {orders.length} pedido{orders.length !== 1 ? "s" : ""} total
          {orders.length !== 1 ? "es" : ""}
        </Text>
      </View>

      {/* Filtros */}
      {!loading && renderFilters()}

      {/* Lista de pedidos */}
      <View style={styles.content}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.primary} />
            <Text style={styles.loadingText}>Cargando pedidos...</Text>
          </View>
        ) : getFilteredOrders().length > 0 ? (
          <FlatList
            data={getFilteredOrders().filter((order) => order && order.items)} // Filtrar órdenes inválidas
            renderItem={renderOrderCard}
            keyExtractor={(item) => item?.id || Math.random().toString()}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={[theme.primary]}
                tintColor={theme.primary}
              />
            }
            contentContainerStyle={styles.listContainer}
          />
        ) : (
          <ScrollView
            contentContainerStyle={styles.emptyScrollContainer}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={[theme.primary]}
                tintColor={theme.primary}
              />
            }
          >
            {renderEmptyState()}
          </ScrollView>
        )}
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
    headerSubtitle: {
      fontSize: 14,
      color: theme.textSecondary,
      textAlign: "center",
      marginTop: 4,
    },

    // 🆕 Estilos para filtros mejorados
    filtersContainer: {
      backgroundColor: theme.cardBackground,
      paddingVertical: 16,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    filtersScroll: {
      paddingHorizontal: 20,
      gap: 12,
    },
    filterItem: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20,
      backgroundColor: theme.background,
      borderWidth: 1,
      borderColor: theme.border,
      gap: 6,
    },
    filterItemActive: {
      backgroundColor: theme.primary,
      borderColor: theme.primary,
    },
    filterText: {
      fontSize: 14,
      fontWeight: "500",
      color: theme.text,
    },
    filterTextActive: {
      color: theme.cardBackground,
    },

    // Lista y contenido
    content: {
      flex: 1,
    },
    listContainer: {
      padding: 20,
    },
    emptyScrollContainer: {
      flexGrow: 1,
      justifyContent: "center",
    },

    // Cards de pedidos
    orderCard: {
      backgroundColor: theme.cardBackground,
      borderRadius: 16,
      padding: 20,
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
      marginBottom: 16,
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
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 12,
    },
    statusText: {
      fontSize: 12,
      fontWeight: "600",
    },
    restaurantSection: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 16,
      paddingBottom: 16,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    restaurantName: {
      fontSize: 16,
      fontWeight: "600",
      color: theme.text,
      marginLeft: 8,
    },
    itemsSection: {
      marginBottom: 16,
    },
    itemsTitle: {
      fontSize: 14,
      fontWeight: "600",
      color: theme.text,
      marginBottom: 8,
    },
    itemText: {
      fontSize: 14,
      color: theme.textSecondary,
      marginBottom: 4,
    },
    moreItems: {
      fontSize: 14,
      color: theme.textSecondary,
      fontStyle: "italic",
    },
    orderFooter: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    totalAmount: {
      fontSize: 20,
      fontWeight: "bold",
      color: theme.primary,
    },
    actionButton: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
    },
    actionButtonText: {
      fontSize: 14,
      fontWeight: "600",
      color: theme.primary,
    },

    // Estado vacío
    emptyContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      padding: 40,
      minHeight: 400,
    },
    emptyTitle: {
      fontSize: 24,
      fontWeight: "bold",
      color: theme.text,
      marginTop: 20,
      marginBottom: 12,
      textAlign: "center",
    },
    emptyText: {
      fontSize: 16,
      color: theme.textSecondary,
      textAlign: "center",
      lineHeight: 22,
      marginBottom: 30,
    },
    startShoppingButton: {
      backgroundColor: theme.primary,
      borderRadius: 12,
      paddingVertical: 14,
      paddingHorizontal: 30,
    },
    startShoppingText: {
      color: theme.cardBackground,
      fontSize: 16,
      fontWeight: "600",
    },
  });

export default OrdersScreen;
