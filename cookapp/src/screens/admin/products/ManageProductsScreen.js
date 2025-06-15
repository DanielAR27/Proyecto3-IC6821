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
import { getAllProducts, deleteProduct } from '../../../services/productService';

const ManageProductsScreen = ({ navigation, user }) => {
  const { theme } = useTheme();
  const [products, setProducts] = useState([]);
  const [groupedProducts, setGroupedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Cargar productos
  const loadProducts = useCallback(async () => {
    try {
      setLoading(true);
      const productsData = await getAllProducts(user?._id);
      console.log('Productos cargados:', productsData);
      setProducts(productsData);
      groupProductsByRestaurant(productsData);
    } catch (error) {
      console.error('Error loading products:', error);
      Alert.alert('Error', 'No se pudieron cargar los productos');
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Agrupar productos por restaurante
  const groupProductsByRestaurant = (productsData) => {
    const grouped = productsData.reduce((acc, product) => {
      const restaurantId = product.restaurant_id._id;
      const restaurantName = product.restaurant_id.name;
      
      if (!acc[restaurantId]) {
        acc[restaurantId] = {
          restaurant: {
            _id: restaurantId,
            name: restaurantName
          },
          products: []
        };
      }
      
      acc[restaurantId].products.push(product);
      return acc;
    }, {});

    // Convertir a array y ordenar productos por categoría y nombre
    const groupedArray = Object.values(grouped).map(group => ({
      ...group,
      products: group.products.sort((a, b) => {
        // Primero por categoría
        const categoryCompare = a.category_id.name.localeCompare(b.category_id.name);
        if (categoryCompare !== 0) return categoryCompare;
        // Luego por destacado (featured primero)
        if (a.is_featured !== b.is_featured) return b.is_featured ? 1 : -1;
        // Finalmente por nombre
        return a.name.localeCompare(b.name);
      })
    }));

    // Ordenar grupos por nombre de restaurante
    groupedArray.sort((a, b) => a.restaurant.name.localeCompare(b.restaurant.name));
    
    setGroupedProducts(groupedArray);
  };

  // Efecto para cargar datos iniciales
  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  // Escuchar cuando regrese de otras pantallas para recargar datos
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadProducts();
    });

    return unsubscribe;
  }, [navigation, loadProducts]);

  // Refresh pull-to-refresh
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadProducts();
    setRefreshing(false);
  }, [loadProducts]);

  // Navegar a agregar producto
  const handleAddProduct = () => {
    navigation.navigate('AddProduct', { user });
  };

  // Navegar a editar producto
  const handleEditProduct = (product) => {
    navigation.navigate('UpdateProduct', { 
      user,
      product,
      isEdit: true
    });
  };

  // Eliminar producto
  const handleDeleteProduct = (product) => {
    Alert.alert(
      'Eliminar Producto',
      `¿Está seguro de que desea eliminar "${product.name}"? Esta acción no se puede deshacer.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => confirmDeleteProduct(product)
        }
      ]
    );
  };

  const confirmDeleteProduct = async (product) => {
    try {
      await deleteProduct(product._id, user?._id);
      Alert.alert('¡Éxito!', 'Producto eliminado exitosamente');
      loadProducts(); // Recargar lista
    } catch (error) {
      console.error('Error deleting product:', error);
      Alert.alert('Error', error.message || 'No se pudo eliminar el producto');
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

  // Renderizar item de producto
  const renderProductItem = (product) => (
    <View 
      key={product._id}
      style={[
        styles.productItem,
        !product.is_available && styles.productItemUnavailable
      ]}
    >
      <Image 
        source={{ 
          uri: product.image || `https://placehold.co/400x300?text=${encodeURIComponent(product.name)}`
        }} 
        style={styles.productImage}
      />
      
      <View style={styles.productInfo}>
        <View style={styles.productHeader}>
          <View style={styles.productTitleContainer}>
            <Text style={[
              styles.productName, 
              { color: product.is_available ? theme.text : theme.textSecondary }
            ]} numberOfLines={1}>
              {product.name}
            </Text>
            <View style={styles.badges}>
              {product.is_featured && (
                <View style={[styles.badge, { backgroundColor: theme.warning }]}>
                  <Ionicons name="star" size={10} color="#fff" />
                  <Text style={styles.badgeText}>Destacado</Text>
                </View>
              )}
              {!product.is_available && (
                <View style={[styles.badge, { backgroundColor: theme.danger }]}>
                  <Text style={styles.badgeText}>No disponible</Text>
                </View>
              )}
            </View>
          </View>
          
          <Text style={[styles.productPrice, { color: theme.primary }]}>
            {formatPrice(product.price)}
          </Text>
        </View>
        
        <Text style={[styles.categoryName, { color: theme.textSecondary }]}>
          {product.category_id.name}
        </Text>
        
        <Text style={[
          styles.productDescription, 
          { color: theme.textSecondary }
        ]} numberOfLines={2}>
          {product.description}
        </Text>
        
        {/* Tags */}
        {product.tags && product.tags.length > 0 && (
          <View style={styles.tagsContainer}>
            {product.tags.slice(0, 3).map((tag) => (
              <View key={tag._id} style={[styles.tag, { backgroundColor: theme.border }]}>
                <Text style={[styles.tagText, { color: theme.textSecondary }]}>
                  {tag.name}
                </Text>
              </View>
            ))}
            {product.tags.length > 3 && (
              <Text style={[styles.moreTagsText, { color: theme.textSecondary }]}>
                +{product.tags.length - 3} más
              </Text>
            )}
          </View>
        )}
        
        <View style={styles.productMeta}>
          <Text style={[styles.metaText, { color: theme.textSecondary }]}>
            {product.preparation_time} min • Stock: {product.stock_quantity}
          </Text>
          
          <View style={styles.productActions}>
            <TouchableOpacity 
              style={[styles.actionButton, { backgroundColor: theme.primary }]}
              onPress={() => handleEditProduct(product)}
            >
              <Ionicons name="pencil" size={16} color="#ffffff" />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.actionButton, { backgroundColor: theme.danger }]}
              onPress={() => handleDeleteProduct(product)}
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
        <Text style={[styles.productCount, { color: theme.textSecondary }]}>
          ({item.products.length} {item.products.length === 1 ? 'producto' : 'productos'})
        </Text>
      </View>
      
      <View style={styles.productsList}>
        {item.products.map(product => renderProductItem(product))}
      </View>
    </View>
  );

  // Componente de estado vacío
  const EmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons 
        name="fast-food-outline" 
        size={60} 
        color={theme.textSecondary} 
      />
      <Text style={[styles.emptyTitle, { color: theme.text }]}>
        No hay productos creados
      </Text>
      <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
        Los productos que crees aparecerán organizados por restaurante
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
          <Text style={styles.headerTitle}>Gestionar Productos</Text>
          <TouchableOpacity style={styles.addButton} onPress={handleAddProduct}>
            <Ionicons name="add" size={24} color={theme.text} />
          </TouchableOpacity>
        </View>
        
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={[styles.loadingText, { color: theme.textSecondary }]}>
            Cargando productos...
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
        <Text style={styles.headerTitle}>Gestionar Productos</Text>
        <TouchableOpacity style={styles.addButton} onPress={handleAddProduct}>
          <Ionicons name="add" size={24} color={theme.text} />
        </TouchableOpacity>
      </View>

      {/* Lista de productos agrupados por restaurante */}
      <FlatList
        data={groupedProducts}
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
  productCount: {
    fontSize: 12,
    fontStyle: 'italic',
  },
  productsList: {
    padding: 10,
  },
  productItem: {
    flexDirection: 'row',
    padding: 10,
    marginVertical: 5,
    borderRadius: 8,
    backgroundColor: theme.background,
  },
  productItemUnavailable: {
    opacity: 0.7,
  },
  productImage: {
    width: 80,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
    resizeMode: 'cover',
  },
  productInfo: {
    flex: 1,
  },
  productHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  productTitleContainer: {
    flex: 1,
    marginRight: 10,
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  categoryName: {
    fontSize: 12,
    marginBottom: 4,
  },
  productDescription: {
    fontSize: 13,
    lineHeight: 16,
    marginBottom: 8,
  },
  badges: {
    flexDirection: 'row',
    gap: 4,
    marginTop: 2,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  badgeText: {
    color: '#ffffff',
    fontSize: 9,
    fontWeight: '600',
    marginLeft: 2,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    marginBottom: 8,
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
  productMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metaText: {
    fontSize: 11,
  },
  productActions: {
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

export default ManageProductsScreen;