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
import { updateTopping, deleteTopping } from '../../../services/toppingService';

// Importar componentes reutilizables
import ToppingForm from './components/ToppingForm';
import NutritionalInfoForm from '../shared_components/NutritionalInfoForm';
import TagSelector from '../shared_components/TagSelector';
import ProductSelector from './components/ProductSelector';

const UpdateToppingScreen = ({ navigation, route }) => {
  const { theme } = useTheme();
  const { user, topping } = route.params || {};

  // Estados principales
  const [loading, setLoading] = useState(false);
  const [selectedTags, setSelectedTags] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);

  // Estados del formulario - inicializados con datos del topping
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

  // Inicializar datos del topping
  useEffect(() => {
    if (topping) {
      initializeFormData();
    }
  }, [topping]);

  const initializeFormData = () => {
    const t = topping;
    
    setFormData({
      name: t.name || '',
      description: t.description || '',
      price: t.price?.toString() || '',
      stock_quantity: t.stock_quantity?.toString() || '0',
      is_available: t.is_available !== undefined ? t.is_available : true
    });

    // Inicializar tags si existen
    if (t.tags && Array.isArray(t.tags)) {
      setSelectedTags(t.tags);
    }

    // Inicializar productos compatibles si existen
    if (t.compatible_with && Array.isArray(t.compatible_with)) {
      setSelectedProducts(t.compatible_with);
    }

    // Inicializar información nutricional
    if (t.nutritional_info) {
      setNutritionalInfo({
        calories: t.nutritional_info.calories || null,
        protein: t.nutritional_info.protein || null,
        carbs: t.nutritional_info.carbs || null,
        fat: t.nutritional_info.fat || null,
        fiber: t.nutritional_info.fiber || null
      });
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
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

  const handleDeleteTopping = () => {
    Alert.alert(
      'Eliminar Topping',
      `¿Está seguro de que desea eliminar "${topping?.name}"? Esta acción no se puede deshacer.`,
      [
        {
          text: 'No',
          style: 'cancel'
        },
        {
          text: 'Sí, Eliminar',
          style: 'destructive',
          onPress: confirmDeleteTopping
        }
      ]
    );
  };

  const confirmDeleteTopping = async () => {
    try {
      setLoading(true);
      
      await deleteTopping(topping._id, user?._id);
      
      Alert.alert(
        '¡Eliminado!', 
        'El topping ha sido eliminado exitosamente',
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
      console.error('Error deleting topping:', error);
      Alert.alert('Error', error.message || 'No se pudo eliminar el topping');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
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
    
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    try {
      setLoading(true);
      
      // Preparar datos del topping (solo campos que pueden cambiar)
      const toppingData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        price: parseFloat(formData.price),
        stock_quantity: parseInt(formData.stock_quantity) || 0,
        is_available: formData.is_available,
        tags: selectedTags.map(tag => tag._id),
        compatible_with: selectedProducts.map(product => product._id)
      };

      // Agregar información nutricional (siempre incluir para permitir eliminar datos)
      toppingData.nutritional_info = nutritionalInfo;
      
      await updateTopping(topping._id, toppingData, user?._id);
      
      Alert.alert(
        '¡Éxito!', 
        'El topping ha sido actualizado exitosamente',
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
      console.error('Error updating topping:', error);
      Alert.alert('Error', error.message || 'No se pudo actualizar el topping');
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
        <Text style={styles.headerTitle}>Editar Topping</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.formContainer}>
          
          {/* Info del restaurante (no editable) */}
          <View style={styles.restaurantInfo}>
            <Ionicons name="restaurant" size={20} color={theme.primary} />
            <Text style={[styles.restaurantName, { color: theme.text }]}>
              {topping?.restaurant_id?.name}
            </Text>
          </View>
          
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
            restaurantId={topping?.restaurant_id?._id}
            selectedTags={selectedTags}
            onTagsChange={handleTagsChange}
            maxTags={5}
            disabled={loading}
          />

          {/* Selector de productos compatibles */}
          <ProductSelector 
            restaurantId={topping?.restaurant_id?._id}
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
                  name="checkmark" 
                  size={20} 
                  color="#ffffff" 
                />
                <Text style={styles.submitButtonText}>
                  Actualizar Topping
                </Text>
              </>
            )}
          </TouchableOpacity>

          {/* Botón Eliminar - Solo para admins */}
          {user?.role === 'admin' && (
            <TouchableOpacity 
              style={[styles.deleteButton, loading && styles.deleteButtonDisabled]}
              onPress={handleDeleteTopping}
              disabled={loading}
            >
              <Ionicons name="trash-outline" size={20} color="#ffffff" />
              <Text style={styles.deleteButtonText}>Eliminar Topping</Text>
            </TouchableOpacity>
          )}
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
  },
  deleteButton: {
    backgroundColor: theme.danger,
    paddingVertical: 15,
    borderRadius: 25,
    marginTop: 15,
    marginBottom: 40,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteButtonDisabled: {
    backgroundColor: '#ffcccc',
  },
  deleteButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    marginLeft: 8,
  },
});

export default UpdateToppingScreen;