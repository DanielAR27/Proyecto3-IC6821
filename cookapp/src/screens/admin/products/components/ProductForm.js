import React from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TextInput,
  Switch
} from 'react-native';
import { useTheme } from '../../../../context/ThemeContext';

const ProductForm = ({ 
  formData, 
  onInputChange,
  disabled = false 
}) => {
  const { theme } = useTheme();

  const handleInputChange = (field, value) => {
    onInputChange(field, value);
  };

  const handlePriceChange = (value) => {
    // Solo permitir números y punto decimal
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      onInputChange('price', value);
    }
  };

  const handlePreparationTimeChange = (value) => {
    // Solo permitir números enteros
    if (value === '' || /^\d+$/.test(value)) {
      onInputChange('preparation_time', value);
    }
  };

  const handleStockChange = (value) => {
    // Solo permitir números enteros
    if (value === '' || /^\d+$/.test(value)) {
      onInputChange('stock_quantity', value);
    }
  };

  const styles = createStyles(theme);

  return (
    <View style={styles.container}>
      {/* Información Básica */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Información Básica</Text>
        
        <Text style={styles.label}>Nombre del Producto *</Text>
        <TextInput
          style={[styles.input, disabled && styles.inputDisabled]}
          placeholder="Ej: Hamburguesa de la Casa"
          placeholderTextColor={theme.textSecondary}
          value={formData.name}
          onChangeText={(value) => handleInputChange('name', value)}
          maxLength={100}
          editable={!disabled}
        />
        
        <Text style={[styles.characterCount, { color: theme.textSecondary }]}>
          {formData.name.length}/100 caracteres
        </Text>
        
        <Text style={styles.label}>Descripción *</Text>
        <TextInput
          style={[styles.input, styles.textArea, disabled && styles.inputDisabled]}
          placeholder="Describe el producto, ingredientes especiales, etc."
          placeholderTextColor={theme.textSecondary}
          value={formData.description}
          onChangeText={(value) => handleInputChange('description', value)}
          maxLength={500}
          multiline
          numberOfLines={4}
          editable={!disabled}
        />
        
        <Text style={[styles.characterCount, { color: theme.textSecondary }]}>
          {formData.description.length}/500 caracteres
        </Text>
      </View>

      {/* Precio y Tiempo */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Precio y Tiempo</Text>
        
        <View style={styles.row}>
          <View style={styles.halfWidth}>
            <Text style={styles.label}>Precio (₡) *</Text>
            <TextInput
              style={[styles.input, disabled && styles.inputDisabled]}
              placeholder="5200"
              placeholderTextColor={theme.textSecondary}
              value={formData.price}
              onChangeText={handlePriceChange}
              keyboardType="numeric"
              editable={!disabled}
            />
          </View>
          
          <View style={styles.halfWidth}>
            <Text style={styles.label}>Tiempo prep. (min)</Text>
            <TextInput
              style={[styles.input, disabled && styles.inputDisabled]}
              placeholder="15"
              placeholderTextColor={theme.textSecondary}
              value={formData.preparation_time}
              onChangeText={handlePreparationTimeChange}
              keyboardType="numeric"
              editable={!disabled}
            />
          </View>
        </View>
      </View>

      {/* Stock y Disponibilidad */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Stock y Disponibilidad</Text>
        
        <Text style={styles.label}>Cantidad en Stock</Text>
        <TextInput
          style={[styles.input, disabled && styles.inputDisabled]}
          placeholder="100"
          placeholderTextColor={theme.textSecondary}
          value={formData.stock_quantity}
          onChangeText={handleStockChange}
          keyboardType="numeric"
          editable={!disabled}
        />
        
        <Text style={[styles.helperText, { color: theme.textSecondary }]}>
          Deja en 0 si no manejas stock físico
        </Text>

        {/* Switches */}
        <View style={styles.switchContainer}>
          <View style={styles.switchRow}>
            <View style={styles.switchInfo}>
              <Text style={[styles.switchLabel, { color: theme.text }]}>
                Producto Disponible
              </Text>
              <Text style={[styles.switchDescription, { color: theme.textSecondary }]}>
                Los clientes pueden ordenar este producto
              </Text>
            </View>
            <Switch
              value={formData.is_available}
              onValueChange={(value) => handleInputChange('is_available', value)}
              disabled={disabled}
              trackColor={{ false: theme.border, true: theme.primary + '80' }}
              thumbColor={formData.is_available ? theme.primary : theme.textSecondary}
            />
          </View>
          
          <View style={styles.switchRow}>
            <View style={styles.switchInfo}>
              <Text style={[styles.switchLabel, { color: theme.text }]}>
                Producto Destacado
              </Text>
              <Text style={[styles.switchDescription, { color: theme.textSecondary }]}>
                Aparecerá primero en el menú del restaurante
              </Text>
            </View>
            <Switch
              value={formData.is_featured}
              onValueChange={(value) => handleInputChange('is_featured', value)}
              disabled={disabled}
              trackColor={{ false: theme.border, true: theme.primary + '80' }}
              thumbColor={formData.is_featured ? theme.primary : theme.textSecondary}
            />
          </View>
        </View>
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
    marginBottom: 15,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfWidth: {
    flex: 1,
    marginRight: 10,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.text,
    marginBottom: 10,
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
  inputDisabled: {
    backgroundColor: theme.background,
    opacity: 0.6,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  characterCount: {
    fontSize: 12,
    textAlign: 'right',
    marginTop: 5,
    marginBottom: 10,
  },
  helperText: {
    fontSize: 12,
    fontStyle: 'italic',
    marginTop: 5,
    marginBottom: 20,
  },
  switchContainer: {
    marginTop: 10,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 15,
    backgroundColor: theme.cardBackground,
    borderRadius: 12,
    marginBottom: 10,
  },
  switchInfo: {
    flex: 1,
    marginRight: 15,
  },
  switchLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 3,
  },
  switchDescription: {
    fontSize: 12,
    lineHeight: 16,
  },
});

export default ProductForm;