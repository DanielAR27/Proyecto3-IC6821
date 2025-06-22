import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  FlatList,
  RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../context/ThemeContext";
import { useOrders } from "../../context/OrderContext";

const OrdersScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const { orders, getStatusText, getStatusColor } = useOrders();
  const [refreshing, setRefreshing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState("all");

  const styles = createStyles(theme);

  const onRefresh = async () => {
    setRefreshing(true);
    // Simular actualización (en una app real, aquí harías fetch de la API)
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
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
    {
      key: "confirmed",
      label: "Confirmados",
      icon: "checkmark-circle-outline",
    },
    { key: "preparing", label: "En Preparación", icon: "time-outline" },
    { key: "ready", label: "Listos", icon: "restaurant-outline" },
    { key: "delivered", label: "Entregados", icon: "checkmark-done-outline" },
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
              size={18}
              color={
                selectedFilter === filter.key ? theme.background : theme.primary
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

  const renderOrderCard = ({ item: order }) => (
    <TouchableOpacity
      style={styles.orderCard}
      onPress={() => navigation.navigate("OrderDetail", { orderId: order.id })}
      activeOpacity={0.8}
    >
      {/* Header del pedido */}
      <View style={styles.orderHeader}>
        <View style={styles.orderInfo}>
          <Text style={styles.orderNumber}>
            Pedido #{order.id.slice(-8).toUpperCase()}
          </Text>
          <Text style={styles.orderDate}>
            {formatDate(order.orderDate)} • {formatTime(order.orderDate)}
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
        <Text style={styles.restaurantName}>{order.restaurant.name}</Text>
      </View>

      {/* Items del pedido */}
      <View style={styles.itemsSection}>
        <Text style={styles.itemsTitle}>
          {order.items.length} producto{order.items.length !== 1 ? "s" : ""}:
        </Text>
        {order.items.slice(0, 2).map((item, index) => (
          <Text key={index} style={styles.itemText}>
            • {item.quantity}x {item.product.name}
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
        <Text style={styles.totalAmount}>{formatPrice(order.total)}</Text>
        <View style={styles.actionButton}>
          <Text style={styles.actionButtonText}>Ver Detalles</Text>
          <Ionicons name="chevron-forward" size={16} color={theme.primary} />
        </View>
      </View>
    </TouchableOpacity>
  );

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
      {renderFilters()}

      {/* Lista de pedidos */}
      <View style={styles.content}>
        {getFilteredOrders().length > 0 ? (
          <FlatList
            data={getFilteredOrders()}
            renderItem={renderOrderCard}
            keyExtractor={(item) => item.id}
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
