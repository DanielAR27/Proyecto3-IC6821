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
import { useTheme } from '../../context/ThemeContext';
import { createRestaurant } from '../../services/restaurantService';
import { getOwners } from '../../services/authService';

// Importar componentes
import OwnerSelectionModal from './components/OwnerSelectionModal';
import BannerUpload from './components/BannerUpload';
import RestaurantForm from './components/RestaurantForm';
import ScheduleForm from './components/ScheduleForm';

const AddRestaurantScreen = ({ navigation, route }) => {
  const { theme } = useTheme();
  const { user } = route.params || {};

  // Estados principales
  const [loading, setLoading] = useState(false);
  const [owners, setOwners] = useState([]);
  const [selectedOwner, setSelectedOwner] = useState(null);
  const [showOwnerModal, setShowOwnerModal] = useState(false);
  const [bannerImage, setBannerImage] = useState(null);

  // Estados del formulario
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    phone: '',
    email: '',
    street: '',
    city: '',
    province: '',
    // Horarios (todos cerrados por defecto)
    monday: { open: '', close: '', closed: true },
    tuesday: { open: '', close: '', closed: true },
    wednesday: { open: '', close: '', closed: true },
    thursday: { open: '', close: '', closed: true },
    friday: { open: '', close: '', closed: true },
    saturday: { open: '', close: '', closed: true },
    sunday: { open: '', close: '', closed: true },
  });

  // Cargar owners al montar el componente
  useEffect(() => {
    loadOwners();
  }, []);

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
    
    if (!selectedOwner) {
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
        owner_id: selectedOwner._id,
        banner: bannerImage || undefined, // Si no hay imagen, usar default del modelo
        contact: {
          phone: formData.phone.trim(),
          email: formData.email.trim(),
        },
        address: {
          street: formData.street.trim(),
          city: formData.city.trim(),
          province: formData.province.trim(),
        },
        business_hours
      };
      
      await createRestaurant(restaurantData, user?._id);
      
      Alert.alert(
        '¡Éxito!', 
        'El restaurante ha sido creado exitosamente',
        [
          { text: 'Aceptar', onPress: () => navigation.goBack() }
        ]
      );
      
    } catch (error) {
      console.error('Error creating restaurant:', error);
      Alert.alert('Error', error.message || 'No se pudo crear el restaurante');
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
        <Text style={styles.headerTitle}>Agregar Restaurante</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.formContainer}>
          
          {/* Selección de Propietario */}
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

          {/* Botón Submit */}
          <TouchableOpacity 
            style={[styles.submitButton, loading && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.submitButtonText}>Crear Restaurante</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Componente: Modal de selección de propietarios */}
      <OwnerSelectionModal 
        visible={showOwnerModal}
        owners={owners}
        selectedOwner={selectedOwner}
        onSelectOwner={handleSelectOwner}
        onClose={() => setShowOwnerModal(false)}
      />
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
    marginBottom: 5,
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
    marginBottom: 40,
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
});

export default AddRestaurantScreen;