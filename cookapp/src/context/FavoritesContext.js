import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const FavoritesContext = createContext({});

export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error('useFavorites must be used within FavoritesProvider');
  }
  return context;
};

export const FavoritesProvider = ({ children }) => {
  const [favoriteRestaurants, setFavoriteRestaurants] = useState([]);
  const [favoriteProducts, setFavoriteProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Cargar favoritos desde AsyncStorage al iniciar
  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    try {
      setLoading(true);
      const [restaurants, products] = await Promise.all([
        AsyncStorage.getItem('favoriteRestaurants'),
        AsyncStorage.getItem('favoriteProducts')
      ]);

      // Asegurar que siempre sean arrays
      const parsedRestaurants = restaurants ? JSON.parse(restaurants) : [];
      const parsedProducts = products ? JSON.parse(products) : [];

      setFavoriteRestaurants(Array.isArray(parsedRestaurants) ? parsedRestaurants : []);
      setFavoriteProducts(Array.isArray(parsedProducts) ? parsedProducts : []);
    } catch (error) {
      console.error('Error loading favorites:', error);
      // En caso de error, establecer arrays vacíos
      setFavoriteRestaurants([]);
      setFavoriteProducts([]);
    } finally {
      setLoading(false);
    }
  };

  // Guardar favoritos en AsyncStorage
  const saveFavorites = async (type, favorites) => {
    try {
      await AsyncStorage.setItem(type, JSON.stringify(favorites));
    } catch (error) {
      console.error('Error saving favorites:', error);
    }
  };

  // RESTAURANTES
  const toggleRestaurantFavorite = async (restaurant) => {
    try {
      if (!restaurant || !restaurant._id) {
        console.error('Invalid restaurant object');
        return false;
      }

      const isCurrentlyFavorite = favoriteRestaurants.some(fav => fav._id === restaurant._id);
      
      let newFavorites;
      if (isCurrentlyFavorite) {
        // Remover de favoritos
        newFavorites = favoriteRestaurants.filter(fav => fav._id !== restaurant._id);
      } else {
        // Agregar a favoritos
        newFavorites = [...favoriteRestaurants, restaurant];
      }

      setFavoriteRestaurants(newFavorites);
      await saveFavorites('favoriteRestaurants', newFavorites);
      
      return !isCurrentlyFavorite; // Retorna el nuevo estado
    } catch (error) {
      console.error('Error toggling restaurant favorite:', error);
      return null;
    }
  };

  const isRestaurantFavorite = (restaurantId) => {
    if (!restaurantId) return false;
    return favoriteRestaurants.some(fav => fav._id === restaurantId);
  };

  // PRODUCTOS
  const toggleProductFavorite = async (product, restaurant) => {
    try {
      if (!product || !product._id) {
        console.error('Invalid product object');
        return false;
      }

      const isCurrentlyFavorite = favoriteProducts.some(fav => fav._id === product._id);
      
      let newFavorites;
      if (isCurrentlyFavorite) {
        // Remover de favoritos
        newFavorites = favoriteProducts.filter(fav => fav._id !== product._id);
      } else {
        // Agregar a favoritos (incluimos info del restaurante si está disponible)
        const productWithRestaurant = {
          ...product,
          restaurant: restaurant ? {
            _id: restaurant._id,
            name: restaurant.name,
            banner: restaurant.banner || restaurant.image
          } : null
        };
        newFavorites = [...favoriteProducts, productWithRestaurant];
      }

      setFavoriteProducts(newFavorites);
      await saveFavorites('favoriteProducts', newFavorites);
      
      return !isCurrentlyFavorite; // Retorna el nuevo estado
    } catch (error) {
      console.error('Error toggling product favorite:', error);
      return null;
    }
  };

  const isProductFavorite = (productId) => {
    if (!productId) return false;
    return favoriteProducts.some(fav => fav._id === productId);
  };

  // UTILIDADES
  const clearAllFavorites = async () => {
    try {
      setFavoriteRestaurants([]);
      setFavoriteProducts([]);
      await Promise.all([
        AsyncStorage.removeItem('favoriteRestaurants'),
        AsyncStorage.removeItem('favoriteProducts')
      ]);
    } catch (error) {
      console.error('Error clearing favorites:', error);
    }
  };

  const getFavoritesCount = () => {
    return {
      restaurants: favoriteRestaurants.length,
      products: favoriteProducts.length,
      total: favoriteRestaurants.length + favoriteProducts.length
    };
  };

  const value = {
    // Estados
    favoriteRestaurants: favoriteRestaurants || [],
    favoriteProducts: favoriteProducts || [],
    loading,
    
    // Métodos para restaurantes
    toggleRestaurantFavorite,
    isRestaurantFavorite,
    
    // Métodos para productos
    toggleProductFavorite,
    isProductFavorite,
    
    // Utilidades
    clearAllFavorites,
    getFavoritesCount,
    loadFavorites
  };

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
};