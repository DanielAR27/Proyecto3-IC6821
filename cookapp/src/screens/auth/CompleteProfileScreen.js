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
  Platform 
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { lightTheme, darkTheme } from '../../styles/colors';
import { createUser } from '../../services/authService';

const CompleteProfileScreen = ({ googleUserData, onComplete, isDarkMode = false }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    phone: '',
    street: '',
    city: '',
    province: '',
    postal_code: '',
  });

  const theme = isDarkMode ? darkTheme : lightTheme;

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateForm = () => {
    const { phone, street, city, province, postal_code } = formData;
    
    if (!phone.trim()) {
      Alert.alert('Error', 'El número de teléfono es obligatorio');
      return false;
    }
    
    if (!street.trim() || !city.trim() || !province.trim() || !postal_code.trim()) {
      Alert.alert('Error', 'Todos los campos de dirección son obligatorios');
      return false;
    }
    
    // Validar formato de teléfono básico
    if (!/^\+?506\s?\d{4}-?\d{4}$/.test(phone)) {
      Alert.alert('Error', 'Formato de teléfono inválido. Use: +506 8888-8888');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    try {
      setLoading(true);
      
      // Preparar datos completos del usuario
      const userData = {
        google_id: googleUserData.google_id,
        email: googleUserData.email,
        name: googleUserData.name,
        profile_image: googleUserData.profile_image,
        phone: formData.phone,
        address: {
          street: formData.street,
          city: formData.city,
          province: formData.province,
          postal_code: formData.postal_code,
        },
        role: 'customer'
      };
      
      // Crear usuario en la API
      const createdUser = await createUser(userData);
      
      Alert.alert('¡Éxito!', 'Tu perfil ha sido creado exitosamente', [
        { text: 'Continuar', onPress: () => onComplete(createdUser) }
      ]);
      
    } catch (error) {
      console.error('Error creating user:', error);
      Alert.alert('Error', 'No se pudo crear tu perfil. Intenta de nuevo.');
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
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.contentContainer}>
          <Text style={styles.title}>¡Casi listo!</Text>
          <Text style={styles.subtitle}>
            Completa tu perfil para empezar a pedir
          </Text>
          
          <View style={styles.formContainer}>
            <Text style={styles.label}>Número de Teléfono</Text>
            <TextInput
              style={styles.input}
              placeholder="+506 8888-8888"
              placeholderTextColor={theme.textSecondary}
              value={formData.phone}
              onChangeText={(value) => handleInputChange('phone', value)}
              keyboardType="phone-pad"
            />
            
            <Text style={styles.sectionTitle}>Dirección</Text>
            
            <Text style={styles.label}>Calle</Text>
            <TextInput
              style={styles.input}
              placeholder="Av Central, Casa 123"
              placeholderTextColor={theme.textSecondary}
              value={formData.street}
              onChangeText={(value) => handleInputChange('street', value)}
            />
            
            <Text style={styles.label}>Ciudad</Text>
            <TextInput
              style={styles.input}
              placeholder="San José"
              placeholderTextColor={theme.textSecondary}
              value={formData.city}
              onChangeText={(value) => handleInputChange('city', value)}
            />
            
            <Text style={styles.label}>Provincia</Text>
            <TextInput
              style={styles.input}
              placeholder="San José"
              placeholderTextColor={theme.textSecondary}
              value={formData.province}
              onChangeText={(value) => handleInputChange('province', value)}
            />
            
            <Text style={styles.label}>Código Postal</Text>
            <TextInput
              style={styles.input}
              placeholder="10101"
              placeholderTextColor={theme.textSecondary}
              value={formData.postal_code}
              onChangeText={(value) => handleInputChange('postal_code', value)}
              keyboardType="numeric"
            />
            
            <TouchableOpacity 
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleSubmit}
              disabled={loading}
            >
              <Text style={styles.buttonText}>
                {loading ? 'Creando perfil...' : 'Completar Perfil'}
              </Text>
            </TouchableOpacity>
          </View>
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
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  contentContainer: {
    backgroundColor: theme.cardBackground,
    padding: 30,
    borderRadius: 20,
    shadowColor: theme.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: theme.text,
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: theme.textSecondary,
    marginBottom: 30,
    textAlign: 'center',
    lineHeight: 22,
  },
  formContainer: {
    width: '100%',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.text,
    marginTop: 20,
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.text,
    marginBottom: 8,
    marginTop: 15,
  },
  input: {
    backgroundColor: theme.background,
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    color: theme.text,
  },
  button: {
    backgroundColor: theme.primary,
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 25,
    marginTop: 30,
  },
  buttonDisabled: {
    backgroundColor: '#cccccc',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default CompleteProfileScreen;