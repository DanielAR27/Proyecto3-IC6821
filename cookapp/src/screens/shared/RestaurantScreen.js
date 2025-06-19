import React, { useState, useEffect } from "react";
import { useNavigation } from "@react-navigation/native";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
  RefreshControl,
  Dimensions,
  ActivityIndicator,
  FlatList,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import FavoriteButton from "../../components/FavoriteButton";
import { useTheme } from "../../context/ThemeContext";
import { getRestaurantById } from "../../services/restaurantService";
import { getCategoriesByRestaurant } from "../../services/categoryService";
import { getProductsByRestaurant } from "../../services/productService";
import CartBadge from "../../components/CartBadge";

const { width: screenWidth } = Dimensions.get("window");

const RestaurantScreen = ({ navigation, route }) => {
  const { restaurantId } = route.params;
  const { theme } = useTheme();
  const [restaurant, setRestaurant] = useState(null);
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const styles = createStyles(theme);

  useEffect(() => {
    loadRestaurantData();
  }, [restaurantId]);

  const loadRestaurantData = async () => {
    try {
      setLoading(true);

      // Cargar datos del restaurante
      const [restaurantData, categoriesData, productsData] = await Promise.all([
        getRestaurantById(restaurantId),
        getCategoriesByRestaurant(restaurantId),
        getProductsByRestaurant(restaurantId, { is_available: true }),
      ]);

      setRestaurant(restaurantData);
      setCategories([
        { _id: "all", name: "Todo", order: 0 },
        ...categoriesData.sort((a, b) => a.order - b.order),
      ]);
      setProducts(productsData);
    } catch (error) {
      console.error("Error loading restaurant data:", error);
      Alert.alert("Error", "No se pudo cargar la información del restaurante");
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadRestaurantData();
    setRefreshing(false);
  };

  const formatBusinessHours = (businessHours) => {
    if (!businessHours) return "Horarios no disponibles";

    const days = {
      monday: "Lun",
      tuesday: "Mar",
      wednesday: "Mié",
      thursday: "Jue",
      friday: "Vie",
      saturday: "Sáb",
      sunday: "Dom",
    };

    const today = new Date().getDay();
    const dayKeys = [
      "sunday",
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
    ];
    const todayKey = dayKeys[today];

    const todayHours = businessHours[todayKey];

    if (!todayHours || todayHours.closed) {
      return "Cerrado hoy";
    }

    return `Abierto hoy: ${todayHours.open || "00:00"} - ${
      todayHours.close || "23:59"
    }`;
  };

  const isRestaurantOpen = () => {
    if (!restaurant?.is_active || !restaurant?.business_hours) return false;

    const now = new Date();
    const dayOfWeek = [
      "sunday",
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
    ][now.getDay()];
    const currentDay = restaurant.business_hours[dayOfWeek];

    return currentDay && !currentDay.closed;
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("es-CR", {
      style: "currency",
      currency: "CRC",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const filteredProducts = products.filter((product) => {
    if (selectedCategory === "all") return true;
    return product.category_id._id === selectedCategory;
  });

  const handleProductPress = (product) => {
    console.log("Navigating with product:", product);
    console.log("Product base_ingredients:", product.base_ingredients);
    navigation.navigate("ProductDetail", {
      product: product,
      restaurant: restaurant,
    });
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="arrow-back" size={24} color="#fff" />
      </TouchableOpacity>

      <View style={styles.headerActions}>
        <TouchableOpacity style={styles.headerAction}>
          <FavoriteButton
            type="restaurant"
            item={restaurant}
            size="small"
            showBackground={false}
            iconColor="#fff"
          />
        </TouchableOpacity>
        <TouchableOpacity style={styles.headerAction}>
          <Ionicons name="share-outline" size={24} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderRestaurantInfo = () => (
    <View style={styles.restaurantInfo}>
      <View style={styles.restaurantTitleRow}>
        <Text style={styles.restaurantName}>{restaurant.name}</Text>
        <View style={styles.titleActions}>
          <View style={styles.statusContainer}>
            <View
              style={[
                styles.statusDot,
                {
                  backgroundColor: isRestaurantOpen()
                    ? theme.success
                    : theme.danger,
                },
              ]}
            />
            <Text
              style={[
                styles.statusText,
                { color: isRestaurantOpen() ? theme.success : theme.danger },
              ]}
            >
              {isRestaurantOpen() ? "Abierto" : "Cerrado"}
            </Text>
          </View>
        </View>

        <View style={styles.ratingContainer}>
          <Ionicons name="star" size={16} color="#FFD700" />
          <Text style={styles.ratingText}>4.5</Text>
        </View>
      </View>

      <Text style={styles.restaurantDescription}>{restaurant.description}</Text>

      <View style={styles.restaurantMeta}>
        <View style={styles.metaItem}>
          <Ionicons name="time-outline" size={16} color={theme.textSecondary} />
          <Text style={styles.metaText}>
            {formatBusinessHours(restaurant.business_hours)}
          </Text>
        </View>

        <View style={styles.metaItem}>
          <Ionicons
            name="location-outline"
            size={16}
            color={theme.textSecondary}
          />
          <Text style={styles.metaText}>
            {restaurant.address?.city}, {restaurant.address?.province}
          </Text>
        </View>
      </View>

      {restaurant.restaurant_tags && restaurant.restaurant_tags.length > 0 && (
        <View style={styles.tagsContainer}>
          {restaurant.restaurant_tags.map((tag) => (
            <View key={tag._id} style={styles.tag}>
              <Text style={styles.tagText}>{tag.name}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );

  const renderCategories = () => (
    <View style={styles.categoriesContainer}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoriesScroll}
      >
        {categories.map((category) => (
          <TouchableOpacity
            key={category._id}
            style={[
              styles.categoryItem,
              selectedCategory === category._id && styles.categoryItemActive,
            ]}
            onPress={() => setSelectedCategory(category._id)}
          >
            <Text
              style={[
                styles.categoryText,
                selectedCategory === category._id && styles.categoryTextActive,
              ]}
            >
              {category.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderProductItem = ({ item }) => (
    <TouchableOpacity
      style={styles.productCard}
      onPress={() => handleProductPress(item)}
    >
      <Image
        source={{
          uri:
            item.image ||
            `https://placehold.co/400x300?text=${encodeURIComponent(
              item.name
            )}`,
        }}
        style={styles.productImage}
      />

      <View style={styles.productInfo}>
        <View style={styles.productHeader}>
          <Text style={styles.productName} numberOfLines={2}>
            {item.name}
          </Text>
          {item.is_featured && (
            <View style={styles.featuredBadge}>
              <Ionicons name="star" size={12} color="#fff" />
            </View>
          )}
        </View>

        <Text style={styles.productDescription} numberOfLines={2}>
          {item.description}
        </Text>

        {item.tags && item.tags.length > 0 && (
          <View style={styles.productTags}>
            {item.tags.slice(0, 2).map((tag) => (
              <View key={tag._id} style={styles.productTag}>
                <Text style={styles.productTagText}>{tag.name}</Text>
              </View>
            ))}
          </View>
        )}

        <View style={styles.productFooter}>
          <Text style={styles.productPrice}>{formatPrice(item.price)}</Text>
          <View style={styles.prepTimeContainer}>
            <Ionicons
              name="time-outline"
              size={14}
              color={theme.textSecondary}
            />
            <Text style={styles.prepTimeText}>{item.preparation_time} min</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderProducts = () => (
    <View style={styles.productsContainer}>
      <Text style={styles.sectionTitle}>
        {selectedCategory === "all"
          ? "Todos los productos"
          : categories.find((c) => c._id === selectedCategory)?.name}
      </Text>

      {filteredProducts.length > 0 ? (
        <FlatList
          data={filteredProducts}
          renderItem={renderProductItem}
          keyExtractor={(item) => item._id}
          numColumns={2}
          columnWrapperStyle={styles.productRow}
          scrollEnabled={false}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.emptyProducts}>
          <Ionicons
            name="fast-food-outline"
            size={50}
            color={theme.textSecondary}
          />
          <Text style={styles.emptyProductsText}>
            No hay productos disponibles en esta categoría
          </Text>
        </View>
      )}
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.primary} />
        <Text style={styles.loadingText}>Cargando restaurante...</Text>
      </View>
    );
  }

  if (!restaurant) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={60} color={theme.danger} />
        <Text style={styles.errorText}>No se pudo cargar el restaurante</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={loadRestaurantData}
        >
          <Text style={styles.retryButtonText}>Reintentar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Banner con header superpuesto */}
      <View style={styles.bannerContainer}>
        <Image
          source={{
            uri:
              restaurant.banner ||
              `https://placehold.co/800x300?text=${encodeURIComponent(
                restaurant.name
              )}`,
          }}
          style={styles.bannerImage}
        />
        {renderHeader()}
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[theme.primary]}
            tintColor={theme.primary}
          />
        }
      >
        {renderRestaurantInfo()}
        {renderCategories()}
        {renderProducts()}
      </ScrollView>
      <CartBadge />
    </View>
  );
};

const createStyles = (theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    productTitleRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      marginBottom: 4,
    },
    productFavoriteButton: {
      marginLeft: 8,
      backgroundColor: "rgba(255, 255, 255, 0.1)",
      borderRadius: 16,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: theme.background,
    },
    loadingText: {
      marginTop: 16,
      fontSize: 16,
      color: theme.textSecondary,
    },
    errorContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: theme.background,
      padding: 20,
    },
    errorText: {
      fontSize: 18,
      color: theme.text,
      marginTop: 16,
      marginBottom: 20,
      textAlign: "center",
    },
    retryButton: {
      backgroundColor: theme.primary,
      paddingHorizontal: 20,
      paddingVertical: 12,
      borderRadius: 20,
    },
    retryButtonText: {
      color: "#fff",
      fontSize: 16,
      fontWeight: "600",
    },
    bannerContainer: {
      position: "relative",
      height: 250,
    },
    headerFavoriteButton: {
      backgroundColor: "transparent",
      shadowOpacity: 0,
      elevation: 0,
    },
    bannerImage: {
      width: "100%",
      height: "100%",
      resizeMode: "cover",
    },
    header: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingTop: 40,
      paddingHorizontal: 10,
      paddingBottom: 5,
      backgroundColor: "rgba(0,0,0,0.2)",
    },
    backButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: "rgba(0,0,0,0.5)",
      justifyContent: "center",
      alignItems: "center",
    },
    headerActions: {
      flexDirection: "row",
      gap: 12,
    },
    headerAction: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: "rgba(0,0,0,0.5)",
      justifyContent: "center",
      alignItems: "center",
    },
    content: {
      flex: 1,
    },
    restaurantInfo: {
      backgroundColor: theme.cardBackground,
      padding: 20,
      margin: 16,
      borderRadius: 16,
      shadowColor: theme.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 5,
    },
    restaurantHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      marginBottom: 12,
    },
    restaurantTitleContainer: {
      flex: 1,
      marginRight: 16,
    },
    restaurantName: {
      restaurantTitleRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 8,
      },
      fontSize: 24,
      fontWeight: "bold",
      color: theme.text,
      marginBottom: 8,
    },
    statusContainer: {
      flexDirection: "row",
      alignItems: "center",
    },
    statusDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      marginRight: 6,
    },
    statusText: {
      fontSize: 14,
      fontWeight: "500",
    },
    ratingContainer: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: theme.background,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
    },
    ratingText: {
      fontSize: 14,
      fontWeight: "600",
      color: theme.text,
      marginLeft: 4,
    },
    restaurantDescription: {
      fontSize: 16,
      color: theme.textSecondary,
      lineHeight: 22,
      marginBottom: 16,
    },
    restaurantMeta: {
      gap: 8,
      marginBottom: 16,
    },
    metaItem: {
      flexDirection: "row",
      alignItems: "center",
    },
    metaText: {
      fontSize: 14,
      color: theme.textSecondary,
      marginLeft: 8,
    },
    tagsContainer: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
    },
    tag: {
      backgroundColor: theme.primary + "20",
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 16,
    },
    tagText: {
      fontSize: 12,
      color: theme.primary,
      fontWeight: "500",
    },
    categoriesContainer: {
      marginBottom: 20,
    },
    categoriesScroll: {
      paddingHorizontal: 16,
      gap: 12,
    },
    categoryItem: {
      paddingHorizontal: 20,
      paddingVertical: 12,
      borderRadius: 25,
      backgroundColor: theme.cardBackground,
      borderWidth: 1,
      borderColor: theme.border,
    },
    categoryItemActive: {
      backgroundColor: theme.primary,
      borderColor: theme.primary,
    },
    categoryText: {
      fontSize: 14,
      fontWeight: "500",
      color: theme.text,
    },
    categoryTextActive: {
      color: "#fff",
    },
    productsContainer: {
      paddingHorizontal: 16,
      paddingBottom: 20,
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: "bold",
      color: theme.text,
      marginBottom: 16,
    },
    productRow: {
      justifyContent: "space-between",
      marginBottom: 16,
    },
    productCard: {
      flex: 0.48,
      backgroundColor: theme.cardBackground,
      borderRadius: 12,
      overflow: "hidden",
      shadowColor: theme.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    productImage: {
      width: "100%",
      height: 120,
      resizeMode: "cover",
    },
    productInfo: {
      padding: 12,
    },
    productHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      marginBottom: 8,
    },
    productName: {
      fontSize: 16,
      fontWeight: "600",
      color: theme.text,
      flex: 1,
      marginRight: 8,
    },
    featuredBadge: {
      backgroundColor: theme.warning,
      width: 20,
      height: 20,
      borderRadius: 10,
      justifyContent: "center",
      alignItems: "center",
    },
    productDescription: {
      fontSize: 12,
      color: theme.textSecondary,
      lineHeight: 16,
      marginBottom: 8,
    },
    productTags: {
      flexDirection: "row",
      gap: 4,
      marginBottom: 8,
    },
    productTag: {
      backgroundColor: theme.border,
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 8,
    },
    productTagText: {
      fontSize: 10,
      color: theme.textSecondary,
    },
    productFooter: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    productPrice: {
      fontSize: 16,
      fontWeight: "bold",
      color: theme.primary,
    },
    prepTimeContainer: {
      flexDirection: "row",
      alignItems: "center",
    },
    prepTimeText: {
      fontSize: 12,
      color: theme.textSecondary,
      marginLeft: 4,
    },
    emptyProducts: {
      alignItems: "center",
      paddingVertical: 40,
    },
    emptyProductsText: {
      fontSize: 16,
      color: theme.textSecondary,
      marginTop: 12,
      textAlign: "center",
    },
  });

export default RestaurantScreen;
