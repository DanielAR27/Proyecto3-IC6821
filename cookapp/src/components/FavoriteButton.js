import React, { useState } from 'react';
import { TouchableOpacity, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useFavorites } from '../context/FavoritesContext';

const FavoriteButton = ({ 
  type, 
  item, 
  restaurant, 
  size = 'medium', 
  showBackground = true,
  style = {},
  iconColor = null
}) => {
  const { theme } = useTheme();
  const { 
    toggleRestaurantFavorite, 
    toggleProductFavorite, 
    isRestaurantFavorite, 
    isProductFavorite 
  } = useFavorites();
  
  const [isAnimating, setIsAnimating] = useState(false);

  // Determinar si es favorito
  const isFavorite = type === 'restaurant' 
    ? isRestaurantFavorite(item._id)
    : isProductFavorite(item._id);

  // Configuración de tamaños
  const sizeConfig = {
    small: { icon: 16, container: 28 },
    medium: { icon:20, container: 36 },
    large: { icon: 24, container: 44 }
  };

  const { icon: iconSize, container: containerSize } = sizeConfig[size];

  const handlePress = async () => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    
    try {
      let newState;
      if (type === 'restaurant') {
        newState = await toggleRestaurantFavorite(item);
      } else {
        newState = await toggleProductFavorite(item, restaurant);
      }
      
      // Pequeña animación
      setTimeout(() => setIsAnimating(false), 200);
      
    } catch (error) {
      console.error('Error toggling favorite:', error);
      setIsAnimating(false);
    }
  };

  const styles = createStyles(theme, containerSize, showBackground);

  return (
    <TouchableOpacity
      style={[styles.container, style]}
      onPress={handlePress}
      activeOpacity={0.8}
    >
      <Ionicons
        name={isFavorite ? "heart" : "heart-outline"}
        size={iconSize}
        color={isFavorite ? "#FF6B6B" : (iconColor || theme.textSecondary)}
      />
    </TouchableOpacity>
  );
};

const createStyles = (theme, containerSize, showBackground) => StyleSheet.create({
  container: {
    width: containerSize,
    height: containerSize,
    borderRadius: containerSize / 2,
    backgroundColor: showBackground ? theme.cardBackground : 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: showBackground ? theme.shadow : 'transparent',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: showBackground ? 0.1 : 0,
    shadowRadius: 4,
    elevation: showBackground ? 3 : 0,
  },
});

export default FavoriteButton;