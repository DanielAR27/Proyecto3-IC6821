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
import { updateProduct} from '../../../services/productService';
import { getCategoriesByRestaurant } from '../../../services/categoryService';


// Importar componentes reutilizables
import CategorySelector from './components/CategorySelector';
import ProductForm from './components/ProductForm';
import ProductImageUpload from './components/ProductImageUpload';
import NutritionalInfoForm from '../shared_components/NutritionalInfoForm';
import TagSelector from '../shared_components/TagSelector'
import BaseIngredientsForm from './components/BaseIngredientsForm'; 

const UpdateProductScreen = ({ navigation, route }) => {
  const { theme } = useTheme();
  const { user, product } = route.params || {};

  // Estados principales
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedTags, setSelectedTags] = useState([]);
  const [productImage, setProductImage] = useState(null);
  const [baseIngredients, setBaseIngredients] = useState([]);

  // Estados del formulario - inicializados con datos del producto
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

  // Inicializar datos del producto
  useEffect(() => {
    if (product) {
      initializeFormData();
    }
  }, [product]);

  // Cargar categorías
  useEffect(() => {
    if (product?.restaurant_id?._id) {
      loadCategories();
    }
  }, [product]);

  const initializeFormData = () => {
    const p = product;

    console.log('Product data:', p); 
    console.log('Base ingredients from product:', p.base_ingredients); 
    
    setFormData({
      name: p.name || '',
      description: p.description || '',
      price: p.price?.toString() || '',
      preparation_time: p.preparation_time?.toString() || '15',
      stock_quantity: p.stock_quantity?.toString() || '0',
      is_available: p.is_available !== undefined ? p.is_available : true,
      is_featured: p.is_featured || false
    });

    // Establecer categoría actual
    if (p.category_id) {
      setSelectedCategory(p.category_id);
    }

    // Establecer imagen actual
    if (p.image) {
      setProductImage(p.image);
    }

    // Inicializar tags si existen
    if (p.tags && Array.isArray(p.tags)) {
      setSelectedTags(p.tags);
    }

    // Inicializar ingredientes base si existen
    if (p.base_ingredients && Array.isArray(p.base_ingredients)) {
      console.log('Setting base ingredients:', p.base_ingredients); 
      setBaseIngredients(p.base_ingredients);
    }

    // Inicializar información nutricional
    if (p.nutritional_info) {
      setNutritionalInfo({
        calories: p.nutritional_info.calories || null,
        protein: p.nutritional_info.protein || null,
        carbs: p.nutritional_info.carbs || null,
        fat: p.nutritional_info.fat || null,
        fiber: p.nutritional_info.fiber || null
      });
    }
  };

  const loadCategories = async () => {
    try {
      const categoriesData = await getCategoriesByRestaurant(product.restaurant_id._id);
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

  const handleBaseIngredientsChange = (ingredients) => {
    setBaseIngredients(ingredients);
  };

  const validateForm = () => {
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
      
      // Preparar datos del producto (solo campos que pueden cambiar)
      const productData = {
        category_id: selectedCategory._id,
        name: formData.name.trim(),
        description: formData.description.trim(),
        price: parseFloat(formData.price),
        preparation_time: parseInt(formData.preparation_time) || 15,
        stock_quantity: parseInt(formData.stock_quantity) || 0,
        is_available: formData.is_available,
        is_featured: formData.is_featured,
        tags: selectedTags.map(tag => tag._id),
        base_ingredients: baseIngredients,
      };

      // Solo incluir imagen si ha cambiado
      if (productImage && productImage !== product.image) {
        productData.image = productImage;
      }

      // Agregar información nutricional (siempre incluir para permitir eliminar datos)
      productData.nutritional_info = nutritionalInfo;
      
      await updateProduct(product._id, productData, user?._id);
      
      Alert.alert(
        '¡Éxito!', 
        'El producto ha sido actualizado exitosamente',
        [
          { 
            text: 'Aceptar', 
            onPress: () => {
              navigation.goBack();
            }
          }
        ]
      );
      
    } catch (error) {
      console.error('Error updating product:', error);
      Alert.alert('Error', error.message || 'No se pudo actualizar el producto');
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
        <Text style={styles.headerTitle}>Editar Producto</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.formContainer}>
          
          {/* Info del restaurante (no editable) */}
          <View style={styles.restaurantInfo}>
            <Ionicons name="restaurant" size={20} color={theme.primary} />
            <Text style={[styles.restaurantName, { color: theme.text }]}>
              {product?.restaurant_id?.name}
            </Text>
          </View>

          {/* Selector de categoría */}
          <CategorySelector 
            categories={categories}
            selectedCategory={selectedCategory}
            onSelectCategory={handleCategorySelect}
            loading={false}
          />
          
          {/* Formulario básico del producto */}
          <ProductForm 
            formData={formData}
            onInputChange={handleInputChange}
            disabled={loading}
          />

          {/* ingredientes base */}
          <BaseIngredientsForm 
            baseIngredients={baseIngredients}
            onIngredientsChange={handleBaseIngredientsChange}
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
            restaurantId={product?.restaurant_id?._id}
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
                <Text style={styles.submitButtonText}>
                  Actualizar Producto
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
  restaurantInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.cardBackground,
    padding: 15,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: theme.border,
  },
  restaurantName: {
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 10,
  },
  submitButton: {
    backgroundColor: theme.primary,
    paddingVertical: 15,
    borderRadius: 25,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 30,
  },
  submitButtonDisabled: {
    backgroundColor: '#cccccc',
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  }
});

export default UpdateProductScreen;