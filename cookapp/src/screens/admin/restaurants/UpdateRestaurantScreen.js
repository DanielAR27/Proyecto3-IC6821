import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, 
  ScrollView,
  Image,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../context/ThemeContext';
import { updateRestaurant, deleteRestaurant } from '../../../services/restaurantService';
import { getOwners } from '../../../services/authService';

// Importar componentes reutilizables
import OwnerSelectionModal from './components/OwnerSelectionModal';
import BannerUpload from './components/BannerUpload';
import RestaurantForm from './components/RestaurantForm';
import ScheduleForm from './components/ScheduleForm';
import RestaurantTagSelector from './components/RestaurantTagSelector';

const UpdateRestaurantScreen = ({ navigation, route }) => {
  const { theme } = useTheme();
  const { restaurant, user } = route.params || {}; 

  // Estados principales
  const [loading, setLoading] = useState(false);
  const [owners, setOwners] = useState([]);
  const [selectedOwner, setSelectedOwner] = useState(null);
  const [showOwnerModal, setShowOwnerModal] = useState(false);
  const [bannerImage, setBannerImage] = useState(null);
  const [selectedTags, setSelectedTags] = useState([]);

  // Estados del formulario - inicializados con datos del restaurante
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    phone: '',
    email: '',
    street: '',
    city: '',
    province: '',
    // Horarios
    monday: { open: '', close: '', closed: true },
    tuesday: { open: '', close: '', closed: true },
    wednesday: { open: '', close: '', closed: true },
    thursday: { open: '', close: '', closed: true },
    friday: { open: '', close: '', closed: true },
    saturday: { open: '', close: '', closed: true },
    sunday: { open: '', close: '', closed: true },
  });

  // Inicializar datos del restaurante
  useEffect(() => {
    if (restaurant) {
      initializeFormData();
    }
  }, [restaurant]);

  // Cargar owners si es admin
  useEffect(() => {
    if (user?.role === 'admin') {
      loadOwners();
    }
  }, [user]);

  const initializeFormData = () => {
    const r = restaurant;
    
    setFormData({
      name: r.name || '',
      description: r.description || '',
      phone: r.contact?.phone || '',
      email: r.contact?.email || '',
      street: r.address?.street || '',
      city: r.address?.city || '',
      province: r.address?.province || '',
      // Inicializar horarios
      monday: r.business_hours?.monday || { open: '', close: '', closed: true },
      tuesday: r.business_hours?.tuesday || { open: '', close: '', closed: true },
      wednesday: r.business_hours?.wednesday || { open: '', close: '', closed: true },
      thursday: r.business_hours?.thursday || { open: '', close: '', closed: true },
      friday: r.business_hours?.friday || { open: '', close: '', closed: true },
      saturday: r.business_hours?.saturday || { open: '', close: '', closed: true },
      sunday: r.business_hours?.sunday || { open: '', close: '', closed: true },
    });

    // Establecer owner actual
    if (r.owner_id) {
      setSelectedOwner(r.owner_id);
    }

    // Establecer banner actual
    if (r.banner) {
      setBannerImage(r.banner);
    }

    // Inicializar tags si existen
    if (r.restaurant_tags && Array.isArray(r.restaurant_tags)) {
      setSelectedTags(r.restaurant_tags);
    }
  };

  const handleDeleteRestaurant = () => {
    Alert.alert(
      'Eliminar Restaurante',
      `¿Está seguro de que desea eliminar "${restaurant?.name}"? Esta acción no se puede deshacer.`,
      [
        {
          text: 'No',
          style: 'cancel'
        },
        {
          text: 'Sí, Eliminar',
          style: 'destructive',
          onPress: confirmDeleteRestaurant
        }
      ]
    );
  };

  const confirmDeleteRestaurant = async () => {
    try {
      setLoading(true);
      
      await deleteRestaurant(restaurant._id, user?._id);
      
      Alert.alert(
        '¡Eliminado!', 
        'El restaurante ha sido eliminado exitosamente',
        [
          { 
            text: 'Aceptar', 
            onPress: () => {
              // Regresar a la lista de restaurantes
              navigation.goBack();
            }
          }
        ]
      );
      
    } catch (error) {
      console.error('Error deleting restaurant:', error);
      Alert.alert('Error', error.message || 'No se pudo eliminar el restaurante');
    } finally {
      setLoading(false);
    }
  };

  const loadOwners = async () => {
    try {
      const ownersData = await getOwners(user?._id);
      setOwners(ownersData);
    } catch (error) {
      console.error('Error loading owners:', error);
      Alert.alert('Error', 'No se pudieron cargar los propietarios');
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleScheduleChange = (day, field, value) => {
    setFormData(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        [field]: value
      }
    }));
  };

  const handleToggleDay = (day) => {
    setFormData(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        closed: !prev[day].closed,
        open: !prev[day].closed ? '' : prev[day].open,
        close: !prev[day].closed ? '' : prev[day].close,
      }
    }));
  };

  const handleSelectOwner = (owner) => {
    setSelectedOwner(owner);
  };

  const handleImageSelected = (imageUri) => {
    setBannerImage(imageUri);
  };

  const handleTagsChange = (tags) => {
    setSelectedTags(tags);
  };

  const validateForm = () => {
    const { name, description, phone, email, street, city, province } = formData;
    
    if (!name.trim()) {
      Alert.alert('Error', 'El nombre del restaurante es obligatorio');
      return false;
    }
    
    if (!description.trim()) {
      Alert.alert('Error', 'La descripción es obligatoria');
      return false;
    }
    
    // Para owners, el owner no puede cambiar
    if (user?.role === 'owner') {
      // No validar selectedOwner para owners
    } else if (user?.role === 'admin' && !selectedOwner) {
      Alert.alert('Error', 'Debe seleccionar un propietario');
      return false;
    }
    
    if (!phone.trim() || !email.trim()) {
      Alert.alert('Error', 'Teléfono y email son obligatorios');
      return false;
    }
    
    if (!street.trim() || !city.trim() || !province.trim()) {
      Alert.alert('Error', 'La dirección completa es obligatoria');
      return false;
    }
    
    // Validar email básico
    if (!/\S+@\S+\.\S+/.test(email)) {
      Alert.alert('Error', 'Formato de email inválido');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    try {
      setLoading(true);
      
      // Preparar horarios
      const business_hours = {};
      Object.keys(formData).forEach(key => {
        if (['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].includes(key)) {
          business_hours[key] = formData[key];
        }
      });
      
      // Preparar datos del restaurante
      const restaurantData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        contact: {
          phone: formData.phone.trim(),
          email: formData.email.trim(),
        },
        address: {
          street: formData.street.trim(),
          city: formData.city.trim(),
          province: formData.province.trim(),
        },
        business_hours,
        // Agregar restaurant_tags (siempre incluir, aunque esté vacío)
        restaurant_tags: selectedTags.map(tag => tag._id)
      };

      // Solo incluir owner_id si es admin y ha seleccionado uno diferente
      if (user?.role === 'admin' && selectedOwner && selectedOwner._id !== restaurant.owner_id?._id) {
        restaurantData.owner_id = selectedOwner._id;
      }

      // Solo incluir banner si ha cambiado
      if (bannerImage && bannerImage !== restaurant.banner) {
        restaurantData.banner = bannerImage;
      }
      
      await updateRestaurant(restaurant._id, restaurantData, user?._id);
      
      Alert.alert(
        '¡Éxito!', 
        'El restaurante ha sido actualizado exitosamente',
        [
          { 
            text: 'Aceptar', 
            onPress: () => {
              // ✅ Solo regresar - el ManageRestaurantsScreen se refrescará automáticamente
              navigation.goBack();
            }
          }
        ]
      );
      
    } catch (error) {
      console.error('Error updating restaurant:', error);
      Alert.alert('Error', error.message || 'No se pudo actualizar el restaurante');
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
        <Text style={styles.headerTitle}>Editar Restaurante</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.formContainer}>
          
          {/* Selección de Propietario - Solo para admins */}
          {user?.role === 'admin' && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Propietario *</Text>
              <TouchableOpacity
                style={styles.ownerSelector}
                onPress={() => setShowOwnerModal(true)}
              >
                {selectedOwner ? (
                  <View style={styles.selectedOwnerContainer}>
                    <Image 
                      source={{ uri: selectedOwner.profile_image }} 
                      style={styles.selectedOwnerAvatar}
                    />
                    <View style={styles.selectedOwnerInfo}>
                      <Text style={[styles.selectedOwnerName, { color: theme.text }]}>
                        {selectedOwner.name}
                      </Text>
                      <Text style={[styles.selectedOwnerEmail, { color: theme.textSecondary }]}>
                        {selectedOwner.email}
                      </Text>
                    </View>
                  </View>
                ) : (
                  <Text style={[styles.ownerSelectorText, { color: theme.textSecondary }]}>
                    Seleccionar propietario
                  </Text>
                )}
                <Ionicons name="chevron-down" size={20} color={theme.textSecondary} />
              </TouchableOpacity>
            </View>
          )}

          {/* Info del owner actual para owners */}
          {user?.role === 'owner' && restaurant?.owner_id && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Propietario</Text>
              <View style={styles.ownerDisplay}>
                <Image 
                  source={{ uri: restaurant.owner_id.profile_image }} 
                  style={styles.selectedOwnerAvatar}
                />
                <View style={styles.selectedOwnerInfo}>
                  <Text style={[styles.selectedOwnerName, { color: theme.text }]}>
                    {restaurant.owner_id.name}
                  </Text>
                  <Text style={[styles.selectedOwnerEmail, { color: theme.textSecondary }]}>
                    {restaurant.owner_id.email}
                  </Text>
                </View>
              </View>
            </View>
          )}

          {/* Componente: Formulario básico */}
          <RestaurantForm 
            formData={formData}
            onInputChange={handleInputChange}
          />

          {/* Componente: Banner Upload */}
          <BannerUpload 
            bannerImage={bannerImage}
            onImageSelected={handleImageSelected}
          />

          {/* Componente: Horarios */}
          <ScheduleForm 
            formData={formData}
            onScheduleChange={handleScheduleChange}
            onToggleDay={handleToggleDay}
          />

          {/* Componente: Tag Selector */}
          <RestaurantTagSelector 
            selectedTags={selectedTags}
            onTagsChange={handleTagsChange}
            maxTags={5}
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
              <Text style={styles.submitButtonText}>Actualizar Restaurante</Text>
            )}
          </TouchableOpacity>

          {/* Botón Eliminar - Solo para admins */}
          {user?.role === 'admin' && (
            <TouchableOpacity 
              style={[styles.deleteButton, loading && styles.deleteButtonDisabled]}
              onPress={handleDeleteRestaurant}
              disabled={loading}
            >
              <Ionicons name="trash-outline" size={20} color="#ffffff" />
              <Text style={styles.deleteButtonText}>Eliminar Restaurante</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>

      {/* Componente: Modal de selección de propietarios - Solo para admins */}
      {user?.role === 'admin' && (
        <OwnerSelectionModal 
          visible={showOwnerModal}
          owners={owners}
          selectedOwner={selectedOwner}
          onSelectOwner={handleSelectOwner}
          onClose={() => setShowOwnerModal(false)}
        />
      )}
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
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.text,
    marginBottom: 15,
  },
  // Owner Selection
  ownerSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.cardBackground,
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 12,
  },
  ownerDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.cardBackground,
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 12,
  },
  ownerSelectorText: {
    fontSize: 16,
  },
  selectedOwnerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  selectedOwnerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  selectedOwnerInfo: {
    flex: 1,
  },
  selectedOwnerName: {
    fontSize: 16,
    fontWeight: '500',
  },
  selectedOwnerEmail: {
    fontSize: 14,
  },
  // Submit Button
  submitButton: {
    backgroundColor: theme.primary,
    paddingVertical: 15,
    borderRadius: 25,
    marginTop: 20,
  },
  submitButtonDisabled: {
    backgroundColor: '#cccccc',
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  // Delete Button
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

export default UpdateRestaurantScreen;