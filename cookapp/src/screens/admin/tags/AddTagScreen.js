import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, 
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../context/ThemeContext';
import { createTag, updateTag } from '../../../services/tagService';
import { getAllRestaurants, getRestaurantsByOwner } from '../../../services/restaurantService';

// Importar componentes
import RestaurantSelector from '../shared_components/RestaurantSelector';
import TagForm from './components/TagForm';

const AddTagScreen = ({ navigation, route }) => {
  const { theme } = useTheme();
  const { user, tag, isEdit = false } = route.params || {};

  // Estados principales
  const [loading, setLoading] = useState(false);
  const [restaurants, setRestaurants] = useState([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);

  // Estados del formulario
  const [tagName, setTagName] = useState(tag?.name || '');

  // Cargar restaurantes al montar el componente
  useEffect(() => {
    loadRestaurants();
  }, []);

  // Inicializar datos si es edición
  useEffect(() => {
    if (isEdit && tag && tag.restaurant_id) {
      setSelectedRestaurant(tag.restaurant_id);
    }
  }, [isEdit, tag]);

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
    if (!tagName.trim()) {
      Alert.alert('Error', 'El nombre del tag es obligatorio');
      return false;
    }
    
    if (tagName.trim().length < 2) {
      Alert.alert('Error', 'El nombre debe tener al menos 2 caracteres');
      return false;
    }
    
    if (tagName.trim().length > 30) {
      Alert.alert('Error', 'El nombre no puede exceder 30 caracteres');
      return false;
    }
    
    if (!selectedRestaurant) {
      Alert.alert('Error', 'Debe seleccionar un restaurante');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    try {
      setLoading(true);
      
      const tagData = {
        restaurant_id: selectedRestaurant._id,
        name: tagName.trim()
      };
      
      if (isEdit) {
        await updateTag(tag._id, tagData, user?._id);
        Alert.alert(
          '¡Éxito!', 
          'El tag ha sido actualizado exitosamente',
          [{ text: 'Aceptar', onPress: () => navigation.goBack() }]
        );
      } else {
        await createTag(tagData, user?._id);
        Alert.alert(
          '¡Éxito!', 
          'El tag ha sido creado exitosamente',
          [{ text: 'Aceptar', onPress: () => navigation.goBack() }]
        );
      }
      
    } catch (error) {
      console.error('Error saving tag:', error);
      Alert.alert('Error', error.message || `No se pudo ${isEdit ? 'actualizar' : 'crear'} el tag`);
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
          {isEdit ? 'Editar Tag' : 'Agregar Tag'}
        </Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.formContainer}>
          <View style={styles.iconContainer}>
            <Ionicons 
              name="pricetag-outline" 
              size={60} 
              color={theme.primary} 
            />
          </View>
          
          <Text style={styles.title}>
            {isEdit ? 'Editar Tag de Producto' : 'Nuevo Tag de Producto'}
          </Text>
          
          <Text style={styles.subtitle}>
            Los tags ayudan a los clientes a identificar características especiales como "Saludable", "Sin gluten", "Picante", etc.
          </Text>

          {/* Selector de restaurante */}
          <RestaurantSelector 
            restaurants={restaurants}
            selectedRestaurant={selectedRestaurant}
            onSelectRestaurant={setSelectedRestaurant}
            disabled={isEdit} // En modo edición, no se puede cambiar el restaurante
            loading={false}
          />
          
          {/* Formulario de tag */}
          <TagForm 
            tagName={tagName}
            setTagName={setTagName}
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
                  {isEdit ? 'Actualizar Tag' : 'Crear Tag'}
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

export default AddTagScreen;