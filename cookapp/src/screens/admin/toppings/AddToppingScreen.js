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
import { createTopping } from '../../../services/toppingService';
import { getAllRestaurants, getRestaurantsByOwner } from '../../../services/restaurantService';

// Importar componentes
import RestaurantSelector from '../shared_components/RestaurantSelector';
import ToppingForm from './components/ToppingForm';
import NutritionalInfoForm from '../shared_components/NutritionalInfoForm';
import TagSelector from '../shared_components/TagSelector';
import ProductSelector from './components/ProductSelector';

const AddToppingScreen = ({ navigation, route }) => {
  const { theme } = useTheme();
  const { user } = route.params || {};

  // Estados principales
  const [loading, setLoading] = useState(false);
  const [restaurants, setRestaurants] = useState([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [selectedTags, setSelectedTags] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);

  // Estados del formulario
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock_quantity: '0',
    is_available: true
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

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleRestaurantSelect = (restaurant) => {
    setSelectedRestaurant(restaurant);
    // Reset productos y tags cuando cambia el restaurante
    setSelectedProducts([]);
    setSelectedTags([]);
  };

  const handleTagsChange = (tags) => {
    setSelectedTags(tags);
  };

  const handleProductsChange = (products) => {
    setSelectedProducts(products);
  };

  const handleNutritionalInfoChange = (info) => {
    setNutritionalInfo(info);
  };

  const validateForm = () => {
    if (!selectedRestaurant) {
      Alert.alert('Error', 'Debe seleccionar un restaurante');
      return false;
    }

    if (!formData.name.trim()) {
      Alert.alert('Error', 'El nombre del topping es obligatorio');
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
    
    if (formData.description.trim().length < 5) {
      Alert.alert('Error', 'La descripción debe tener al menos 5 caracteres');
      return false;
    }

    if (!formData.price || parseFloat(formData.price) <= 0) {
      Alert.alert('Error', 'El precio debe ser mayor a 0');
      return false;
    }

    if (formData.stock_quantity && parseInt(formData.stock_quantity) < 0) {
      Alert.alert('Error', 'El stock no puede ser negativo');
      return false;
    }

    if (selectedProducts.length === 0) {
      Alert.alert(
        'Sin productos compatibles',
        '¿Estás seguro de que quieres crear un topping sin productos compatibles? Los clientes no podrán usarlo.',
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Continuar', onPress: () => proceedWithSubmit() }
        ]
      );
      return false;
    }
    
    return true;
  };

  const proceedWithSubmit = async () => {
    await handleSubmit(true); // Proceder sin validar productos
  };

  const handleSubmit = async (skipProductValidation = false) => {
    if (!skipProductValidation && !validateForm()) return;
    
    try {
      setLoading(true);
      
      // Preparar datos del topping
      const toppingData = {
        restaurant_id: selectedRestaurant._id,
        name: formData.name.trim(),
        description: formData.description.trim(),
        price: parseFloat(formData.price),
        stock_quantity: parseInt(formData.stock_quantity) || 0,
        is_available: formData.is_available,
        tags: selectedTags.map(tag => tag._id),
        compatible_with: selectedProducts.map(product => product._id)
      };

      // Agregar información nutricional si hay datos
      const hasNutritionalInfo = Object.values(nutritionalInfo).some(value => value !== null);
      if (hasNutritionalInfo) {
        toppingData.nutritional_info = nutritionalInfo;
      }
      
      await createTopping(toppingData, user?._id);
      
      Alert.alert(
        '¡Éxito!', 
        'El topping ha sido creado exitosamente',
        [
          { text: 'Aceptar', onPress: () => navigation.goBack() }
        ]
      );
      
    } catch (error) {
      console.error('Error creating topping:', error);
      Alert.alert('Error', error.message || 'No se pudo crear el topping');
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
        <Text style={styles.headerTitle}>Agregar Topping</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.formContainer}>
          <View style={styles.iconContainer}>
            <Ionicons 
              name="add-circle-outline" 
              size={60} 
              color={theme.primary} 
            />
          </View>
          
          <Text style={styles.title}>Nuevo Topping</Text>
          <Text style={styles.subtitle}>
            Agrega un nuevo topping que los clientes puedan añadir a sus productos
          </Text>

          {/* Selector de restaurante */}
          <RestaurantSelector 
            restaurants={restaurants}
            selectedRestaurant={selectedRestaurant}
            onSelectRestaurant={handleRestaurantSelect}
            loading={false}
          />
          
          {/* Formulario básico del topping */}
          <ToppingForm 
            formData={formData}
            onInputChange={handleInputChange}
            disabled={loading}
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
            maxTags={5}
            disabled={loading}
          />

          {/* Selector de productos compatibles */}
          <ProductSelector 
            restaurantId={selectedRestaurant?._id}
            selectedProducts={selectedProducts}
            onProductsChange={handleProductsChange}
            maxProducts={20}
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
                  Crear Topping
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

export default AddToppingScreen;