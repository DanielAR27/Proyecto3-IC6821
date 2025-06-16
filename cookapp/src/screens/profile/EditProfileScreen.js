import React, { useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TextInput, 
  TouchableOpacity, 
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Image,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { useTheme } from '../../context/ThemeContext';
import { updateProfile } from '../../services/userService';

const EditProfileScreen = ({ navigation, route }) => {
    const user = route?.params?.user;

  if (!user) {
    Alert.alert('Error', 'No se recibió información del usuario');
    navigation.goBack();
    return null;
  }
  const { theme } = useTheme();
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    profile_image: user?.profile_image || ''
  });

  const styles = createStyles(theme);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const pickImage = async () => {
    try {
      // Solicitar permisos
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permisos necesarios', 'Necesitamos acceso a tu galería para cambiar la foto de perfil');
        return;
      }

      // Seleccionar imagen
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled) {
        setUploadingImage(true);
        
        // Redimensionar imagen para optimizar
        const manipResult = await ImageManipulator.manipulateAsync(
          result.assets[0].uri,
          [{ resize: { width: 400, height: 400 } }],
          { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
        );

        // Aquí normalmente subirías la imagen a un servidor
        // Por ahora solo actualizamos el estado local
        handleInputChange('profile_image', manipResult.uri);
        setUploadingImage(false);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      setUploadingImage(false);
      Alert.alert('Error', 'No se pudo seleccionar la imagen');
    }
  };

  const validateForm = () => {
    const { name, phone } = formData;
    
    if (!name.trim()) {
      Alert.alert('Error', 'El nombre es obligatorio');
      return false;
    }
    
    if (phone && !/^\+?506\s?\d{4}-?\d{4}$/.test(phone)) {
      Alert.alert('Error', 'Formato de teléfono inválido. Use: +506 8888-8888');
      return false;
    }
    
    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    
    try {
      setLoading(true);
      
      // Preparar datos actualizados
      const updateData = {
        _id: user._id,
        user_id: user._id, // 👈 necesario para que el middleware lo autorice
        name: formData.name.trim(),
        phone: formData.phone || null,
        profile_image: formData.profile_image
        };

      // Actualizar en el backend
      const updatedUser = await updateProfile(updateData);
      
      Alert.alert('¡Éxito!', 'Tu perfil ha sido actualizado', [
        { 
          text: 'OK', 
          onPress: () => {
            // Actualizar el usuario en la pantalla anterior
            navigation.goBack();
            // Aquí deberías actualizar el contexto global o AsyncStorage
          }
        }
      ]);
      
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'No se pudo actualizar el perfil. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Editar Perfil</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Foto de perfil */}
        <View style={styles.photoSection}>
          <View style={styles.photoContainer}>
            <Image 
              source={{ uri: formData.profile_image }} 
              style={styles.profilePhoto} 
            />
            {uploadingImage && (
              <View style={styles.uploadingOverlay}>
                <ActivityIndicator size="large" color="#fff" />
              </View>
            )}
          </View>
          <TouchableOpacity 
            style={styles.changePhotoButton} 
            onPress={pickImage}
            disabled={uploadingImage}
          >
            <Ionicons name="camera" size={20} color={theme.primary} />
            <Text style={styles.changePhotoText}>Cambiar foto</Text>
          </TouchableOpacity>
        </View>

        {/* Formulario */}
        <View style={styles.formContainer}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nombre</Text>
            <TextInput
              style={styles.input}
              placeholder="Tu nombre completo"
              placeholderTextColor={theme.textSecondary}
              value={formData.name}
              onChangeText={(value) => handleInputChange('name', value)}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <View style={styles.disabledInput}>
              <Text style={styles.disabledText}>{user?.email}</Text>
              <Ionicons name="lock-closed" size={18} color={theme.textSecondary} />
            </View>
            <Text style={styles.helperText}>El email no se puede cambiar</Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Teléfono</Text>
            <TextInput
              style={styles.input}
              placeholder="+506 8888-8888"
              placeholderTextColor={theme.textSecondary}
              value={formData.phone}
              onChangeText={(value) => handleInputChange('phone', value)}
              keyboardType="phone-pad"
            />
          </View>
        </View>

        {/* Botón guardar */}
        <TouchableOpacity 
          style={[styles.saveButton, loading && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.saveButtonText}>Guardar Cambios</Text>
          )}
        </TouchableOpacity>
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
  scrollContainer: {
    flexGrow: 1,
    padding: 20,
  },
  photoSection: {
    alignItems: 'center',
    marginBottom: 30,
  },
  photoContainer: {
    position: 'relative',
    marginBottom: 15,
  },
  profilePhoto: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: theme.primary,
  },
  uploadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  changePhotoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: theme.background,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: theme.primary,
  },
  changePhotoText: {
    color: theme.primary,
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '500',
  },
  formContainer: {
    backgroundColor: theme.cardBackground,
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: theme.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
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
  disabledInput: {
    backgroundColor: theme.background,
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    opacity: 0.7,
  },
  disabledText: {
    fontSize: 16,
    color: theme.textSecondary,
  },
  helperText: {
    fontSize: 12,
    color: theme.textSecondary,
    marginTop: 5,
  },
  saveButton: {
    backgroundColor: theme.primary,
    borderRadius: 25,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 30,
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

export default EditProfileScreen;