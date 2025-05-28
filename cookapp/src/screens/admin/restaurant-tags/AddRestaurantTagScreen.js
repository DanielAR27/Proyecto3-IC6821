import React, { useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, 
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../context/ThemeContext';
import { createRestaurantTag, updateRestaurantTag } from '../../../services/restaurantTagService';

const AddRestaurantTagScreen = ({ navigation, route }) => {
  const { theme } = useTheme();
  const { user, tag, isEdit = false } = route.params || {};

  // Estados
  const [loading, setLoading] = useState(false);
  const [tagName, setTagName] = useState(tag?.name || '');

  const validateForm = () => {
    if (!tagName.trim()) {
      Alert.alert('Error', 'El nombre del tag es obligatorio');
      return false;
    }
    
    if (tagName.trim().length < 2) {
      Alert.alert('Error', 'El nombre debe tener al menos 2 caracteres');
      return false;
    }
    
    if (tagName.trim().length > 50) {
      Alert.alert('Error', 'El nombre no puede exceder 50 caracteres');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    try {
      setLoading(true);
      
      const tagData = {
        name: tagName.trim()
      };
      
      if (isEdit) {
        await updateRestaurantTag(tag._id, tagData, user?._id);
        Alert.alert(
          '¡Éxito!', 
          'El tag ha sido actualizado exitosamente',
          [{ text: 'Aceptar', onPress: () => navigation.goBack() }]
        );
      } else {
        await createRestaurantTag(tagData, user?._id);
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

      {/* Contenido */}
      <View style={styles.content}>
        <View style={styles.formContainer}>
          <View style={styles.iconContainer}>
            <Ionicons 
              name="pricetag-outline" 
              size={60} 
              color={theme.primary} 
            />
          </View>
          
          <Text style={styles.title}>
            {isEdit ? 'Editar Tag de Restaurante' : 'Nuevo Tag de Restaurante'}
          </Text>
          
          <Text style={styles.subtitle}>
            Los tags ayudan a categorizar los restaurantes (ej: "Comida Italiana", "Vegano", "Comida Rápida")
          </Text>
          
          <Text style={styles.label}>Nombre del Tag *</Text>
          <TextInput
            style={styles.input}
            placeholder="Ej: Comida Italiana"
            placeholderTextColor={theme.textSecondary}
            value={tagName}
            onChangeText={setTagName}
            maxLength={50}
            autoFocus={!isEdit}
          />
          
          <Text style={[styles.characterCount, { color: theme.textSecondary }]}>
            {tagName.length}/50 caracteres
          </Text>
          
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
      </View>
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
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  formContainer: {
    backgroundColor: theme.cardBackground,
    padding: 30,
    borderRadius: 20,
    shadowColor: theme.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
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
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.text,
    marginBottom: 10,
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
    marginBottom: 5,
  },
  characterCount: {
    fontSize: 12,
    textAlign: 'right',
    marginBottom: 30,
  },
  submitButton: {
    backgroundColor: theme.primary,
    paddingVertical: 15,
    borderRadius: 25,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
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

export default AddRestaurantTagScreen;