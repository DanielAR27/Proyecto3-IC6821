import React, { useState, useEffect, useCallback } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, 
  FlatList,
  Alert,
  RefreshControl,
  ActivityIndicator
} from 'react-native';
import { AntDesign, Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../context/ThemeContext';
import { getAllToppings, deleteTopping } from '../../../services/toppingService';

const ManageToppingsScreen = ({ navigation, user }) => {
  const { theme } = useTheme();
  const [toppings, setToppings] = useState([]);
  const [groupedToppings, setGroupedToppings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Cargar toppings
  const loadToppings = useCallback(async () => {
    try {
      setLoading(true);
      const toppingsData = await getAllToppings(user?._id);
      setToppings(toppingsData);
      groupToppingsByRestaurant(toppingsData);
    } catch (error) {
      console.error('Error loading toppings:', error);
      Alert.alert('Error', 'No se pudieron cargar los toppings');
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Agrupar toppings por restaurante
  const groupToppingsByRestaurant = (toppingsData) => {
    const grouped = toppingsData.reduce((acc, topping) => {
      const restaurantId = topping.restaurant_id._id;
      const restaurantName = topping.restaurant_id.name;
      
      if (!acc[restaurantId]) {
        acc[restaurantId] = {
          restaurant: {
            _id: restaurantId,
            name: restaurantName
          },
          toppings: []
        };
      }
      
      acc[restaurantId].toppings.push(topping);
      return acc;
    }, {});

    // Convertir a array y ordenar toppings por nombre
    const groupedArray = Object.values(grouped).map(group => ({
      ...group,
      toppings: group.toppings.sort((a, b) => a.name.localeCompare(b.name))
    }));

    // Ordenar grupos por nombre de restaurante
    groupedArray.sort((a, b) => a.restaurant.name.localeCompare(b.restaurant.name));
    
    setGroupedToppings(groupedArray);
  };

  // Efecto para cargar datos iniciales
  useEffect(() => {
    loadToppings();
  }, [loadToppings]);

  // Escuchar cuando regrese de otras pantallas para recargar datos
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadToppings();
    });

    return unsubscribe;
  }, [navigation, loadToppings]);

  // Refresh pull-to-refresh
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadToppings();
    setRefreshing(false);
  }, [loadToppings]);

  // Navegar a agregar topping
  const handleAddTopping = () => {
    navigation.navigate('AddTopping', { user });
  };

  // Navegar a editar topping
  const handleEditTopping = (topping) => {
    navigation.navigate('UpdateTopping', { 
      user,
      topping,
      isEdit: true
    });
  };

  // Eliminar topping
  const handleDeleteTopping = (topping) => {
    Alert.alert(
      'Eliminar Topping',
      `¿Está seguro de que desea eliminar "${topping.name}"? Esta acción no se puede deshacer.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => confirmDeleteTopping(topping)
        }
      ]
    );
  };

  const confirmDeleteTopping = async (topping) => {
    try {
      await deleteTopping(topping._id, user?._id);
      Alert.alert('¡Éxito!', 'Topping eliminado exitosamente');
      loadToppings(); // Recargar lista
    } catch (error) {
      console.error('Error deleting topping:', error);
      Alert.alert('Error', error.message || 'No se pudo eliminar el topping');
    }
  };

  // Formatear precio
  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-CR', {
      style: 'currency',
      currency: 'CRC',
      minimumFractionDigits: 0
    }).format(price);
  };

  // Renderizar item de topping
  const renderToppingItem = (topping) => (
    <View 
      key={topping._id}
      style={[
        styles.toppingItem,
        !topping.is_available && styles.toppingItemUnavailable
      ]}
    >
      <View style={styles.toppingIcon}>
        <AntDesign 
          name="tagso" 
          size={24} 
          color={topping.is_available ? theme.primary : theme.textSecondary} 
        />
      </View>
      
      <View style={styles.toppingInfo}>
        <View style={styles.toppingHeader}>
          <Text style={[
            styles.toppingName, 
            { color: topping.is_available ? theme.text : theme.textSecondary }
          ]} numberOfLines={1}>
            {topping.name}
          </Text>
          
          <View style={styles.toppingPriceContainer}>
            <Text style={[styles.toppingPrice, { color: theme.primary }]}>
              +{formatPrice(topping.price)}
            </Text>
            {!topping.is_available && (
              <View style={[styles.badge, { backgroundColor: theme.danger }]}>
                <Text style={styles.badgeText}>No disponible</Text>
              </View>
            )}
          </View>
        </View>
        
        <Text style={[
          styles.toppingDescription, 
          { color: theme.textSecondary }
        ]} numberOfLines={2}>
          {topping.description}
        </Text>
        
        {/* Tags */}
        {topping.tags && topping.tags.length > 0 && (
          <View style={styles.tagsContainer}>
            {topping.tags.slice(0, 3).map((tag) => (
              <View key={tag._id} style={[styles.tag, { backgroundColor: theme.border }]}>
                <Text style={[styles.tagText, { color: theme.textSecondary }]}>
                  {tag.name}
                </Text>
              </View>
            ))}
            {topping.tags.length > 3 && (
              <Text style={[styles.moreTagsText, { color: theme.textSecondary }]}>
                +{topping.tags.length - 3} más
              </Text>
            )}
          </View>
        )}

        {/* Productos compatibles */}
        {topping.compatible_with && topping.compatible_with.length > 0 && (
          <View style={styles.compatibleContainer}>
            <Ionicons name="checkmark-circle-outline" size={12} color={theme.success} />
            <Text style={[styles.compatibleText, { color: theme.textSecondary }]}>
              Compatible con {topping.compatible_with.length} {topping.compatible_with.length === 1 ? 'producto' : 'productos'}
            </Text>
          </View>
        )}
        
        <View style={styles.toppingMeta}>
          <Text style={[styles.metaText, { color: theme.textSecondary }]}>
            Stock: {topping.stock_quantity}
          </Text>
          
          <View style={styles.toppingActions}>
            <TouchableOpacity 
              style={[styles.actionButton, { backgroundColor: theme.primary }]}
              onPress={() => handleEditTopping(topping)}
            >
              <Ionicons name="pencil" size={16} color="#ffffff" />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.actionButton, { backgroundColor: theme.danger }]}
              onPress={() => handleDeleteTopping(topping)}
            >
              <Ionicons name="trash" size={16} color="#ffffff" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );

  // Renderizar grupo de restaurante
  const renderRestaurantGroup = ({ item }) => (
    <View style={styles.restaurantGroup}>
      <View style={styles.restaurantHeader}>
        <Ionicons name="restaurant" size={20} color={theme.primary} />
        <Text style={[styles.restaurantName, { color: theme.text }]}>
          {item.restaurant.name}
        </Text>
        <Text style={[styles.toppingCount, { color: theme.textSecondary }]}>
          ({item.toppings.length} {item.toppings.length === 1 ? 'topping' : 'toppings'})
        </Text>
      </View>
      
      <View style={styles.toppingsList}>
        {item.toppings.map(topping => renderToppingItem(topping))}
      </View>
    </View>
  );

  // Componente de estado vacío
  const EmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons 
        name="add-circle-outline" 
        size={60} 
        color={theme.textSecondary} 
      />
      <Text style={[styles.emptyTitle, { color: theme.text }]}>
        No hay toppings creados
      </Text>
      <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
        Los toppings que crees aparecerán organizados por restaurante
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
          <Text style={styles.headerTitle}>Gestionar Toppings</Text>
          <TouchableOpacity style={styles.addButton} onPress={handleAddTopping}>
            <Ionicons name="add" size={24} color={theme.text} />
          </TouchableOpacity>
        </View>
        
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={[styles.loadingText, { color: theme.textSecondary }]}>
            Cargando toppings...
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
        <Text style={styles.headerTitle}>Gestionar Toppings</Text>
        <TouchableOpacity style={styles.addButton} onPress={handleAddTopping}>
          <Ionicons name="add" size={24} color={theme.text} />
        </TouchableOpacity>
      </View>

      {/* Lista de toppings agrupados por restaurante */}
      <FlatList
        data={groupedToppings}
        keyExtractor={(item) => item.restaurant._id}
        renderItem={renderRestaurantGroup}
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
  addButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: theme.background,
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
  restaurantGroup: {
    backgroundColor: theme.cardBackground,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: theme.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  restaurantHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  restaurantName: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 10,
    flex: 1,
  },
  toppingCount: {
    fontSize: 12,
    fontStyle: 'italic',
  },
  toppingsList: {
    padding: 10,
  },
  toppingItem: {
    flexDirection: 'row',
    padding: 10,
    marginVertical: 5,
    borderRadius: 8,
    backgroundColor: theme.background,
  },
  toppingItemUnavailable: {
    opacity: 0.7,
  },
  toppingIcon: {
    marginRight: 12,
    alignSelf: 'flex-start',
    marginTop: 2,
  },
  toppingInfo: {
    flex: 1,
  },
  toppingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  toppingName: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
    marginRight: 10,
  },
  toppingPriceContainer: {
    alignItems: 'flex-end',
  },
  toppingPrice: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  toppingDescription: {
    fontSize: 13,
    lineHeight: 16,
    marginBottom: 8,
  },
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    marginTop: 2,
  },
  badgeText: {
    color: '#ffffff',
    fontSize: 9,
    fontWeight: '600',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    marginBottom: 6,
  },
  tag: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    marginRight: 4,
    marginBottom: 2,
  },
  tagText: {
    fontSize: 10,
  },
  moreTagsText: {
    fontSize: 10,
    fontStyle: 'italic',
  },
  compatibleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  compatibleText: {
    fontSize: 11,
    marginLeft: 4,
    fontStyle: 'italic',
  },
  toppingMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metaText: {
    fontSize: 11,
  },
  toppingActions: {
    flexDirection: 'row',
    gap: 6,
  },
  actionButton: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 16,
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

export default ManageToppingsScreen;