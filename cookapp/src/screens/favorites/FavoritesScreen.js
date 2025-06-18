import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Image,
  RefreshControl
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { useFavorites } from '../../context/FavoritesContext';

const FavoritesScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const { 
    favoriteRestaurants, 
    favoriteProducts, 
    loading,
    loadFavorites
  } = useFavorites();
  
  const [activeTab, setActiveTab] = useState('restaurants');
  const [refreshing, setRefreshing] = useState(false);

  const styles = createStyles(theme);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadFavorites();
    setRefreshing(false);
  };

  const formatPrice = (price) => {
    return `₡${price?.toLocaleString('es-CR') || '0'}`;
  };

  const handleRestaurantPress = (restaurant) => {
    navigation.navigate('Restaurant', {
      restaurantId: restaurant._id,
      restaurantName: restaurant.name
    });
  };

  const handleProductPress = (product) => {
    navigation.navigate('ProductDetail', {
      product: product,
      restaurant: product.restaurant
    });
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons 
        name="heart-outline" 
        size={80} 
        color={theme.textSecondary} 
      />
      <Text style={styles.emptyTitle}>
        {activeTab === 'restaurants' ? 'Sin restaurantes favoritos' : 'Sin productos favoritos'}
      </Text>
      <Text style={styles.emptySubtitle}>
        {activeTab === 'restaurants' 
          ? 'Los restaurantes que marques como favoritos aparecerán aquí' 
          : 'Los productos que marques como favoritos aparecerán aquí'
        }
      </Text>
    </View>
  );

  const renderRestaurantItem = (restaurant) => (
    <TouchableOpacity
      key={restaurant._id}
      style={styles.favoriteItem}
      onPress={() => handleRestaurantPress(restaurant)}
    >
      <Image
        source={{ uri: restaurant.banner || restaurant.image }}
        style={styles.restaurantImage}
        resizeMode="cover"
      />
      <View style={styles.itemInfo}>
        <Text style={styles.itemName} numberOfLines={1}>
          {restaurant.name}
        </Text>
        <Text style={styles.itemDescription} numberOfLines={2}>
          {restaurant.description}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const renderProductItem = (product) => (
    <TouchableOpacity
      key={product._id}
      style={styles.favoriteItem}
      onPress={() => handleProductPress(product)}
    >
      <Image
        source={{ uri: product.image }}
        style={styles.productImage}
        resizeMode="cover"
      />
      <View style={styles.itemInfo}>
        <Text style={styles.itemName} numberOfLines={1}>
          {product.name}
        </Text>
        <Text style={styles.itemDescription} numberOfLines={2}>
          {product.description}
        </Text>
        <Text style={styles.itemPrice}>
          {formatPrice(product.price)}
        </Text>
      </View>
    </TouchableOpacity>
  );

  // Datos seguros con verificación
  const safeRestaurants = favoriteRestaurants || [];
  const safeProducts = favoriteProducts || [];
  const totalFavorites = safeRestaurants.length + safeProducts.length;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mis Favoritos</Text>
        <Text style={styles.headerSubtitle}>
          {totalFavorites} {totalFavorites === 1 ? 'favorito' : 'favoritos'}
        </Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'restaurants' && styles.activeTab
          ]}
          onPress={() => setActiveTab('restaurants')}
        >
          <Ionicons 
            name="restaurant-outline" 
            size={20} 
            color={activeTab === 'restaurants' ? theme.primary : theme.textSecondary} 
          />
          <Text style={[
            styles.tabText,
            { color: activeTab === 'restaurants' ? theme.primary : theme.textSecondary }
          ]}>
            Restaurantes ({safeRestaurants.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'products' && styles.activeTab
          ]}
          onPress={() => setActiveTab('products')}
        >
          <Ionicons 
            name="fast-food-outline" 
            size={20} 
            color={activeTab === 'products' ? theme.primary : theme.textSecondary} 
          />
          <Text style={[
            styles.tabText,
            { color: activeTab === 'products' ? theme.primary : theme.textSecondary }
          ]}>
            Productos ({safeProducts.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
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
        {activeTab === 'restaurants' ? (
          safeRestaurants.length === 0 ? (
            renderEmptyState()
          ) : (
            <View style={styles.favoritesGrid}>
              {safeRestaurants.map(renderRestaurantItem)}
            </View>
          )
        ) : (
          safeProducts.length === 0 ? (
            renderEmptyState()
          ) : (
            <View style={styles.favoritesGrid}>
              {safeProducts.map(renderProductItem)}
            </View>
          )
        )}
      </ScrollView>
    </View>
  );
};

const createStyles = (theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  header: {
    padding: 20,
    paddingTop: 60,
    backgroundColor: theme.cardBackground,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: theme.text,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: theme.textSecondary,
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: theme.cardBackground,
    paddingHorizontal: 20,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: theme.primary,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  content: {
    flex: 1,
  },
  favoritesGrid: {
    padding: 16,
  },
  favoriteItem: {
    flexDirection: 'row',
    backgroundColor: theme.cardBackground,
    borderRadius: 12,
    marginBottom: 12,
    padding: 12,
    shadowColor: theme.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  restaurantImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 12,
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 12,
  },
  itemInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  itemName: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.text,
    marginBottom: 4,
  },
  itemDescription: {
    fontSize: 14,
    color: theme.textSecondary,
    lineHeight: 20,
    marginBottom: 8,
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.primary,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.text,
    marginTop: 20,
    marginBottom: 10,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    color: theme.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
});

export default FavoritesScreen;