import React, { useState, useEffect, useCallback } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, 
  FlatList,
  Image,
  Alert,
  RefreshControl,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../context/ThemeContext';
import { getAllRestaurants, getRestaurantsByOwner } from '../../../services/restaurantService';

const ManageRestaurantsScreen = ({ navigation, user }) => {
  const { theme } = useTheme();
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Cargar restaurantes según el rol
  const loadRestaurants = useCallback(async () => {
    try {
      setLoading(true);
      let restaurantsData = [];
      
      if (user?.role === 'admin') {
        // Admin ve todos los restaurantes
        restaurantsData = await getAllRestaurants();
      } else if (user?.role === 'owner') {
        // Owner ve solo sus restaurantes
        restaurantsData = await getRestaurantsByOwner(user._id, user._id);
      }
      
      setRestaurants(restaurantsData);
    } catch (error) {
      console.error('Error loading restaurants:', error);
      Alert.alert('Error', 'No se pudieron cargar los restaurantes');
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Efecto para cargar datos iniciales
  useEffect(() => {
    loadRestaurants();
  }, [loadRestaurants]);

  // Escuchar cuando regrese de otras pantallas para recargar datos
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      // Se ejecuta cuando regresa a esta pantalla
      loadRestaurants();
    });

    return unsubscribe;
  }, [navigation, loadRestaurants]);

  // Escuchar cuando regrese de otras pantallas para recargar datos
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      // Se ejecuta cuando regresa a esta pantalla
      loadRestaurants();
    });

    return unsubscribe;
  }, [navigation, loadRestaurants]);

  // Refresh pull-to-refresh
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadRestaurants();
    setRefreshing(false);
  }, [loadRestaurants]);

  // Navegar a editar restaurante (sin pasar función)
  const handleEditRestaurant = (restaurant) => {
    navigation.navigate('UpdateRestaurant', { 
      restaurant,
      user
    });
  };

  // Renderizar item de restaurante
  const renderRestaurantItem = ({ item }) => (
    <View style={styles.restaurantCard}>
      <Image 
        source={{ 
          uri: item.banner || `https://placehold.co/800x300?text=${encodeURIComponent(item.name)}`
        }} 
        style={styles.restaurantBanner}
      />
      
      <View style={styles.restaurantInfo}>
        <Text style={[styles.restaurantName, { color: theme.text }]} numberOfLines={1}>
          {item.name}
        </Text>
        
        <Text style={[styles.restaurantDescription, { color: theme.textSecondary }]} numberOfLines={2}>
          {item.description}
        </Text>
        
        {/* Info del owner (solo para admin) */}
        {user?.role === 'admin' && item.owner_id && (
          <View style={styles.ownerInfo}>
            <Ionicons name="person-outline" size={14} color={theme.textSecondary} />
            <Text style={[styles.ownerText, { color: theme.textSecondary }]}>
              {item.owner_id.name}
            </Text>
          </View>
        )}
        
        <View style={styles.restaurantMeta}>
          <View style={styles.addressInfo}>
            <Ionicons name="location-outline" size={14} color={theme.textSecondary} />
            <Text style={[styles.addressText, { color: theme.textSecondary }]}>
              {item.address.city}, {item.address.province}
            </Text>
          </View>
          
          <TouchableOpacity 
            style={[styles.editButton, { backgroundColor: theme.primary }]}
            onPress={() => handleEditRestaurant(item)}
          >
            <Ionicons name="pencil" size={16} color="#ffffff" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  // Componente de estado vacío
  const EmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons 
        name="restaurant-outline" 
        size={60} 
        color={theme.textSecondary} 
      />
      <Text style={[styles.emptyTitle, { color: theme.text }]}>
        {user?.role === 'admin' ? 'No hay restaurantes en el sistema' : 'No tienes restaurantes'}
      </Text>
      <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
        {user?.role === 'admin' 
          ? 'Los restaurantes aparecerán aquí cuando sean creados'
          : 'Contacta al administrador para que te asigne un restaurante'
        }
      </Text>
    </View>
  );

  const styles = createStyles(theme);

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={theme.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Gestionar Restaurantes</Text>
          <View style={styles.placeholder} />
        </View>
        
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={[styles.loadingText, { color: theme.textSecondary }]}>
            Cargando restaurantes...
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Gestionar Restaurantes</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Lista de restaurantes */}
      <FlatList
        data={restaurants}
        keyExtractor={(item) => item._id}
        renderItem={renderRestaurantItem}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[theme.primary]}
            tintColor={theme.primary}
          />
        }
        ListEmptyComponent={EmptyState}
      />
    </View>
  );
};

const createStyles = (theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    backgroundColor: theme.cardBackground,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: theme.background,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.text,
  },
  placeholder: {
    width: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },
  listContainer: {
    padding: 20,
  },
  restaurantCard: {
    backgroundColor: theme.cardBackground,
    borderRadius: 15,
    marginBottom: 15,
    shadowColor: theme.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    overflow: 'hidden',
  },
  restaurantBanner: {
    width: '100%',
    height: 120,
    resizeMode: 'cover',
  },
  restaurantInfo: {
    padding: 15,
  },
  restaurantName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  restaurantDescription: {
    fontSize: 14,
    lineHeight: 18,
    marginBottom: 10,
  },
  ownerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  ownerText: {
    fontSize: 12,
    marginLeft: 5,
    fontStyle: 'italic',
  },
  restaurantMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  addressInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  addressText: {
    fontSize: 12,
    marginLeft: 5,
  },
  editButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 15,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 20,
  },
});

export default ManageRestaurantsScreen;