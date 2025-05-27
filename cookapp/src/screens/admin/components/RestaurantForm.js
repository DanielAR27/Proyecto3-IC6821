import React from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TextInput
} from 'react-native';
import { useTheme } from '../../../context/ThemeContext';

const RestaurantForm = ({ formData, onInputChange }) => {
  const { theme } = useTheme();

  const styles = createStyles(theme);

  return (
    <View style={styles.container}>
      {/* Información Básica */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Información Básica</Text>
        
        <Text style={styles.label}>Nombre del Restaurante *</Text>
        <TextInput
          style={styles.input}
          placeholder="Ej: Burger Palace"
          placeholderTextColor={theme.textSecondary}
          value={formData.name}
          onChangeText={(value) => onInputChange('name', value)}
        />
        
        <Text style={styles.label}>Descripción *</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Describe tu restaurante..."
          placeholderTextColor={theme.textSecondary}
          value={formData.description}
          onChangeText={(value) => onInputChange('description', value)}
          multiline
          numberOfLines={3}
        />
      </View>

      {/* Contacto */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Información de Contacto</Text>
        
        <Text style={styles.label}>Teléfono *</Text>
        <TextInput
          style={styles.input}
          placeholder="+506 2222-2222"
          placeholderTextColor={theme.textSecondary}
          value={formData.phone}
          onChangeText={(value) => onInputChange('phone', value)}
          keyboardType="phone-pad"
        />
        
        <Text style={styles.label}>Email *</Text>
        <TextInput
          style={styles.input}
          placeholder="info@restaurante.com"
          placeholderTextColor={theme.textSecondary}
          value={formData.email}
          onChangeText={(value) => onInputChange('email', value)}
          keyboardType="email-address"
          autoCapitalize="none"
        />
      </View>

      {/* Dirección */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Dirección</Text>
        
        <Text style={styles.label}>Calle *</Text>
        <TextInput
          style={styles.input}
          placeholder="Calle 5, Av 2"
          placeholderTextColor={theme.textSecondary}
          value={formData.street}
          onChangeText={(value) => onInputChange('street', value)}
        />
        
        <Text style={styles.label}>Ciudad *</Text>
        <TextInput
          style={styles.input}
          placeholder="San José"
          placeholderTextColor={theme.textSecondary}
          value={formData.city}
          onChangeText={(value) => onInputChange('city', value)}
        />
        
        <Text style={styles.label}>Provincia *</Text>
        <TextInput
          style={styles.input}
          placeholder="San José"
          placeholderTextColor={theme.textSecondary}
          value={formData.province}
          onChangeText={(value) => onInputChange('province', value)}
        />
      </View>
    </View>
  );
};

const createStyles = (theme) => StyleSheet.create({
  container: {
    flex: 1,
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
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.text,
    marginBottom: 8,
    marginTop: 15,
  },
  input: {
    backgroundColor: theme.cardBackground,
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    color: theme.text,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
});

export default RestaurantForm;