import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, 
  Modal,
  FlatList,
  Image,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../../context/ThemeContext';
import { getProductsByRestaurant } from '../../../../services/productService';

const ProductSelector = ({ 
  restaurantId,
  selectedProducts = [], 
  onProductsChange,
  maxProducts = 20,
  disabled = false 
}) => {
  const { theme } = useTheme();
  const [availableProducts, setAvailableProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // Cargar productos disponibles cuando cambia el restaurante
  useEffect(() => {
    if (restaurantId) {
      loadProducts();
    } else {
      setAvailableProducts([]);
      setLoading(false);
    }
  }, [restaurantId]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const products = await getProductsByRestaurant(restaurantId, { is_available: true });
      setAvailableProducts(products);
    } catch (error) {
      console.error('Error loading products:', error);
      Alert.alert('Error', 'No se pudieron cargar los productos disponibles');
      setAvailableProducts([]);
    } finally {
      setLoading(false);
    }
  };

  // Manejar selección/deselección de producto
  const handleProductToggle = (product) => {
    if (disabled) return;

    const isSelected = selectedProducts.some(selectedProduct => selectedProduct._id === product._id);
    
    if (isSelected) {
      // Remover producto
      const newProducts = selectedProducts.filter(selectedProduct => selectedProduct._id !== product._id);
      onProductsChange(newProducts);
    } else {
      // Agregar producto (validar máximo)
      if (selectedProducts.length >= maxProducts) {
        Alert.alert(
          'Límite alcanzado', 
          `Solo puedes seleccionar máximo ${maxProducts} productos`
        );
        return;
      }
      
      const newProducts = [...selectedProducts, product];
      onProductsChange(newProducts);
    }
  };

  // Renderizar item de producto en el modal
  const renderProductModalItem = ({ item }) => {
    const isSelected = selectedProducts.some(selectedProduct => selectedProduct._id === item._id);
    
    return (
      <TouchableOpacity
        style={[
          styles.productModalItem,
          isSelected && styles.productModalItemSelected
        ]}
        onPress={() => handleProductToggle(item)}
      >
        <Image 
          source={{ 
            uri: item.image || `https://placehold.co/400x300?text=${encodeURIComponent(item.name)}`
          }} 
          style={styles.productModalImage}
        />
        
        <View style={styles.productModalInfo}>
          <Text style={[styles.productModalName, { color: theme.text }]} numberOfLines={1}>
            {item.name}
          </Text>
          <Text style={[styles.productModalCategory, { color: theme.textSecondary }]}>
            {item.category_id?.name}
          </Text>
          <Text style={[styles.productModalPrice, { color: theme.primary }]}>
            ₡{item.price?.toLocaleString()}
          </Text>
        </View>
        
        {isSelected && (
          <Ionicons name="checkmark-circle" size={24} color={theme.primary} />
        )}
      </TouchableOpacity>
    );
  };

  // Renderizar producto seleccionado compacto
  const renderSelectedProduct = (product) => (
    <View key={product._id} style={styles.selectedProductItem}>
      <Image 
        source={{ 
          uri: product.image || `https://placehold.co/400x300?text=${encodeURIComponent(product.name)}`
        }} 
        style={styles.selectedProductImage}
      />
      <View style={styles.selectedProductInfo}>
        <Text style={[styles.selectedProductName, { color: theme.text }]} numberOfLines={1}>
          {product.name}
        </Text>
        <Text style={[styles.selectedProductCategory, { color: theme.textSecondary }]}>
          {product.category_id?.name}
        </Text>
      </View>
      {!disabled && (
        <TouchableOpacity 
          onPress={() => handleProductToggle(product)}
          style={styles.removeProductButton}
        >
          <Ionicons name="close-circle" size={20} color={theme.danger} />
        </TouchableOpacity>
      )}
    </View>
  );

  const styles = createStyles(theme);

  if (!restaurantId) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.sectionTitle}>Productos Compatibles</Text>
        </View>
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
            Selecciona un restaurante primero para ver los productos disponibles
          </Text>
        </View>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.sectionTitle}>Productos Compatibles</Text>
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: theme.textSecondary }]}>
            Cargando productos...
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.sectionTitle}>Productos Compatibles</Text>
        <Text style={[styles.counter, { color: theme.textSecondary }]}>
          {selectedProducts.length}/{maxProducts}
        </Text>
      </View>
      
      <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
        Selecciona los productos con los que este topping es compatible
      </Text>
      
      {/* Botón para abrir modal */}
      <TouchableOpacity
        style={[styles.selectButton, disabled && styles.selectButtonDisabled]}
        onPress={() => setShowModal(true)}
        disabled={disabled}
      >
        <Ionicons name="add-circle-outline" size={20} color={theme.primary} />
        <Text style={[styles.selectButtonText, { color: theme.primary }]}>
          Seleccionar Productos
        </Text>
      </TouchableOpacity>
      
      {/* Lista de productos seleccionados */}
      {selectedProducts.length > 0 && (
        <View style={styles.selectedContainer}>
          <Text style={[styles.selectedTitle, { color: theme.text }]}>
            Productos seleccionados:
          </Text>
          <View style={styles.selectedProductsList}>
            {selectedProducts.map(product => renderSelectedProduct(product))}
          </View>
        </View>
      )}

      {/* Modal de selección */}
      <Modal
        visible={showModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>
                Seleccionar Productos
              </Text>
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setShowModal(false)}
              >
                <Ionicons name="close" size={24} color={theme.text} />
              </TouchableOpacity>
            </View>
            
            <FlatList
              data={availableProducts}
              keyExtractor={(item) => item._id}
              renderItem={renderProductModalItem}
              style={styles.modalList}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Ionicons name="fast-food-outline" size={50} color={theme.textSecondary} />
                  <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
                    No hay productos disponibles en este restaurante
                  </Text>
                </View>
              }
            />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const createStyles = (theme) => StyleSheet.create({
  container: {
    marginBottom: 30,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.text,
  },
  counter: {
    fontSize: 14,
    fontWeight: '500',
  },
  subtitle: {
    fontSize: 14,
    marginBottom: 15,
    lineHeight: 20,
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 14,
  },
  selectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.cardBackground,
    borderWidth: 2,
    borderColor: theme.primary,
    borderStyle: 'dashed',
    borderRadius: 12,
    paddingVertical: 15,
    marginBottom: 15,
  },
  selectButtonDisabled: {
    opacity: 0.6,
  },
  selectButtonText: {
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
  },
  selectedContainer: {
    padding: 15,
    backgroundColor: theme.background,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.border,
  },
  selectedTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 10,
  },
  selectedProductsList: {
    gap: 8,
  },
  selectedProductItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.cardBackground,
    borderRadius: 8,
    padding: 8,
  },
  selectedProductImage: {
    width: 40,
    height: 30,
    borderRadius: 4,
    marginRight: 10,
    resizeMode: 'cover',
  },
  selectedProductInfo: {
    flex: 1,
  },
  selectedProductName: {
    fontSize: 14,
    fontWeight: '500',
  },
  selectedProductCategory: {
    fontSize: 11,
    marginTop: 1,
  },
  removeProductButton: {
    padding: 4,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  emptyText: {
    fontSize: 14,
    marginTop: 10,
    textAlign: 'center',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: theme.cardBackground,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  modalCloseButton: {
    padding: 5,
  },
  modalList: {
    padding: 20,
  },
  productModalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: theme.background,
  },
  productModalItemSelected: {
    borderWidth: 2,
    borderColor: theme.primary,
  },
  productModalImage: {
    width: 60,
    height: 45,
    borderRadius: 6,
    marginRight: 12,
    resizeMode: 'cover',
  },
  productModalInfo: {
    flex: 1,
    marginRight: 10,
  },
  productModalName: {
    fontSize: 15,
    fontWeight: '500',
    marginBottom: 2,
  },
  productModalCategory: {
    fontSize: 12,
    marginBottom: 2,
  },
  productModalPrice: {
    fontSize: 13,
    fontWeight: '600',
  },
});

export default ProductSelector;