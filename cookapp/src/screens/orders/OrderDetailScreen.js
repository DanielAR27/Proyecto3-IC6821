import React from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../context/ThemeContext";
import { useOrders } from "../../context/OrderContext";

const OrderDetailScreen = ({ navigation, route }) => {
  const { orderId } = route.params;
  const { theme } = useTheme();
  const { getOrderById, getStatusText, getStatusColor } = useOrders();

  const order = getOrderById(orderId);
  const styles = createStyles(theme);

  if (!order) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={60} color={theme.danger} />
        <Text style={styles.errorTitle}>Pedido no encontrado</Text>
        <Text style={styles.errorText}>No se pudo encontrar este pedido</Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>Volver</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const formatPrice = (price) => {
    return `₡${parseFloat(price).toLocaleString("es-CR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("es-CR", {
      weekday: "long",
      day: "2-digit",
      month: "long",
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

  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity
        style={styles.headerButton}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="arrow-back" size={24} color={theme.text} />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>Detalle del Pedido</Text>
      <View style={styles.headerButton} />
    </View>
  );

  const renderOrderInfo = () => (
    <View style={styles.orderInfoContainer}>
      <View style={styles.orderHeader}>
        <Text style={styles.orderNumber}>
          Pedido #{order.id.slice(-8).toUpperCase()}
        </Text>
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

      <View style={styles.orderMeta}>
        <View style={styles.metaItem}>
          <Ionicons
            name="calendar-outline"
            size={16}
            color={theme.textSecondary}
          />
          <Text style={styles.metaText}>{formatDate(order.orderDate)}</Text>
        </View>
        <View style={styles.metaItem}>
          <Ionicons name="time-outline" size={16} color={theme.textSecondary} />
          <Text style={styles.metaText}>{formatTime(order.orderDate)}</Text>
        </View>
      </View>

      <View style={styles.restaurantSection}>
        <Ionicons name="restaurant-outline" size={20} color={theme.primary} />
        <Text style={styles.restaurantName}>{order.restaurant.name}</Text>
      </View>
    </View>
  );

  const renderItems = () => (
    <View style={styles.itemsContainer}>
      <Text style={styles.sectionTitle}>Productos Pedidos</Text>

      {order.items.map((item) => (
        <View key={item.id} style={styles.itemCard}>
          <Image
            source={{
              uri:
                item.product.image_url ||
                item.product.image ||
                `https://placehold.co/400x300?text=${encodeURIComponent(
                  item.product.name
                )}`,
            }}
            style={styles.itemImage}
          />

          <View style={styles.itemInfo}>
            <Text style={styles.itemName}>
              {item.quantity}x {item.product.name}
            </Text>
            <Text style={styles.itemDescription} numberOfLines={2}>
              {item.product.description}
            </Text>

            {item.toppings && item.toppings.length > 0 && (
              <View style={styles.toppingsSection}>
                <Text style={styles.toppingsTitle}>Extras:</Text>
                {item.toppings.map((topping, index) => (
                  <Text key={index} style={styles.toppingText}>
                    • {topping.name} (+{formatPrice(topping.price)})
                  </Text>
                ))}
              </View>
            )}

            {item.specialInstructions && (
              <View style={styles.instructionsSection}>
                <Text style={styles.instructionsTitle}>Instrucciones:</Text>
                <Text style={styles.instructionsText}>
                  {item.specialInstructions}
                </Text>
              </View>
            )}
          </View>

          <Text style={styles.itemPrice}>{formatPrice(item.subtotal)}</Text>
        </View>
      ))}
    </View>
  );

  const renderOrderSummary = () => (
    <View style={styles.summaryContainer}>
      <Text style={styles.sectionTitle}>Resumen del Pedido</Text>

      <View style={styles.summaryRow}>
        <Text style={styles.summaryLabel}>
          Productos ({order.items.reduce((sum, item) => sum + item.quantity, 0)}
          )
        </Text>
        <Text style={styles.summaryValue}>{formatPrice(order.total)}</Text>
      </View>

      <View style={styles.summaryRow}>
        <Text style={styles.summaryLabel}>Delivery</Text>
        <Text style={styles.summaryValue}>₡1,500.00</Text>
      </View>

      <View style={[styles.summaryRow, styles.totalRow]}>
        <Text style={styles.totalLabel}>Total Pagado</Text>
        <Text style={styles.totalValue}>{formatPrice(order.total + 1500)}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {renderHeader()}

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {renderOrderInfo()}
        {renderItems()}
        {renderOrderSummary()}
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
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: 20,
      paddingTop: 50,
      paddingBottom: 15,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
      backgroundColor: theme.background,
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
    },
    orderInfoContainer: {
      backgroundColor: theme.cardBackground,
      marginHorizontal: 20,
      marginTop: 20,
      borderRadius: 16,
      padding: 20,
      shadowColor: theme.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    orderHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 16,
    },
    orderNumber: {
      fontSize: 18,
      fontWeight: "bold",
      color: theme.text,
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
    orderMeta: {
      flexDirection: "row",
      gap: 20,
      marginBottom: 16,
    },
    metaItem: {
      flexDirection: "row",
      alignItems: "center",
    },
    metaText: {
      fontSize: 14,
      color: theme.textSecondary,
      marginLeft: 6,
    },
    restaurantSection: {
      flexDirection: "row",
      alignItems: "center",
      paddingTop: 16,
      borderTopWidth: 1,
      borderTopColor: theme.border,
    },
    restaurantName: {
      fontSize: 16,
      fontWeight: "600",
      color: theme.text,
      marginLeft: 8,
    },
    itemsContainer: {
      backgroundColor: theme.cardBackground,
      marginHorizontal: 20,
      marginTop: 16,
      borderRadius: 16,
      padding: 20,
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
    itemCard: {
      flexDirection: "row",
      marginBottom: 16,
      paddingBottom: 16,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    itemImage: {
      width: 60,
      height: 60,
      borderRadius: 8,
      backgroundColor: theme.border,
    },
    itemInfo: {
      flex: 1,
      marginLeft: 12,
      marginRight: 12,
    },
    itemName: {
      fontSize: 16,
      fontWeight: "600",
      color: theme.text,
      marginBottom: 4,
    },
    itemDescription: {
      fontSize: 14,
      color: theme.textSecondary,
      marginBottom: 8,
    },
    toppingsSection: {
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
    instructionsSection: {
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
    itemPrice: {
      fontSize: 16,
      fontWeight: "bold",
      color: theme.primary,
      alignSelf: "flex-start",
    },
    summaryContainer: {
      backgroundColor: theme.cardBackground,
      marginHorizontal: 20,
      marginTop: 16,
      marginBottom: 20,
      borderRadius: 16,
      padding: 20,
      shadowColor: theme.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
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
      fontSize: 16,
      fontWeight: "bold",
      color: theme.text,
    },
    totalValue: {
      fontSize: 18,
      fontWeight: "bold",
      color: theme.primary,
    },
    errorContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: theme.background,
      paddingHorizontal: 40,
    },
    errorTitle: {
      fontSize: 20,
      fontWeight: "bold",
      color: theme.text,
      marginTop: 20,
      marginBottom: 12,
    },
    errorText: {
      fontSize: 16,
      color: theme.textSecondary,
      textAlign: "center",
      marginBottom: 30,
    },
    backButton: {
      backgroundColor: theme.primary,
      paddingHorizontal: 24,
      paddingVertical: 12,
      borderRadius: 20,
    },
    backButtonText: {
      color: "#fff",
      fontSize: 16,
      fontWeight: "600",
    },
  });

export default OrderDetailScreen;
