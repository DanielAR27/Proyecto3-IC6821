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
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../context/ThemeContext';
import { 
  getAllCategories, 
  deleteCategory, 
  reactivateCategory 
} from '../../../services/categoryService';
import { getRestaurantById } from '../../../services/restaurantService';

const ManageCategoriesScreen = ({ navigation, user }) => {
  const { theme } = useTheme();
  const [categories, setCategories] = useState([]);
  const [groupedCategories, setGroupedCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Cargar categorías
  const loadCategories = useCallback(async () => {
    try {
      setLoading(true);
      const categoriesData = await getAllCategories(user?._id);
      setCategories(categoriesData);
      groupCategoriesByRestaurant(categoriesData);
    } catch (error) {
      console.error('Error loading categories:', error);
      Alert.alert('Error', 'No se pudieron cargar las categorías');
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Agrupar categorías por restaurante
  const groupCategoriesByRestaurant = (categoriesData) => {
    const grouped = categoriesData.reduce((acc, category) => {
      const restaurantId = category.restaurant_id._id;
      const restaurantName = category.restaurant_id.name;
      
      if (!acc[restaurantId]) {
        acc[restaurantId] = {
          restaurant: {
            _id: restaurantId,
            name: restaurantName
          },
          categories: []
        };
      }
      
      acc[restaurantId].categories.push(category);
      return acc;
    }, {});

    // Convertir a array y ordenar categorías por order
    const groupedArray = Object.values(grouped).map(group => ({
      ...group,
      categories: group.categories.sort((a, b) => a.order - b.order)
    }));

    // Ordenar grupos por nombre de restaurante
    groupedArray.sort((a, b) => a.restaurant.name.localeCompare(b.restaurant.name));
    
    setGroupedCategories(groupedArray);
  };

  // Efecto para cargar datos iniciales
  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  // Escuchar cuando regrese de otras pantallas para recargar datos
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadCategories();
    });

    return unsubscribe;
  }, [navigation, loadCategories]);

  // Refresh pull-to-refresh
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadCategories();
    setRefreshing(false);
  }, [loadCategories]);

  // Navegar a agregar categoría
  const handleAddCategory = () => {
    navigation.navigate('AddCategory', { user });
  };

    // Navegar a editar categoría
    const handleEditCategory = async (category) => {
    try {
        // Cargar restaurante completo con address
        const fullRestaurant = await getRestaurantById(category.restaurant_id._id);
        
        navigation.navigate('AddCategory', { 
        user,
        category: {
            ...category,
            restaurant_id: fullRestaurant // Reemplazar con el restaurante completo
        },
        isEdit: true
        });
    } catch (error) {
        console.error('Error loading restaurant details:', error);
        // Fallback: navegar con datos incompletos
        navigation.navigate('AddCategory', { 
        user,
        category,
        isEdit: true
        });
    }
    };

  // Eliminar categoría
  const handleDeleteCategory = (category) => {
    Alert.alert(
      'Eliminar Categoría',
      `¿Está seguro de que desea eliminar "${category.name}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => confirmDeleteCategory(category)
        }
      ]
    );
  };

  const confirmDeleteCategory = async (category) => {
    try {
      await deleteCategory(category._id, user?._id);
      Alert.alert('¡Éxito!', 'Categoría eliminada exitosamente');
      loadCategories(); // Recargar lista
    } catch (error) {
      console.error('Error deleting category:', error);
      Alert.alert('Error', error.message || 'No se pudo eliminar la categoría');
    }
  };

    // Renderizar item de categoría
    const renderCategoryItem = (category) => (
    <View 
        key={category._id}
        style={[
        styles.categoryItem,
        !category.is_active && styles.categoryItemInactive
        ]}
    >
        <View style={styles.categoryInfo}>
        <View style={styles.categoryHeader}>
            <Text style={[
            styles.categoryName, 
            { color: category.is_active ? theme.text : theme.textSecondary }
            ]}>
            {category.name}
            </Text>
            {!category.is_active && (
            <View style={styles.inactiveBadge}>
                <Text style={styles.inactiveBadgeText}>Inactivo</Text>
            </View>
            )}
        </View>
        
        {category.description ? (
            <Text style={[styles.categoryDescription, { color: theme.textSecondary }]}>
            {category.description}
            </Text>
        ) : null}
        </View>
        
        {/* Badge del orden */}
        <Text style={[styles.orderText, { color: theme.textSecondary }]}>
        #{category.order}
        </Text>
        
        {/* Botones de acción */}
        <View style={styles.categoryActions}>
        {category.is_active && (
            <>
            <TouchableOpacity 
                style={[styles.actionButton, { backgroundColor: theme.primary }]}
                onPress={() => handleEditCategory(category)}
            >
                <Ionicons name="pencil" size={16} color="#ffffff" />
            </TouchableOpacity>
            
            <TouchableOpacity 
                style={[styles.actionButton, { backgroundColor: theme.danger }]}
                onPress={() => handleDeleteCategory(category)}
            >
                <Ionicons name="trash" size={16} color="#ffffff" />
            </TouchableOpacity>
            </>
        )}
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
        <Text style={[styles.categoryCount, { color: theme.textSecondary }]}>
          ({item.categories.length} {item.categories.length === 1 ? 'categoría' : 'categorías'})
        </Text>
      </View>
      
      <View style={styles.categoriesList}>
        {item.categories.map(category => renderCategoryItem(category))}
      </View>
    </View>
  );

  // Componente de estado vacío
  const EmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons 
        name="albums-outline" 
        size={60} 
        color={theme.textSecondary} 
      />
      <Text style={[styles.emptyTitle, { color: theme.text }]}>
        No hay categorías creadas
      </Text>
      <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
        Las categorías ayudan a organizar los productos de cada restaurante
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
          <Text style={styles.headerTitle}>Gestionar Categorías</Text>
          <TouchableOpacity style={styles.addButton} onPress={handleAddCategory}>
            <Ionicons name="add" size={24} color={theme.text} />
          </TouchableOpacity>
        </View>
        
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={[styles.loadingText, { color: theme.textSecondary }]}>
            Cargando categorías...
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
        <Text style={styles.headerTitle}>Gestionar Categorías</Text>
        <TouchableOpacity style={styles.addButton} onPress={handleAddCategory}>
          <Ionicons name="add" size={24} color={theme.text} />
        </TouchableOpacity>
      </View>

      {/* Lista de categorías agrupadas por restaurante */}
      <FlatList
        data={groupedCategories}
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
  categoryCount: {
    fontSize: 12,
    fontStyle: 'italic',
  },
  categoriesList: {
    padding: 10,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginVertical: 2,
    borderRadius: 8,
    backgroundColor: theme.background,
  },
  categoryItemInactive: {
    opacity: 0.6,
  },
  categoryInfo: {
    flex: 1,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '500',
    flex: 1,
    marginRight: 10,
  },
  orderText: {
    fontSize: 11,
    fontWeight: '600',
    backgroundColor: theme.border,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    minWidth: 24,
    textAlign: 'center',
    marginRight: 12
  },
  inactiveBadge: {
    backgroundColor: theme.textSecondary,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  inactiveBadgeText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '500',
  },
  categoryDescription: {
    fontSize: 12,
    fontStyle: 'italic',
  },
  categoryActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 20,
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

export default ManageCategoriesScreen;