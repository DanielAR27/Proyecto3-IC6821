import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  FlatList,
  RefreshControl,
  Alert,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../context/ThemeContext";

const { width: screenWidth } = Dimensions.get("window");

const HomeScreen = ({ user }) => {
  const { theme } = useTheme();
  const [searchQuery, setSearchQuery] = useState("");
  const [restaurants, setRestaurants] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("all");

  const styles = createStyles(theme);

  const API_BASE_URL =
    process.env.EXPO_PUBLIC_API_BASE_URL ||
    "https://cocina-express-api.onrender.com/api";

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      // Cargar restaurantes desde tu API (ya incluye populate de restaurant_tags)
      const restaurantsResponse = await fetch(`${API_BASE_URL}/restaurants`);
      const restaurantsData = await restaurantsResponse.json();

      // Cargar restaurant tags desde tu API
      const tagsResponse = await fetch(`${API_BASE_URL}/restaurant-tags`);
      const tagsData = await tagsResponse.json();

      if (!restaurantsData.success || !tagsData.success) {
        throw new Error("Error en la respuesta de la API");
      }

      // Procesar datos de restaurantes usando tu estructura real
      const processedRestaurants =
        restaurantsData.data?.map((restaurant) => ({
          id: restaurant._id,
          name: restaurant.name,
          description: restaurant.description,
          image: restaurant.banner, // Tu campo se llama 'banner'
          rating: calculateRestaurantRating(restaurant), // Función helper
          deliveryTime: estimateDeliveryTime(restaurant), // Función helper
          specialty: getRestaurantSpecialty(restaurant), // Función helper
          tags: restaurant.restaurant_tags || [], // Los tags populados
          isOpen: checkIfRestaurantOpen(restaurant), // Función helper usando business_hours
          address: formatAddress(restaurant.address), // Función helper
          phone: restaurant.contact?.phone,
          email: restaurant.contact?.email,
          businessHours: restaurant.business_hours,
          isActive: restaurant.is_active,
          ownerId: restaurant.owner_id,
        })) || [];

      // Procesar restaurant tags para las categorías del filtro
      const processedCategories = [
        { id: "all", name: "Todo", icon: "grid-outline" },
        ...(tagsData.data
          ?.filter((tag) => tag.is_active)
          .map((tag) => ({
            id: tag._id,
            name: tag.name,
            icon: getCategoryIcon(tag.name),
          })) || []),
      ];

      setRestaurants(processedRestaurants);
      setCategories(processedCategories);
    } catch (error) {
      console.error("Error loading data:", error);
      Alert.alert(
        "Error de Conexión",
        "No se pudieron cargar los restaurantes. Verifica tu conexión a internet.",
        [{ text: "Reintentar", onPress: () => loadData() }, { text: "OK" }]
      );

      // Fallback a arrays vacíos
      setRestaurants([]);
      setCategories([{ id: "all", name: "Todo", icon: "grid-outline" }]);
    } finally {
      setLoading(false);
    }
  };

  // Helper functions para procesar los datos de tu API

  // Calcular rating (por ahora un placeholder, después puedes conectar con pedidos)
  const calculateRestaurantRating = (restaurant) => {
    // TODO: Implementar cálculo real basado en reviews/pedidos
    return 4.2 + Math.random() * 0.8; // Rating entre 4.2 y 5.0
  };

  // Estimar tiempo de delivery basado en ubicación o tags
  const estimateDeliveryTime = (restaurant) => {
    // TODO: Implementar cálculo real basado en ubicación/histórico
    const baseTime = 20;
    const variation = Math.floor(Math.random() * 20);
    return `${baseTime + variation}-${baseTime + variation + 15}`;
  };

  // Obtener especialidad principal del restaurante
  const getRestaurantSpecialty = (restaurant) => {
    if (restaurant.restaurant_tags && restaurant.restaurant_tags.length > 0) {
      return restaurant.restaurant_tags[0].name;
    }
    return "Comida Personalizada";
  };

  // Verificar si el restaurante está abierto ahora
  const checkIfRestaurantOpen = (restaurant) => {
    if (!restaurant.is_active) return false;

    // TODO: Implementar lógica real usando business_hours
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
    const currentDay = restaurant.business_hours?.[dayOfWeek];

    if (!currentDay || currentDay.closed) return false;

    // Por ahora retorna true si tiene horarios configurados
    return currentDay.open && currentDay.close;
  };

  // Formatear dirección completa
  const formatAddress = (address) => {
    if (!address) return "Dirección no disponible";
    return `${address.street}, ${address.city}, ${address.province}`;
  };

  // Helper function para asignar iconos a los restaurant tags
  const getCategoryIcon = (tagName) => {
    const iconMap = {
      Saludable: "leaf-outline",
      Tradicional: "home-outline",
      Vegetariano: "flower-outline",
      Vegano: "flower-outline",
      Fitness: "fitness-outline",
      Rápida: "flash-outline",
      Internacional: "earth-outline",
      Postres: "ice-cream-outline",
      Italiana: "pizza-outline",
      Asiática: "restaurant-outline",
      Mexicana: "flame-outline",
      Mariscos: "fish-outline",
      Carnes: "nutrition-outline",
      Orgánico: "leaf-outline",
    };

    return iconMap[tagName] || "restaurant-outline";
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const filteredRestaurants = restaurants.filter((restaurant) => {
    const matchesSearch =
      restaurant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      restaurant.description
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      restaurant.specialty?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      selectedCategory === "all" ||
      restaurant.tags.some(
        (tag) => tag._id === selectedCategory || tag.id === selectedCategory
      );
    return matchesSearch && matchesCategory && restaurant.isActive;
  });

  const handleRestaurantPress = (restaurant) => {
    if (!restaurant.isOpen) {
      Alert.alert(
        "Restaurante Cerrado",
        "Este restaurante no está disponible en este momento"
      );
      return;
    }
    // Navegar a pantalla de detalles del restaurante
    Alert.alert("Próximamente", `Abriendo ${restaurant.name}...`);
  };

  const renderPromoBanner = () => (
    <View style={styles.promoBanner}>
      <View style={styles.promoContent}>
        <Text style={styles.promoTitle}>🍳 ¡Personaliza tu comida!</Text>
        <Text style={styles.promoSubtitle}>
          Especifica exactamente cómo quieres que preparen tu platillo
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={24} color={theme.primary} />
    </View>
  );

  const renderSearchBar = () => (
    <View style={styles.searchContainer}>
      <Ionicons
        name="search-outline"
        size={20}
        color={theme.textSecondary}
        style={styles.searchIcon}
      />
      <TextInput
        style={styles.searchInput}
        placeholder="Buscar restaurantes o comidas..."
        placeholderTextColor={theme.textSecondary}
        value={searchQuery}
        onChangeText={setSearchQuery}
      />
      {searchQuery.length > 0 && (
        <TouchableOpacity
          onPress={() => setSearchQuery("")}
          style={styles.clearButton}
        >
          <Ionicons name="close-circle" size={20} color={theme.textSecondary} />
        </TouchableOpacity>
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
            key={category.id}
            style={[
              styles.categoryItem,
              selectedCategory === category.id && styles.categoryItemActive,
            ]}
            onPress={() => setSelectedCategory(category.id)}
          >
            <Ionicons
              name={category.icon}
              size={24}
              color={
                selectedCategory === category.id
                  ? theme.background
                  : theme.primary
              }
            />
            <Text
              style={[
                styles.categoryText,
                selectedCategory === category.id && styles.categoryTextActive,
              ]}
            >
              {category.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderRestaurantCard = ({ item: restaurant }) => (
    <TouchableOpacity
      style={[
        styles.restaurantCard,
        !restaurant.isOpen && styles.restaurantCardClosed,
      ]}
      onPress={() => handleRestaurantPress(restaurant)}
      activeOpacity={0.8}
    >
      <View style={styles.restaurantImageContainer}>
        <Image
          source={{ uri: restaurant.image }}
          style={styles.restaurantImage}
        />
        {!restaurant.isOpen && (
          <View style={styles.closedOverlay}>
            <Text style={styles.closedText}>Cerrado</Text>
          </View>
        )}
        <View style={styles.customizableBadge}>
          <Ionicons
            name="settings-outline"
            size={12}
            color={theme.background}
          />
          <Text style={styles.customizableText}>Personalizable</Text>
        </View>
      </View>

      <View style={styles.restaurantInfo}>
        <View style={styles.restaurantHeader}>
          <Text style={styles.restaurantName} numberOfLines={1}>
            {restaurant.name}
          </Text>
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={16} color="#FFD700" />
            <Text style={styles.ratingText}>
              {restaurant.rating.toFixed(1)}
            </Text>
          </View>
        </View>

        <Text style={styles.restaurantDescription}>
          {restaurant.description}
        </Text>

        <View style={styles.restaurantFooter}>
          <View style={styles.specialtyContainer}>
            <Ionicons name="ribbon-outline" size={14} color={theme.primary} />
            <Text style={styles.specialtyText}>{restaurant.specialty}</Text>
          </View>

          <View style={styles.deliveryContainer}>
            <Ionicons
              name="time-outline"
              size={14}
              color={theme.textSecondary}
            />
            <Text style={styles.deliveryText}>
              {restaurant.deliveryTime} min
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyStateContainer}>
      <Ionicons name="search-outline" size={80} color={theme.textSecondary} />
      <Text style={styles.emptyTitle}>No se encontraron restaurantes</Text>
      <Text style={styles.emptySubtitle}>
        Intenta buscar con otros términos o revisa las categorías disponibles
      </Text>
    </View>
  );

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Ionicons name="restaurant-outline" size={60} color={theme.primary} />
        <Text style={styles.loadingText}>Cargando restaurantes...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greetingText}>
              ¡Hola {user?.name?.split(" ")[0]}! 👋
            </Text>
            <Text style={styles.subGreetingText}>
              ¿Qué te apetece comer hoy?
            </Text>
          </View>
          <TouchableOpacity style={styles.notificationButton}>
            <Ionicons
              name="notifications-outline"
              size={24}
              color={theme.text}
            />
          </TouchableOpacity>
        </View>

        {/* Promo Banner */}
        {renderPromoBanner()}

        {/* Search Bar */}
        {renderSearchBar()}

        {/* Categories */}
        {renderCategories()}

        {/* Restaurants List */}
        <View style={styles.restaurantsSection}>
          <Text style={styles.sectionTitle}>
            Restaurantes{" "}
            {selectedCategory !== "all" &&
              `- ${categories.find((c) => c.id === selectedCategory)?.name}`}
          </Text>

          {filteredRestaurants.length > 0 ? (
            <FlatList
              data={filteredRestaurants}
              renderItem={renderRestaurantCard}
              keyExtractor={(item) => item.id.toString()}
              scrollEnabled={false}
              showsVerticalScrollIndicator={false}
            />
          ) : (
            renderEmptyState()
          )}
        </View>
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
    centerContent: {
      justifyContent: "center",
      alignItems: "center",
    },
    loadingText: {
      fontSize: 16,
      color: theme.textSecondary,
      marginTop: 16,
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: 20,
      paddingTop: 20,
      paddingBottom: 10,
    },
    greetingText: {
      fontSize: 24,
      fontWeight: "bold",
      color: theme.text,
    },
    subGreetingText: {
      fontSize: 16,
      color: theme.textSecondary,
      marginTop: 4,
    },
    notificationButton: {
      padding: 8,
      borderRadius: 20,
      backgroundColor: theme.cardBackground,
    },
    promoBanner: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: theme.primary + "15",
      marginHorizontal: 20,
      marginVertical: 16,
      padding: 16,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.primary + "30",
    },
    promoContent: {
      flex: 1,
    },
    promoTitle: {
      fontSize: 18,
      fontWeight: "600",
      color: theme.text,
      marginBottom: 4,
    },
    promoSubtitle: {
      fontSize: 14,
      color: theme.textSecondary,
      lineHeight: 20,
    },
    searchContainer: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: theme.cardBackground,
      marginHorizontal: 20,
      marginBottom: 16,
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderRadius: 12,
      shadowColor: theme.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    searchIcon: {
      marginRight: 12,
    },
    searchInput: {
      flex: 1,
      fontSize: 16,
      color: theme.text,
    },
    clearButton: {
      padding: 4,
    },
    categoriesContainer: {
      marginBottom: 20,
    },
    categoriesScroll: {
      paddingHorizontal: 20,
    },
    categoryItem: {
      alignItems: "center",
      paddingVertical: 12,
      paddingHorizontal: 16,
      marginRight: 12,
      borderRadius: 20,
      backgroundColor: theme.cardBackground,
      minWidth: 80,
    },
    categoryItemActive: {
      backgroundColor: theme.primary,
    },
    categoryText: {
      fontSize: 12,
      color: theme.text,
      marginTop: 4,
      fontWeight: "500",
    },
    categoryTextActive: {
      color: theme.background,
    },
    restaurantsSection: {
      paddingHorizontal: 20,
      paddingBottom: 20,
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: "bold",
      color: theme.text,
      marginBottom: 16,
    },
    restaurantCard: {
      backgroundColor: theme.cardBackground,
      borderRadius: 16,
      marginBottom: 16,
      shadowColor: theme.shadow,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 5,
      overflow: "hidden",
    },
    restaurantCardClosed: {
      opacity: 0.7,
    },
    restaurantImageContainer: {
      position: "relative",
      height: 160,
    },
    restaurantImage: {
      width: "100%",
      height: "100%",
      resizeMode: "cover",
    },
    closedOverlay: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(0,0,0,0.5)",
      justifyContent: "center",
      alignItems: "center",
    },
    closedText: {
      color: "white",
      fontSize: 18,
      fontWeight: "bold",
    },
    customizableBadge: {
      position: "absolute",
      top: 12,
      right: 12,
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: theme.primary,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
    },
    customizableText: {
      color: theme.background,
      fontSize: 10,
      fontWeight: "600",
      marginLeft: 4,
    },
    restaurantInfo: {
      padding: 16,
    },
    restaurantHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 8,
    },
    restaurantName: {
      fontSize: 18,
      fontWeight: "bold",
      color: theme.text,
      flex: 1,
    },
    ratingContainer: {
      flexDirection: "row",
      alignItems: "center",
    },
    ratingText: {
      fontSize: 14,
      fontWeight: "600",
      color: theme.text,
      marginLeft: 4,
    },
    restaurantDescription: {
      fontSize: 14,
      color: theme.textSecondary,
      marginBottom: 12,
      lineHeight: 20,
    },
    restaurantFooter: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    specialtyContainer: {
      flexDirection: "row",
      alignItems: "center",
      flex: 1,
    },
    specialtyText: {
      fontSize: 12,
      color: theme.primary,
      fontWeight: "500",
      marginLeft: 4,
    },
    deliveryContainer: {
      flexDirection: "row",
      alignItems: "center",
    },
    deliveryText: {
      fontSize: 12,
      color: theme.textSecondary,
      marginLeft: 4,
    },
    emptyStateContainer: {
      alignItems: "center",
      paddingVertical: 40,
    },
    emptyTitle: {
      fontSize: 18,
      fontWeight: "600",
      color: theme.text,
      marginTop: 16,
      marginBottom: 8,
    },
    emptySubtitle: {
      fontSize: 14,
      color: theme.textSecondary,
      textAlign: "center",
      lineHeight: 20,
      paddingHorizontal: 40,
    },
  });

export default HomeScreen;
