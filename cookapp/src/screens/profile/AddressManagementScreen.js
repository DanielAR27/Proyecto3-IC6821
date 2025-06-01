import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, 
  Alert,
  ScrollView,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../../context/ThemeContext';

const AddressManagementScreen = ({ navigation, route }) => {
  const { user } = route.params;
  const { theme } = useTheme();
  const [addresses, setAddresses] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    street: '',
    city: '',
    province: '',
    postal_code: '',
    reference: '',
    is_default: false
  });

  const styles = createStyles(theme);

  useEffect(() => {
    loadAddresses();
  }, []);

  const loadAddresses = async () => {
    try {
      // Cargar direcciones del AsyncStorage
      const savedAddresses = await AsyncStorage.getItem(`@addresses_${user._id}`);
      if (savedAddresses) {
        setAddresses(JSON.parse(savedAddresses));
      } else {
        // Si no hay direcciones guardadas, usar la dirección principal del usuario
        if (user.address && user.address.street) {
          const defaultAddress = {
            id: '1',
            name: 'Casa',
            ...user.address,
            is_default: true
          };
          setAddresses([defaultAddress]);
          await saveAddresses([defaultAddress]);
        }
      }
    } catch (error) {
      console.error('Error loading addresses:', error);
    }
  };

  const saveAddresses = async (addressList) => {
    try {
      await AsyncStorage.setItem(`@addresses_${user._id}`, JSON.stringify(addressList));
    } catch (error) {
      console.error('Error saving addresses:', error);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const openModal = (address = null) => {
    if (address) {
      setEditingAddress(address);
      setFormData(address);
    } else {
      setEditingAddress(null);
      setFormData({
        name: '',
        street: '',
        city: '',
        province: '',
        postal_code: '',
        reference: '',
        is_default: addresses.length === 0
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingAddress(null);
    setFormData({
      name: '',
      street: '',
      city: '',
      province: '',
      postal_code: '',
      reference: '',
      is_default: false
    });
  };

  const validateForm = () => {
    const { name, street, city, province, postal_code } = formData;
    
    if (!name.trim() || !street.trim() || !city.trim() || !province.trim() || !postal_code.trim()) {
      Alert.alert('Error', 'Todos los campos obligatorios deben ser completados');
      return false;
    }
    
    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    
    try {
      setLoading(true);
      let updatedAddresses;
      
      if (editingAddress) {
        // Editar dirección existente
        updatedAddresses = addresses.map(addr => 
          addr.id === editingAddress.id ? { ...formData, id: addr.id } : addr
        );
      } else {
        // Crear nueva dirección
        const newAddress = {
          ...formData,
          id: Date.now().toString()
        };
        updatedAddresses = [...addresses, newAddress];
      }
      
      // Si esta dirección se marca como default, desmarcar las demás
      if (formData.is_default) {
        updatedAddresses = updatedAddresses.map(addr => ({
          ...addr,
          is_default: addr.id === (editingAddress?.id || updatedAddresses[updatedAddresses.length - 1].id)
        }));
      }
      
      // Asegurar que siempre haya una dirección por defecto
      const hasDefault = updatedAddresses.some(addr => addr.is_default);
      if (!hasDefault && updatedAddresses.length > 0) {
        updatedAddresses[0].is_default = true;
      }
      
      setAddresses(updatedAddresses);
      await saveAddresses(updatedAddresses);
      closeModal();
      
      Alert.alert('¡Éxito!', editingAddress ? 'Dirección actualizada' : 'Dirección agregada');
    } catch (error) {
      console.error('Error saving address:', error);
      Alert.alert('Error', 'No se pudo guardar la dirección');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (addressId) => {
    const addressToDelete = addresses.find(addr => addr.id === addressId);
    
    if (addressToDelete.is_default && addresses.length > 1) {
      Alert.alert('Error', 'No puedes eliminar la dirección por defecto. Marca otra como principal primero.');
      return;
    }
    
    Alert.alert(
      'Eliminar Dirección',
      '¿Estás seguro de que quieres eliminar esta dirección?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Eliminar', 
          style: 'destructive',
          onPress: async () => {
            const updatedAddresses = addresses.filter(addr => addr.id !== addressId);
            
            // Si quedan direcciones y ninguna es default, hacer la primera default
            if (updatedAddresses.length > 0 && !updatedAddresses.some(addr => addr.is_default)) {
              updatedAddresses[0].is_default = true;
            }
            
            setAddresses(updatedAddresses);
            await saveAddresses(updatedAddresses);
          }
        }
      ]
    );
  };

  const handleSetDefault = async (addressId) => {
    const updatedAddresses = addresses.map(addr => ({
      ...addr,
      is_default: addr.id === addressId
    }));
    
    setAddresses(updatedAddresses);
    await saveAddresses(updatedAddresses);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mis Direcciones</Text>
        <TouchableOpacity onPress={() => openModal()}>
          <Ionicons name="add" size={28} color={theme.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {addresses.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="location-outline" size={64} color={theme.textSecondary} />
            <Text style={styles.emptyText}>No tienes direcciones guardadas</Text>
            <TouchableOpacity style={styles.addButton} onPress={() => openModal()}>
              <Ionicons name="add-circle" size={20} color="#fff" />
              <Text style={styles.addButtonText}>Agregar Dirección</Text>
            </TouchableOpacity>
          </View>
        ) : (
          addresses.map((address) => (
            <View key={address.id} style={styles.addressCard}>
              <View style={styles.addressHeader}>
                <View style={styles.addressTitleContainer}>
                  <Ionicons name="location" size={20} color={theme.primary} />
                  <Text style={styles.addressName}>{address.name}</Text>
                  {address.is_default && (
                    <View style={styles.defaultBadge}>
                      <Text style={styles.defaultText}>Principal</Text>
                    </View>
                  )}
                </View>
                <View style={styles.addressActions}>
                  <TouchableOpacity 
                    onPress={() => openModal(address)}
                    style={styles.actionButton}
                  >
                    <Ionicons name="pencil" size={18} color={theme.primary} />
                  </TouchableOpacity>
                  <TouchableOpacity 
                    onPress={() => handleDelete(address.id)}
                    style={styles.actionButton}
                  >
                    <Ionicons name="trash" size={18} color={theme.danger} />
                  </TouchableOpacity>
                </View>
              </View>
              
              <Text style={styles.addressText}>{address.street}</Text>
              <Text style={styles.addressText}>
                {address.city}, {address.province} {address.postal_code}
              </Text>
              {address.reference && (
                <Text style={styles.referenceText}>Referencia: {address.reference}</Text>
              )}
              
              {!address.is_default && (
                <TouchableOpacity 
                  style={styles.setDefaultButton}
                  onPress={() => handleSetDefault(address.id)}
                >
                  <Text style={styles.setDefaultText}>Establecer como principal</Text>
                </TouchableOpacity>
              )}
            </View>
          ))
        )}
      </ScrollView>

      {/* Modal para agregar/editar dirección */}
      <Modal
        visible={showModal}
        animationType="slide"
        transparent={true}
        onRequestClose={closeModal}
      >
        <KeyboardAvoidingView 
          style={styles.modalContainer}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingAddress ? 'Editar Dirección' : 'Nueva Dirección'}
              </Text>
              <TouchableOpacity onPress={closeModal}>
                <Ionicons name="close" size={24} color={theme.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Nombre de la dirección *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ej: Casa, Oficina, etc."
                  placeholderTextColor={theme.textSecondary}
                  value={formData.name}
                  onChangeText={(value) => handleInputChange('name', value)}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Calle y número *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Av Central, Casa 123"
                  placeholderTextColor={theme.textSecondary}
                  value={formData.street}
                  onChangeText={(value) => handleInputChange('street', value)}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Ciudad *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="San José"
                  placeholderTextColor={theme.textSecondary}
                  value={formData.city}
                  onChangeText={(value) => handleInputChange('city', value)}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Provincia *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="San José"
                  placeholderTextColor={theme.textSecondary}
                  value={formData.province}
                  onChangeText={(value) => handleInputChange('province', value)}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Código Postal *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="10101"
                  placeholderTextColor={theme.textSecondary}
                  value={formData.postal_code}
                  onChangeText={(value) => handleInputChange('postal_code', value)}
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Referencia (opcional)</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Portón azul, casa amarilla..."
                  placeholderTextColor={theme.textSecondary}
                  value={formData.reference}
                  onChangeText={(value) => handleInputChange('reference', value)}
                  multiline
                  numberOfLines={3}
                />
              </View>

              <TouchableOpacity 
                style={styles.defaultCheckbox}
                onPress={() => handleInputChange('is_default', !formData.is_default)}
              >
                <Ionicons 
                  name={formData.is_default ? 'checkbox' : 'square-outline'} 
                  size={24} 
                  color={theme.primary} 
                />
                <Text style={styles.checkboxText}>Establecer como dirección principal</Text>
              </TouchableOpacity>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={closeModal}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.saveButton, loading && styles.saveButtonDisabled]}
                onPress={handleSave}
                disabled={loading}
              >
                <Text style={styles.saveButtonText}>
                  {loading ? 'Guardando...' : 'Guardar'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    backgroundColor: theme.cardBackground,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.text,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 100,
  },
  emptyText: {
    fontSize: 16,
    color: theme.textSecondary,
    marginTop: 15,
    marginBottom: 30,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.primary,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
  },
  addressCard: {
    backgroundColor: theme.cardBackground,
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    shadowColor: theme.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  addressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  addressTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  addressName: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.text,
    marginLeft: 8,
  },
  defaultBadge: {
    backgroundColor: theme.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 10,
  },
  defaultText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  addressActions: {
    flexDirection: 'row',
  },
  actionButton: {
    padding: 8,
    marginLeft: 8,
  },
  addressText: {
    fontSize: 14,
    color: theme.textSecondary,
    marginBottom: 2,
  },
  referenceText: {
    fontSize: 14,
    color: theme.textSecondary,
    fontStyle: 'italic',
    marginTop: 5,
  },
  setDefaultButton: {
    marginTop: 12,
    paddingVertical: 8,
  },
  setDefaultText: {
    color: theme.primary,
    fontSize: 14,
    fontWeight: '500',
  },
  
  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: theme.cardBackground,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
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
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.text,
  },
  modalBody: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: theme.background,
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    color: theme.text,
  },
  textArea: {
    minHeight: 80,
    paddingTop: 12,
    textAlignVertical: 'top',
  },
  defaultCheckbox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  checkboxText: {
    fontSize: 14,
    color: theme.text,
    marginLeft: 10,
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: theme.border,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    marginRight: 10,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: theme.border,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: theme.text,
    fontSize: 16,
    fontWeight: '500',
  },
  saveButton: {
    flex: 1,
    backgroundColor: theme.primary,
    paddingVertical: 12,
    marginLeft: 10,
    borderRadius: 25,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    opacity: 0.7,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },  
});
export default AddressManagementScreen;