import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, 
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../context/ThemeContext';
import { createCategory, updateCategory } from '../../../services/categoryService';
import { getAllRestaurants, getRestaurantsByOwner } from '../../../services/restaurantService';

// Importar componentes
import RestaurantSelector from '../shared_components/RestaurantSelector';
import CategoryForm from './components/CategoryForm';

const AddCategoryScreen = ({ navigation, route }) => {
  const { theme } = useTheme();
  const { user, category, isEdit = false } = route.params || {};

  // Estados principales
  const [loading, setLoading] = useState(false);
  const [restaurants, setRestaurants] = useState([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);

  // Estados del formulario
  const [categoryName, setCategoryName] = useState(category?.name || '');
  const [categoryDescription, setCategoryDescription] = useState(category?.description || '');
  const [categoryOrder, setCategoryOrder] = useState(category?.order?.toString() || '');

  // Cargar restaurantes al montar el componente
  useEffect(() => {
    loadRestaurants();
  }, []);

  // Inicializar datos si es edición
   useEffect(() => {
    if (isEdit && category && category.restaurant_id) {
        setSelectedRestaurant(category.restaurant_id);
    }
    }, [isEdit, category]);

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
      if (user?.role === 'owner' && restaurantsData.length === 1 && !isEdit) {
        setSelectedRestaurant(restaurantsData[0]);
      }
    } catch (error) {
      console.error('Error loading restaurants:', error);
      Alert.alert('Error', 'No se pudieron cargar los restaurantes');
    }
  };

  const validateForm = () => {
    if (!categoryName.trim()) {
      Alert.alert('Error', 'El nombre de la categoría es obligatorio');
      return false;
    }
    
    if (categoryName.trim().length < 2) {
      Alert.alert('Error', 'El nombre debe tener al menos 2 caracteres');
      return false;
    }
    
    if (categoryName.trim().length > 50) {
      Alert.alert('Error', 'El nombre no puede exceder 50 caracteres');
      return false;
    }

    if (categoryDescription.length > 200) {
      Alert.alert('Error', 'La descripción no puede exceder 200 caracteres');
      return false;
    }
    
    if (!selectedRestaurant) {
      Alert.alert('Error', 'Debe seleccionar un restaurante');
      return false;
    }

    // Validar orden si se especifica
    if (categoryOrder && (isNaN(categoryOrder) || parseInt(categoryOrder) < 0)) {
      Alert.alert('Error', 'El orden debe ser un número mayor o igual a 0');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    try {
      setLoading(true);
      
      const categoryData = {
        restaurant_id: selectedRestaurant._id,
        name: categoryName.trim(),
        description: categoryDescription.trim(),
        ...(categoryOrder && { order: parseInt(categoryOrder) })
      };
      
      if (isEdit) {
        await updateCategory(category._id, categoryData, user?._id);
        Alert.alert(
          '¡Éxito!', 
          'La categoría ha sido actualizada exitosamente',
          [{ text: 'Aceptar', onPress: () => navigation.goBack() }]
        );
      } else {
        await createCategory(categoryData, user?._id);
        Alert.alert(
          '¡Éxito!', 
          'La categoría ha sido creada exitosamente',
          [{ text: 'Aceptar', onPress: () => navigation.goBack() }]
        );
      }
      
    } catch (error) {
      console.error('Error saving category:', error);
      Alert.alert('Error', error.message || `No se pudo ${isEdit ? 'actualizar' : 'crear'} la categoría`);
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
        <Text style={styles.headerTitle}>
          {isEdit ? 'Editar Categoría' : 'Agregar Categoría'}
        </Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.formContainer}>
          <View style={styles.iconContainer}>
            <Ionicons 
              name="albums-outline" 
              size={60} 
              color={theme.primary} 
            />
          </View>
          
          <Text style={styles.title}>
            {isEdit ? 'Editar Categoría' : 'Nueva Categoría'}
          </Text>
          
          <Text style={styles.subtitle}>
            Las categorías ayudan a organizar los productos dentro de cada restaurante
          </Text>

          {/* Selector de restaurante */}
          <RestaurantSelector 
            restaurants={restaurants}
            selectedRestaurant={selectedRestaurant}
            onSelectRestaurant={setSelectedRestaurant}
            disabled={isEdit} // En modo edición, no se puede cambiar el restaurante
            loading={false}
          />
          
          {/* Formulario de categoría */}
          <CategoryForm 
            categoryName={categoryName}
            setCategoryName={setCategoryName}
            categoryDescription={categoryDescription}
            setCategoryDescription={setCategoryDescription}
            categoryOrder={categoryOrder}
            setCategoryOrder={setCategoryOrder}
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
                  name={isEdit ? "checkmark" : "add"} 
                  size={20} 
                  color="#ffffff" 
                />
                <Text style={styles.submitButtonText}>
                  {isEdit ? 'Actualizar Categoría' : 'Crear Categoría'}
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

export default AddCategoryScreen;