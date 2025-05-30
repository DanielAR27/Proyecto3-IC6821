import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, 
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../context/ThemeContext';
import { createProduct } from '../../../services/productService';
import { getAllRestaurants, getRestaurantsByOwner } from '../../../services/restaurantService';
import { getCategoriesByRestaurant } from '../../../services/categoryService';

// Importar componentes
import RestaurantSelector from '../shared_components/RestaurantSelector';
import CategorySelector from './components/CategorySelector';
import ProductForm from './components/ProductForm';
import ProductImageUpload from './components/ProductImageUpload';
import NutritionalInfoForm from '../shared_components/NutritionalInfoForm';
import TagSelector from '../shared_components/TagSelector';

const AddProductScreen = ({ navigation, route }) => {
  const { theme } = useTheme();
  const { user } = route.params || {};

  // Estados principales
  const [loading, setLoading] = useState(false);
  const [restaurants, setRestaurants] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedTags, setSelectedTags] = useState([]);
  const [productImage, setProductImage] = useState(null);

  // Estados del formulario
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    preparation_time: '15',
    stock_quantity: '0',
    is_available: true,
    is_featured: false
  });

  // Estado de información nutricional
  const [nutritionalInfo, setNutritionalInfo] = useState({
    calories: null,
    protein: null,
    carbs: null,
    fat: null,
    fiber: null
  });

  // Cargar restaurantes al montar el componente
  useEffect(() => {
    loadRestaurants();
  }, []);

  // Cargar categorías cuando cambia el restaurante
  useEffect(() => {
    if (selectedRestaurant) {
      loadCategories();
      setSelectedCategory(null); // Reset categoría cuando cambia restaurante
    } else {
      setCategories([]);
      setSelectedCategory(null);
    }
  }, [selectedRestaurant]);

  const loadRestaurants = async () => {
    try {
      let restaurantsData = [];
      
      if (user?.role === 'admin') {
        // Admin ve todos los restaurantes
        restaurantsData = await getAllRestaurants();
      } else if (user?.role === 'owner') {
        // Owner ve solo sus restaurantes
        restaurantsData = await getRestaurantsByOwner(user._id, user._id);
      }
      
      setRestaurants(restaurantsData);
      
      // Si owner tiene solo 1 restaurante, seleccionarlo automáticamente
      if (user?.role === 'owner' && restaurantsData.length === 1) {
        setSelectedRestaurant(restaurantsData[0]);
      }
    } catch (error) {
      console.error('Error loading restaurants:', error);
      Alert.alert('Error', 'No se pudieron cargar los restaurantes');
    }
  };

  const loadCategories = async () => {
    try {
      const categoriesData = await getCategoriesByRestaurant(selectedRestaurant._id);
      setCategories(categoriesData);
    } catch (error) {
      console.error('Error loading categories:', error);
      Alert.alert('Error', 'No se pudieron cargar las categorías');
      setCategories([]);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleRestaurantSelect = (restaurant) => {
    setSelectedRestaurant(restaurant);
  };

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
  };

  const handleTagsChange = (tags) => {
    setSelectedTags(tags);
  };

  const handleImageSelected = (imageUri) => {
    setProductImage(imageUri);
  };

  const handleNutritionalInfoChange = (info) => {
    setNutritionalInfo(info);
  };

  const validateForm = () => {
    if (!selectedRestaurant) {
      Alert.alert('Error', 'Debe seleccionar un restaurante');
      return false;
    }

    if (!selectedCategory) {
      Alert.alert('Error', 'Debe seleccionar una categoría');
      return false;
    }

    if (!formData.name.trim()) {
      Alert.alert('Error', 'El nombre del producto es obligatorio');
      return false;
    }
    
    if (formData.name.trim().length < 2) {
      Alert.alert('Error', 'El nombre debe tener al menos 2 caracteres');
      return false;
    }
    
    if (!formData.description.trim()) {
      Alert.alert('Error', 'La descripción es obligatoria');
      return false;
    }
    
    if (formData.description.trim().length < 10) {
      Alert.alert('Error', 'La descripción debe tener al menos 10 caracteres');
      return false;
    }

    if (!formData.price || parseFloat(formData.price) <= 0) {
      Alert.alert('Error', 'El precio debe ser mayor a 0');
      return false;
    }

    if (formData.preparation_time && (parseInt(formData.preparation_time) < 1 || parseInt(formData.preparation_time) > 180)) {
      Alert.alert('Error', 'El tiempo de preparación debe estar entre 1 y 180 minutos');
      return false;
    }

    if (formData.stock_quantity && parseInt(formData.stock_quantity) < 0) {
      Alert.alert('Error', 'El stock no puede ser negativo');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    try {
      setLoading(true);
      
      // Preparar datos del producto
      const productData = {
        restaurant_id: selectedRestaurant._id,
        category_id: selectedCategory._id,
        name: formData.name.trim(),
        description: formData.description.trim(),
        price: parseFloat(formData.price),
        preparation_time: parseInt(formData.preparation_time) || 15,
        stock_quantity: parseInt(formData.stock_quantity) || 0,
        is_available: formData.is_available,
        is_featured: formData.is_featured,
        tags: selectedTags.map(tag => tag._id)
      };

      // Agregar imagen si existe
      if (productImage) {
        productData.image = productImage;
      }

      // Agregar información nutricional si hay datos
      const hasNutritionalInfo = Object.values(nutritionalInfo).some(value => value !== null);
      if (hasNutritionalInfo) {
        productData.nutritional_info = nutritionalInfo;
      }
      
      await createProduct(productData, user?._id);
      
      Alert.alert(
        '¡Éxito!', 
        'El producto ha sido creado exitosamente',
        [
          { text: 'Aceptar', onPress: () => navigation.goBack() }
        ]
      );
      
    } catch (error) {
      console.error('Error creating product:', error);
      Alert.alert('Error', error.message || 'No se pudo crear el producto');
    } finally {
      setLoading(false);
    }
  };

  const styles = createStyles(theme);

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Agregar Producto</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.formContainer}>
          <View style={styles.iconContainer}>
            <Ionicons 
              name="fast-food-outline" 
              size={60} 
              color={theme.primary} 
            />
          </View>
          
          <Text style={styles.title}>Nuevo Producto</Text>
          <Text style={styles.subtitle}>
            Agrega un nuevo producto al menú del restaurante
          </Text>

          {/* Selector de restaurante */}
          <RestaurantSelector 
            restaurants={restaurants}
            selectedRestaurant={selectedRestaurant}
            onSelectRestaurant={handleRestaurantSelect}
            loading={false}
          />

          {/* Selector de categoría */}
          <CategorySelector 
            categories={categories}
            selectedCategory={selectedCategory}
            onSelectCategory={handleCategorySelect}
            restaurantId={selectedRestaurant?._id}  // ← Agregar esta línea
            loading={!selectedRestaurant}
          />
          
          {/* Formulario básico del producto */}
          <ProductForm 
            formData={formData}
            onInputChange={handleInputChange}
            disabled={loading}
          />

          {/* Upload de imagen */}
          <ProductImageUpload 
            productImage={productImage}
            onImageSelected={handleImageSelected}
          />

          {/* Información nutricional */}
          <NutritionalInfoForm 
            nutritionalInfo={nutritionalInfo}
            onNutritionalInfoChange={handleNutritionalInfoChange}
            disabled={loading}
          />

          {/* Selector de tags */}
          <TagSelector 
            restaurantId={selectedRestaurant?._id}
            selectedTags={selectedTags}
            onTagsChange={handleTagsChange}
            maxTags={10}
            disabled={loading}
          />
          
          {/* Botón Submit */}
          <TouchableOpacity 
            style={[styles.submitButton, loading && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <>
                <Ionicons 
                  name="add" 
                  size={20} 
                  color="#ffffff" 
                />
                <Text style={styles.submitButtonText}>
                  Crear Producto
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
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
  scrollContainer: {
    flex: 1,
  },
  formContainer: {
    padding: 20,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.text,
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 14,
    color: theme.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 30,
  },
  submitButton: {
    backgroundColor: theme.primary,
    paddingVertical: 15,
    borderRadius: 25,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 30,
    marginBottom: 40,
  },
  submitButtonDisabled: {
    backgroundColor: '#cccccc',
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default AddProductScreen;